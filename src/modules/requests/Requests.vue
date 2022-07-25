<template>
  <div>
    <div class="action-bar">
      <div class="container">
        <search :placeholder="$t('search.request')" :query="searchTerm" @input="setSearchTerm" />
      </div>
    </div>
    <div class="section">
      <div class="container">
        <header>
          <h1>
            {{ $t('request.requests') }} <span v-if="filteredData">({{ filteredData.length }})</span>
          </h1>
        </header>
        <div class="filter">
          <b-radio v-model="radioButton" name="requests" native-value="all">
            {{ $t('request.show_all_requests') }}
          </b-radio>
          <b-radio v-model="radioButton" name="requests" native-value="own">
            <span>{{ $t('request.show_my_requests') }}</span>
          </b-radio>
          <b-radio v-model="radioButton" name="requests" native-value="assigned">
            <span>{{ $t('request.show_requests_my_institution') }}</span>
          </b-radio>
        </div>
        <div>
          <b-table
            :data="filteredData"
            :row-class="(row, index) => (row.status === 'withdrawn' ? 'row disabled' : 'row')"
            :mobile-cards="false"
            :paginated="filteredData.length > 10"
            :per-page="perPage"
            :current-page.sync="currentPage"
            :default-sort-direction="defaultSortDirection"
            :sort-icon="sortIcon"
            :sort-icon-size="sortIconSize"
            :default-sort="defaultSort"
            @select="showDetails"
            @sort="(field, order) => setSorting(field, order)"
            hoverable
            :loading="loading"
          >
            <b-table-column field="title" label="Title" sortable v-slot="props">
              <div class="emphasized">{{ props.row.title }}</div>
            </b-table-column>
            <b-table-column field="creator.firstName" label="Requester" sortable v-slot="props">
              {{ props.row.creator.firstName }} {{ props.row.creator.lastName }}
            </b-table-column>
            <b-table-column field="requestType" label="Request type" width="150" sortable v-slot="props">{{
              props.row.requestType
            }}</b-table-column>
            <b-table-column
              field="requestDate"
              label="Request date"
              width="150"
              sortable
              :custom-sort="sortByDate"
              v-slot="props"
              >{{ setDate(props.row.requestDate) }}</b-table-column
            >
            <b-table-column field="status" label="Status" width="150" sortable v-slot="props">
              <b-tag class="status-tag" rounded :class="$t(`status.class.${props.row.status}`)">{{
                $t(`status.${props.row.status}`)
              }}</b-tag>
            </b-table-column>
            <b-table-column
              v-if="isAllowed('request_edit')"
              cell-class="no-pointer-events"
              field="actions"
              width="125"
              label="Actions"
              v-slot="props"
            >
              <div class="action-btns">
                <b-tooltip v-if="isAllowed('request_delete')" label="delete request" type="is-dark">
                  <b-button
                    :disabled="isDisabled(props.row)"
                    class="delete-action is-small"
                    @click.stop="deleteRequest(props.row)"
                  >
                    <i class="feather icon-trash-2" />
                  </b-button>
                </b-tooltip>
                <b-tooltip v-if="isAllowed('request_withdraw')" label="withdraw request" type="is-dark">
                  <b-button
                    :disabled="props.row.status === 'draft' || props.row.status === 'withdrawn'"
                    class="disable-action is-small"
                    @click.stop="disableRequest(props.row)"
                  >
                    <i class="feather icon-slash" />
                  </b-button>
                </b-tooltip>
                <b-tooltip v-if="isAllowed('request_download')" label="download request" type="is-dark">
                  <b-button
                    :disabled="props.row.status !== 'approved' && props.row.status !== 'scoring'"
                    class="default-action is-small"
                    @click.stop="downloadRequest(props.row)"
                  >
                    <i class="feather icon-download" />
                  </b-button>
                </b-tooltip>
              </div>
            </b-table-column>

            <template slot="empty">{{ $t('request.no_requests_found') }}</template>
            <template slot="bottom-left">
              <pager :total="filteredData.length" :perPage="perPage" @input="setPerPage" />
            </template>
          </b-table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { setDate, search, setQuery } from '@/modules/core/utils/helpers';
import {
  withdrawRequest,
  deleteRequest,
  downLoadRequest,
  fetchFilteredRequests,
  fetchAssignedRequests
} from '@/services/requestsService';
import { getProfile, isAllowed, isAdmin } from '@/modules/core/utils/auth';
import Search from '@/modules/core/components/ui/Search';
import Pager from '@/modules/core/components/ui/Pager';

