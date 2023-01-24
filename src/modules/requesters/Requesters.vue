<template>
  <div v-if="requesters">
    <div class="action-bar">
      <div class="container">
        <search :placeholder="$t('search.requester')" :query="searchTerm" @input="setSearchTerm" />
      </div>
    </div>
    <div class="section">
      <div class="container">
        <header>
          <h1>
            {{ $t('requester.requesters') }}
            <span v-if="filteredData">({{ filteredData.length }})</span>
          </h1>
        </header>
        <div>
          <o-table
            :data="filteredData"
            :row-class="(row, index) => 'row'"
            :mobile-cards="false"
            :paginated="filteredData.length > 10"
            :per-page="perPage"
            :default-sort-direction="defaultSortDirection"
            :sort-icon="sortIcon"
            :sort-icon-size="sortIconSize"
            :default-sort="defaultSort"
            hoverable
            @select="showDetails"
            @sort="(field, order) => setSorting(field, order)"
          >
            <o-table-column class="profile-pic" custom-key="profilePic" width="70" v-slot="props">
              <gravatar :initials="getInitials(props.row.firstName, props.row.lastName)" />
            </o-table-column>
            <o-table-column field="firstName" label="Name" sortable v-slot="props">
              <div class="full-name">{{ props.row.firstName }} {{ props.row.lastName }}</div>
            </o-table-column>
            <o-table-column field="email" label="Email" sortable v-slot="props">
              {{ props.row.email }}
            </o-table-column>
            <o-table-column field="attributes.orcId"
              :label="$t('profile.orcid')"
              sortable
              v-slot="props"
            >
              <div class="details">
                <a
                  v-if="props.row.attributes && props.row.attributes.orcId"
                  :href="`//orcid.org/${orcId(props.row.attributes.orcId)}`"
                  target="blank"
                  @click.stop
                  >{{ orcId(props.row.attributes.orcId) }}</a
                >
                <span v-else>-</span>
              </div>
            </o-table-column>
            <o-table-column field="bannedAt" label="Status" width="130" sortable v-slot="props">
              <div>
                <o-tooltip :label="props.row.bannedAt ? 'Disabled' : 'Enabled'" variant="primary">
                  <i
                    class="feather is-large"
                    :class="props.row.bannedAt ?
                      'icon-x has-text-danger'
                      : 'icon-check has-text-success'"
                  />
                </o-tooltip>
              </div>
            </o-table-column>

            <template v-slot:empty>
              {{ $t('requester.no_requesters_found') }}
            </template>
            <template v-slot:bottom-left>
              <pager :total="filteredData.length" :perPage="perPage" @input="setPerPage" />
            </template>
          </o-table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { sanitizeOrcId, search, setQuery } from '@/modules/core/utils/helpers';
import { isAllowed } from '@/modules/core/utils/auth';
import { fetchUsers } from '@/services/usersService';
import Search from '@/modules/core/components/ui/Search.vue';
import Gravatar from '@/modules/core/components/ui/Gravatar.vue';
import Pager from '@/modules/core/components/ui/Pager.vue';

export default {
  components: {
    Search,
    Gravatar,
    Pager,
  },

  computed: {
    filteredData() {
      if (this.requesters && this.requesters.length && this.searchTerm) {
        return this.requesters.filter((d) => search(d, this.searchTerm));
      }
      return this.requesters;
    },
  },

  data() {
    return {
      requesters: null,
      defaultSort: this.$route.query.orderBy || 'firstName',
      defaultSortDirection: this.$route.query.direction || 'asc',
      sortIcon: 'arrow-up',
      sortIconSize: 'is-small',
      searchTerm: this.$route.query.q || '',
      currentPage: 1,
      perPage: Number(this.$route.query.perPage) || 10,
    };
  },

  created() {
    this.getUsers();
    this.checkQuery();
  },

  methods: {
    showInstitution(attrs) {
      const [id] = attrs?.relatedInstitutionId || ['-'];
      return id;
    },

    async getUsers() {
      try {
        const response = await fetchUsers();
        this.requesters = response.data.data.rows;
      } catch (error) {
        console.log(error);
      }
    },

    isAllowed(permission) {
      return isAllowed(permission);
    },

    getInitials(firstName, lastName) {
      const firstChar = firstName.charAt(0);
      const lastChar = lastName.split(' ').pop().charAt(0);
      return `${firstChar}${lastChar}`;
    },

    showDetails(event) {
      const params = { id: event.id };
      const { query } = this.$route;
      this.$router.push({
        name: 'requester-details',
        params,
        query,
      });
    },

    orcId(id) {
      return sanitizeOrcId(id);
    },

    setSearchTerm(event) {
      this.searchTerm = event;
      const query = { ...this.$route.query, q: this.searchTerm };
      setQuery(query);
    },

    setSorting(field, order) {
      this.defaultSort = field;
      this.defaultSortDirection = order;
      const query = {
        ...this.$route.query,
        orderBy: this.defaultSort,
        direction: this.defaultSortDirection,
      };
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
        q: this.searchTerm,
      };
      setQuery(query);
    },
  },
};
</script>

<style lang="scss" scoped>
.is-large {
  font-size: 24px;
}
</style>
