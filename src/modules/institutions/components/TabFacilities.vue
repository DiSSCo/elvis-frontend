<template>
  <div>
    <b-button v-if="isAllowed('facility_create') && isOwnInstitution" type="is-primary" @click.stop="createNewFacility">
      <span> <i class="feather icon-plus" /> {{ $t('facility.new_facility') }} </span>
    </b-button>

    <div v-if="facilities" class="facility-view">
      <b-table
        :data="facilities"
        :row-class="(row, index) => 'row'"
        :mobile-cards="false"
        @select="showFacility"
        hoverable
      >
        <b-table-column field="fieldValues.nameEng.value" label="Facility" sortable v-slot="props">
          {{ props.row.fieldValues.nameEng.value }}
        </b-table-column>
        <b-table-column field="fieldValues.joinedInstruments" label="Instruments & Services" sortable v-slot="props">
          {{ props.row.fieldValues.joinedInstruments.join(', ') }}
        </b-table-column>
        <b-table-column field="actions" width="125" label="Actions" v-slot="props">
          <div class="action-btns">
            <b-tooltip
              v-if="isAllowed('facility_edit')"
              :label="canEdit ? 'edit facility' : 'action disabled due to active TA call'"
              type="is-dark"
            >
              <b-button class="disable-action is-small" @click.stop="editFacility(props.row)" :disabled="!canEdit">
                <i class="feather icon-edit-1" />
              </b-button>
            </b-tooltip>
            <b-tooltip
              v-if="isAllowed('facility_delete')"
              :label="canEdit ? 'delete facility' : 'action disabled due to active TA call'"
              type="is-dark"
            >
              <b-button class="delete-action is-small" @click.stop="deleteFacility(props.row)" :disabled="!canEdit">
                <i class="feather icon-trash-2" />
              </b-button>
            </b-tooltip>
          </div>
        </b-table-column>

        <template slot="empty">
          {{ $t('facility.no_facilities_found') }}
        </template>
      </b-table>
    </div>
  </div>
</template>

<script>
import { isAllowed, isOwnInstitution } from '@/modules/core/utils/auth';
import { deleteFacility } from '@/services/facilitiesService';
import { checkActiveTaCall } from '@/services/callsService';

export default {
  props: {
    institution: {
      type: [Object, Array]
    },
    facilities: [Array]
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
    }
  },

  data() {
    return {
      activeCall: false
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
        params: { instId: event.institutionId, id: event.id }
      });
    },

    createNewFacility() {
      this.$router.push({
        name: 'new-facility',
        params: { instId: this.institution.id }
      });
    },

    editFacility(facility) {
      this.$router.push({
        name: 'facility-edit',
        params: {
          instId: facility.institutionId,
          id: facility.id
        }
      });
    },

    deleteFacility(facility) {
      this.loading = true;
      this.$buefy.dialog.confirm({
        confirmText: String(this.$t('delete')),
        cancelText: String(this.$t('cancel')),
        message: 'Are you sure you want to delete this facility?',
        type: 'is-danger',
        onConfirm: async () => {
          await deleteFacility(facility);
          this.$emit('reload');
          this.loading = false;
        },
        onCancel: () => {
          this.loading = false;
        }
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.facility-view {
  margin-top: 1em;
}
</style>
