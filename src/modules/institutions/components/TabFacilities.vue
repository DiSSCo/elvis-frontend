<template>
  <div>
    <o-button v-if="isAllowed('facility_create') && isOwnInstitution"
      variant="primary"
      @click.stop="createNewFacility"
    >
      <span> <i class="feather icon-plus" /> {{ $t('facility.new_facility') }} </span>
    </o-button>

    <div v-if="facilities" class="facility-view">
      <o-table
        :data="facilities"
        :mobile-cards="false"
        @select="showFacility"
        hoverable
      >
        <o-table-column field="fieldValues.nameEng.value" label="Facility" sortable v-slot="props">
          {{ props.row.fieldValues.nameEng.value }}
        </o-table-column>
        <o-table-column field="fieldValues.joinedInstruments"
          label="Instruments & Services"
          sortable
          v-slot="props"
        >
          {{ props.row.fieldValues.joinedInstruments.join(', ') }}
        </o-table-column>
        <o-table-column field="actions" width="125" label="Actions" v-slot="props">
          <div class="action-btns">
            <o-tooltip
              v-if="isAllowed('facility_edit')"
              :label="canEdit ? 'edit facility' : 'action disabled due to active TA call'"
              variant="primary"
            >
              <o-button class="tableButton disable-action" size="small" outlined
                :disabled="!canEdit"
                @click.stop="editFacility(props.row)"
              >
                <i class="feather icon-edit-1" />
              </o-button>
            </o-tooltip>
            <o-tooltip
              v-if="isAllowed('facility_delete')"
              :label="canEdit ? 'delete facility' : 'action disabled due to active TA call'"
              variant="primary"
            >
              <o-button class="tableButton delete-action" size="small" outlined
                @click.stop="deleteFacility(props.row)"
                :disabled="!canEdit"
              >
                <i class="feather icon-trash-2" />
              </o-button>
            </o-tooltip>
          </div>
        </o-table-column>

        <template v-slot:empty>
          {{ $t('facility.no_facilities_found') }}
        </template>
      </o-table>
    </div>
  </div>
</template>

<script>
import { isAllowed, isOwnInstitution } from '@/modules/core/utils/auth';
import { deleteFacility } from '@/services/facilitiesService';
import { checkActiveTaCall } from '@/services/callsService';
import Dialog from '@/modules/core/components/ui/Dialog.vue';

export default {
  props: {
    institution: {
      type: [Object, Array],
    },
    facilities: [Array],
  },

  computed: {
    isOwnInstitution() {
      const { instId } = this.$route.params;
      return isOwnInstitution(instId);
    },

    isActiveTaCall() {
      return this.activeCall;
    },

    canEdit() {
      return this.isAllowed('facility_edit') && this.isOwnInstitution && !this.isActiveTaCall;
    },
  },

  data() {
    return {
      activeCall: false,
    };
  },

  async created() {
    this.activeCall = await checkActiveTaCall();
  },

  methods: {
    isAllowed(permission) {
      return isAllowed(permission);
    },

    showFacility(event) {
      this.$router.push({
        name: 'facility-details',
        params: { instId: event.institutionId, id: event.id },
      });
    },

    createNewFacility() {
      this.$router.push({
        name: 'new-facility',
        params: { instId: this.institution.id },
      });
    },

    editFacility(facility) {
      this.$router.push({
        name: 'facility-edit',
        params: {
          instId: facility.institutionId,
          id: facility.id,
        },
      });
    },

    deleteFacility(facility) {
      this.loading = true;

      this.$oruga.modal.open({
        component: Dialog,
        props: {
          confirmText: String(this.$t('delete')),
          cancelText: String(this.$t('cancel')),
          message: 'Are you sure you want to delete this facility?',
        },
        trapFocus: true,
        events: {
          onConfirm: async () => {
            this.$oruga.modal.closeAll();

            await deleteFacility(facility);
            this.$emit('reload');
            this.loading = false;
          },
          onCancel: () => {
            this.$oruga.modal.closeAll();

            this.loading = false;
          },
        },
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.facility-view {
  margin-top: 1em;
}
</style>

<style lang="css">
td {
  font-size: 14px !important;
  padding-top: 1em !important;
  padding-bottom: 1em !important;
}

td:hover {
  cursor: pointer !important;
}

.td-center {
  vertical-align: middle !important;
}
</style>