export default {
  components: {
    Search,
    Pager
  },

  computed: {
    userProfile() {
      return getProfile();
    },

    isAdmin() {
      return isAdmin();
    },

    filteredData() {
      if (this.data && this.data.length && this.searchTerm) {
        return this.data.filter(d => search(d, this.searchTerm));
      }
      return this.data;
    },

    isCountryBasedRole() {
      return (
        !this.isAdmin &&
        (this.userProfile.groups.includes('ta scorer') || this.userProfile.groups.includes('taf admin'))
      );
    },

    isTafAdmin() {
      return !this.isAdmin && this.userProfile.groups.includes('taf admin');
    },

    isTaScorer() {
      return !this.isAdmin && this.userProfile.groups.includes('ta scorer');
    },

    isTaCoordinator() {
      return !this.isAdmin && this.userProfile.groups.includes('ta coordinator');
    }
  },

  data() {
    return {
      data: [],
      defaultSort: this.$route.query.orderBy || 'requestDate',
      defaultSortDirection: this.$route.query.direction || 'asc',
      sortIcon: 'arrow-up',
      sortIconSize: 'is-small',
      loading: false,
      currentPage: 1,
      perPage: Number(this.$route.query.perPage) || 10,
      radioButton: 'all',
      searchTerm: this.$route.query.q || ''
    };
  },

  watch: {
    radioButton: {
      async handler(value) {
        const criteria = [{ field: 'deleted_at', type: 'eq', value: null }];
        if (!this.isAllowed('request_draft_view')) {
          criteria.push({ field: 'status', type: 'notEq', value: 'draft' });
        }
        if (value === 'all') {
          this.data = await this.fetchAllRequests(criteria);
        } else if (value === 'own') {
          this.data = await this.fetchOwnRequests(criteria);
        } else {
          this.data =
            this.isCountryBasedRole && this.userProfile.attributes?.countryCode
              ? await this.fetchTaRequests(criteria)
              : await this.fetchAssignedRequests();
        }
      },
      immediate: true
    }
  },

  created() {
    this.checkQuery();
  },

  methods: {
    setDate(date) {
      return setDate(date);
    },

    isAllowed(permission) {
      return isAllowed(permission);
    },

    async fetchAllRequests(criteria) {
      const va = await this.fetchVaRequests(criteria);
      const ta = await this.fetchTaRequests(criteria);
      let assigned = await this.fetchAssignedRequests();

      if (this.isCountryBasedRole && this.userProfile.attributes?.countryCode) {
        const countryBased = await this.fetchTaRequests(criteria);
        assigned = [...assigned, ...countryBased];
      }

      let data = [...va, ...ta, ...assigned];

      if (this.isAllowed('request_draft_view') && !this.isAdmin) {
        data = data.filter(d => !(d.status === 'draft' && d.creator.id !== this.userProfile.id));
      }

      data = this.uniqueRequests(data);
      return data;
    },

    async fetchVaRequests(criteria) {
      criteria = [...criteria, { field: 'type', type: 'eq', value: 'Virtual Access' }];
      const queries = [{ type: 'and', criteria }];

      try {
        const response = await fetchFilteredRequests(queries);
        return response.data.data.rows;
      } catch (error) {
        console.log(error);
      }
    },

    /*
      TA Coordinator: all TA requests not draft own institution
      TAF Admin: all TA requests not draft own country
      TA Scorer: all TA requests approved own country
    */
    async fetchTaRequests(criteria) {
      // if (this.isTaCoordinator) return [];
      criteria = this.isCountryBasedRole
        ? [...criteria, { field: 'country_code', type: 'eq', value: this.userProfile.attributes?.countryCode }]
        : [...criteria, { field: 'type', type: 'eq', value: 'Transnational Access' }];

      const queries = [{ type: 'and', criteria }];

      try {
        const response = await fetchFilteredRequests(queries);
        const { rows } = response.data.data;

        if (this.isTaScorer) {
          return rows.filter(row => row.status === 'approved' || row.status === 'scoring');
        }
        if (this.isTafAdmin) {
          return rows.filter(row => row.status !== 'draft');
        }
        if (!this.isAdmin) {
          return rows.filter(d => d.creator.id === this.userProfile.id);
        }
        return rows;
      } catch (error) {
        console.log(error);
      }
    },

    async fetchAssignedRequests() {
      let criteria = [{ field: 'coordinator_id', type: 'eq', value: this.userProfile.id }];
      let queries = [{ type: 'and', criteria }];

      try {
        const response = await fetchAssignedRequests(queries);
        const requests = response.data.data.rows;

        if (requests.length) {
          const reqIds = requests.map(req => req.requestId);
          criteria = [
            { field: 'status', type: 'notEq', value: 'draft' },
            { field: 'id', type: 'in', value: reqIds }
          ];
          queries = [{ type: 'and', criteria }];

          const filteredResponse = await fetchFilteredRequests(queries);
          return filteredResponse.data.data.rows;
        }
        return [];
      } catch (error) {
        console.log(error);
      }
    },

    async fetchOwnRequests(criteria) {
      if (!this.data.length) {
        this.data = await this.fetchAllRequests(criteria);
      }
      return this.data.filter(d => d.creator.id === this.userProfile.id);
    },

    uniqueRequests(requests) {
      return requests.filter((request, index, self) => index === self.findIndex(t => t.id === request.id));
    },

    sortByDate(a, b, isAsc) {
      a = a.requestDate;
      b = b.requestDate;
      const aDate = new Date(Date.UTC(a[0], a[1] - 1, a[2], a[3], a[4], a[5])).getTime();
      const bDate = new Date(Date.UTC(b[0], b[1] - 1, b[2], b[3], b[4], b[5])).getTime();
      return isAsc ? bDate - aDate : aDate - bDate;
    },

    isDisabled(row) {
      let disabled = true;
      if (row.status === 'draft') {
        if (row.creator.email === this.userProfile.email || this.isAllowed('request_draft_view')) {
          disabled = false;
        }
      }
      return disabled;
    },

    showDetails(event) {
      const { query } = this.$route;
      const type = event.requestType === 'Virtual Access' ? 'va' : 'ta';
      if (event.status === 'withdrawn') return;

      if (
        event.status !== 'approved' &&
        event.status !== 'scoring' &&
        event.creator.email === this.userProfile.email &&
        this.isAllowed('request_edit')
      ) {
        this.$router.push({
          name: `calls-edit-${type}-request`,
          params: { id: event.callId, reqid: event.id }
        });
      } else {
        this.$router.push({
          name: `request-details-${type}`,
          params: { id: event.id },
          query
        });
      }
    },

    deleteRequest(request) {
      this.loading = true;
      this.$buefy.dialog.confirm({
        confirmText: String(this.$t('delete')),
        cancelText: String(this.$t('cancel')),
        message: 'Are you sure you want to delete this draft?',
        type: 'is-danger',
        onConfirm: async () => {
          try {
            await deleteRequest(request.id);
            setTimeout(() => {
              this.data = this.data.filter(d => d.id !== request.id);
              this.loading = false;
              this.isOpen = -1;
            }, 1500);
          } catch (error) {
            this.loading = false;
          }
        },
        onCancel: () => {
          this.loading = false;
        }
      });
    },

    disableRequest(request) {
      this.loading = true;
      this.$buefy.dialog.confirm({
        confirmText: String(this.$t('withdraw')),
        cancelText: String(this.$t('cancel')),
        message: 'Are you sure you want to withdraw this request?',
        type: 'is-warning',
        onConfirm: async () => {
          try {
            const response = await withdrawRequest(request.id);
            if (response.status === 200) {
              setTimeout(() => {
                request.status = 'withdrawn';
                this.loading = false;
                this.isOpen = -1;
              }, 1500);
            }
          } catch (error) {
            this.loading = false;
          }
        },
        onCancel: () => {
          this.loading = false;
        }
      });
    },

    async downloadRequest(request) {
      try {
        const response = await downLoadRequest(request.id);
        const filename = response.headers['content-disposition'].split('filename=').pop().replace(/['"]+/g, '');
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `request_${filename}`);
        document.body.appendChild(link);
        link.click();
      } catch (error) {
        console.log(error);
      }
    },

    setSearchTerm(event) {
      this.searchTerm = event;
      const query = { ...this.$route.query, q: this.searchTerm };
      setQuery(query);
    },

    setSorting(field, order) {
      this.defaultSort = field;
      this.defaultSortDirection = order;
      const query = { ...this.$route.query, orderBy: this.defaultSort, direction: this.defaultSortDirection };
      setQuery(query);
    },

    setPerPage(count) {
      this.perPage = count;
      const query = { ...this.$route.query, perPage: this.perPage };
      setQuery(query);
    },

    checkQuery() {
      const query = {
        ...this.$route.query,
        orderBy: this.defaultSort,
        direction: this.defaultSortDirection,
        perPage: this.perPage,
        q: this.searchTerm
      };
      setQuery(query);
    }
  }
};
</script>

<style lang="scss" scoped>
.status-tag {
  width: 100%;
  max-width: 120px;
}

.filter {
  margin: 2em 0;
  .b-radio.radio {
    margin-right: 1em;
  }
}
</style>
