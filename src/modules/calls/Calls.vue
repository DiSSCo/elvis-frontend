<template>
  <div>
    <div class="action-bar">
      <div class="container">
        <div></div>
        <b-button v-if="isAllowed('call_create')" type="is-primary" @click.stop="newCall">
          <span> <i class="feather icon-plus" /> {{ $t('call.new_call') }} </span>
        </b-button>
      </div>
    </div>
    <div class="section">
      <div class="container">
        <header>
          <h1>
            {{ $t('call.calls') }} <span v-if="data">({{ data.length }})</span>
          </h1>
        </header>

        <b-table
          :data="data"
          :row-class="(row, index) => 'row'"
          :mobile-cards="false"
          :default-sort-direction="defaultSortDirection"
          :sort-icon="sortIcon"
          :sort-icon-size="sortIconSize"
          default-sort="title"
          @select="row => showDetails(row)"
          hoverable
          :loading="loading"
        >
          <b-table-column field="name" label="Title" sortable v-slot="props">{{ props.row.name }}</b-table-column>
          <b-table-column field="type" label="Type" sortable v-slot="props">{{
            $t(`request.${props.row.type}`)
          }}</b-table-column>
          <b-table-column field="startDate" label="Start date" sortable :custom-sort="sortByStartDate" v-slot="props">{{
            setDate(props.row.startDate)
          }}</b-table-column>
          <b-table-column field="endDate" label="End date" sortable :custom-sort="sortByEndDate" v-slot="props">{{
            setDate(props.row.endDate)
          }}</b-table-column>
          <b-table-column field="status" label="Status" width="150" sortable v-slot="props">
            <b-tag class="tag" rounded :class="$t(`status.class.${props.row.status}`)">{{
              $t(`status.${props.row.status}`)
            }}</b-tag>
          </b-table-column>
          <b-table-column v-if="isAllowed('call_edit')" field="actions" width="125" label="Actions" v-slot="props">
            <div class="action-btns">
              <b-tooltip label="edit call" type="is-dark">
                <b-button class="default-action is-small" @click.stop="editCall(props.row.id)">
                  <i class="feather icon-edit-1" />
                </b-button>
              </b-tooltip>
              <b-tooltip label="delete call" type="is-dark">
                <b-button class="delete-action is-small" @click.stop="deleteCall(props.row.id)">
                  <i class="feather icon-trash-2" />
                </b-button>
              </b-tooltip>
            </div>
          </b-table-column>

          <template slot="empty">{{ $t('call.no_calls_found') }}</template>
        </b-table>
      </div>
    </div>
  </div>
</template>

<script>
import { setDate } from '@/modules/core/utils/helpers';
import { fetchCalls, deleteCall } from '@/services/callsService';
import { isAllowed } from '@/modules/core/utils/auth';

export default {
  data() {
    return {
      data: [],
      defaultSortDirection: 'asc',
      sortIcon: 'arrow-up',
      sortIconSize: 'is-small',
      loading: false
    };
  },

  async created() {
    this.getCalls();
  },

  methods: {
    setDate(date) {
      return setDate(date);
    },

    isAllowed(permission) {
      return isAllowed(permission);
    },
    async getCalls() {
      try {
        const response = await fetchCalls();
        this.data = response.data.data.rows;
      } catch (error) {
        console.log('error: ', error);
      }
    },

    showDetails(call) {
      const params = { id: call.id };
      this.$router.push({
        name: 'call-details',
        params
      });
    },

    async newCall() {
      this.$router.push({
        name: 'new-call'
      });
    },

    editCall(id) {
      const params = { id };
      this.$router.push({
        name: 'edit-call',
        params
      });
    },

    deleteCall(id) {
      this.loading = true;
      this.$buefy.dialog.confirm({
        confirmText: String(this.$t('delete')),
        cancelText: String(this.$t('cancel')),
        message: 'Are you sure you want to delete this call?',
        type: 'is-danger',
        onConfirm: () => {
          deleteCall(id);
          setTimeout(() => {
            this.getCalls();
            this.loading = false;
          }, 1500);
        },
        onCancel: () => {
          this.loading = false;
        }
      });
    },

    sortByStartDate(a, b, isAsc) {
      return this.sortByDate(a.startDate, b.startDate, isAsc);
    },

    sortByEndDate(a, b, isAsc) {
      return this.sortByDate(a.endDate, b.endDate, isAsc);
    },

    sortByDate(a, b, isAsc) {
      const aDate = new Date(Date.UTC(a[0], a[1] - 1, a[2])).getTime();
      const bDate = new Date(Date.UTC(b[0], b[1] - 1, b[2])).getTime();
      return isAsc ? bDate - aDate : aDate - bDate;
    }
  }
};
</script>

<style lang="scss" scoped>
.is-large {
  font-size: 24px;
}
.edit-call:not([disabled]) {
  transition: 0.2s ease-out;
  pointer-events: auto;
  border-color: $grey-dark;
  &:hover {
    background: $blue;
    border-color: $blue;
    i {
      color: $white;
    }
  }
}
</style>
