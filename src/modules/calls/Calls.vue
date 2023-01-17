<template>
  <div>
    <div class="action-bar">
      <div class="container">
        <div></div>
        <o-button v-if="isAllowed('call_create')" class="primaryButton" @click.stop="newCall">
          <span> <i class="feather icon-plus" /> {{ $t('call.new_call') }} </span>
        </o-button>
      </div>
    </div>
    <div class="section">
      <div class="container">
        <header>
          <h1>
            {{ $t('call.calls') }} <span v-if="data">({{ data.length }})</span>
          </h1>
        </header>

        <o-table :data="isEmpty ? [] : data" hoverable :mobile-cards="hasMobileCards" @select="row => showDetails(row)">
          <o-table-column field="name" label="Title" v-slot:default="props" sortable>
            {{ props.row.name }}
          </o-table-column>

          <o-table-column field="type" label="Type" v-slot:default="props" sortable>
            {{ $t(`request.${props.row.type }`) }}
          </o-table-column>

          <o-table-column field="startDate" label="Start date" v-slot:default="props" sortable>
            {{ setDate(props.row.startDate) }}
          </o-table-column>

          <o-table-column field="endDate" label="End date" v-slot:default="props" sortable>
            {{ setDate(props.row.endDate) }}
          </o-table-column>

          <o-table-column field="status" label="Status" v-slot:default="props" sortable>
            <tag class="tag rounded" :class="$t(`${ props.row.status } `)">
              {{ $t(`status.${ props.row.status }`) }}
            </tag>
          </o-table-column>

          <o-table-column label="Actions" v-slot:default="props">
            <div class="action-btns">
              <o-tooltip label="edit call" variant="primary">
                <o-button class="default-action table-btn tableButton" size="small" outlined
                  @click.stop="editCall(props.row.id)">
                  <i class="feather icon-edit-1" />
                </o-button>
              </o-tooltip>
              <o-tooltip label="delete call" variant="primary">
                <o-button class="delete-action table-btn tableButton" size="small" variant="table" outlined
                  @click.stop="deleteCall(props.row.id)">
                  <i class="feather icon-trash-2" />
                </o-button>
              </o-tooltip>
            </div>
          </o-table-column>
        </o-table>
      </div>
    </div>
  </div>
</template>

<script>
import { setDate } from '@/modules/core/utils/helpers';
import { fetchCalls, deleteCall } from '@/services/callsService';
import { isAllowed } from '@/modules/core/utils/auth';
import Dialog from '@/modules/core/components/ui/Dialog.vue';

export default {
  data() {
    return {
      data: [],
      defaultSortDirection: 'asc',
      sortIcon: 'arrow-up',
      sortIconSize: 'is-small',
      loading: false,
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
        params,
      });
    },

    async newCall() {
      this.$router.push({
        name: 'new-call',
      });
    },

    editCall(id) {
      const params = { id };
      this.$router.push({
        name: 'edit-call',
        params,
      });
    },

    deleteCall(id) {
      this.loading = true;

      this.$oruga.modal.open({
        component: Dialog,
        props: {
          confirmText: String(this.$t('delete')),
          cancelText: String(this.$t('cancel')),
          message: 'Are you sure you want to delete this call?',
        },
        trapFocus: true,
        events: {
          onConfirm: () => {
            this.$oruga.modal.closeAll();

            deleteCall(id);

            setTimeout(() => {
              this.getCalls();
              this.loading = false;
            }, 1500);
          },
          onCancel: () => {
            this.$oruga.modal.closeAll();

            this.loading = false;
          },
        },
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
    },
  },
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

<style lang="css">
.available {
  background-color: #3dca77 !important;
  color: white !important;
  border-radius: 9999px !important;
}

td {
  font-size: 14px !important;
  padding-top: 1em !important;
  padding-bottom: 1em !important;
}

td:hover {
  cursor: pointer !important;
}
</style>
