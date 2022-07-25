<template>
  <div>
    <h3 class="header">Resource needs</h3>
    <p>
      In order to manage facilities efficiently, it is important that applicants give a clear indication of the
      equipment that you will wish during your visit. Therefore it is necessary to enumerate the days of access required
      for each facility/piece of equipment. You do not have to request compound microsccopes, these will be provided for
      you.
    </p>
    <p>
      Applicants are strongly advised to contact the appropriate Facility Manager via the Host before submitting an
      application.
    </p>

    <form @submit.prevent>
      <component
        v-for="field in fields"
        :is="field.type"
        :key="field.id"
        :value="field.fields ? formData.fieldValues : formData.fieldValues[field.id]"
        :path="[field.id]"
        :fields="field.fields"
        :context="{ resource: 'requests' }"
        :label="field.label"
        :editable="editable"
        v-bind="{ ...field.options }"
      />
    </form>

    <div v-if="institutionFacilities.length" class="facilities">
      <div
        v-for="(institution, index) in institutionFacilities"
        :key="index"
        class="facility-wrapper"
        :class="{ approved: institution.status === 'approved' }"
      >
        <div class="institution-name">
          {{ institution.name }}
          <b-tag
            v-if="formData.status !== 'draft' && checkStatus(institution)"
            class="tag"
            rounded
            :class="$t(`status.class.${checkStatus(institution)}`)"
            >{{ $t(`status.${checkStatus(institution)}`) }}</b-tag
          >
        </div>
        <div v-for="(field, j) in institution.facilities" :key="j" class="services">
          <form @submit.prevent>
            <field-group
              :is="field.type"
              :value="field.institution.fieldValues[field.id]"
              :path="[field.id]"
              :fields="field.fields"
              :context="{ resource: 'requests', institutionId: field.institution.id }"
              :label="field.label"
              :editable="editable"
              v-bind="{ ...field.options }"
            />
          </form>
        </div>

        <request-approval
          v-if="isAllowed('request_approve') && formData.status !== 'draft'"
          :status="institution.status"
          :requestId="formData.id"
          :editable="isOwnInstitution(institution.id)"
        />
      </div>
    </div>
  </div>
</template>

<script>
import FieldRow from '@/modules/core/components/ui/formElements/FieldRow';
import FieldGroup from '@/modules/core/components/ui/formElements/FieldGroup';
import data from '../../schemas/fields-ta.json';
import { updateField } from '@/services/requestsService';
import { fetchFacilitiesByInstitutionId } from '@/services/facilitiesService';
import { sortArray } from '@/modules/core/utils/helpers';
import RequestApproval from '../RequestApproval';
import { isAllowed, isOwnInstitution } from '@/modules/core/utils/auth';

export default {
  components: {
    FieldRow,
    FieldGroup,
    RequestApproval
  },

  props: {
    formData: Object,
    editable: {
      type: Boolean,
      default: true
    },
    maxWorkingDays: Number
  },

  data() {
    return {
      fields: data.resourceNeeds,
      institutionFacilities: [],
      requestId: null
    };
  },

  watch: {
    'formData.institutions': {
      handler(value, oldValue) {
        if (value && value.length && value !== oldValue) {
          this.fetchFacilities();
        }
      },
      immediate: true,
      deep: true
    },

    maxWorkingDays: {
      handler(value, oldValue) {
        if (value && oldValue && value !== oldValue) {
          this.fetchFacilities();
        }
      }
    }
  },

  created() {
    this.$root.$on('updateField', this.handleFormField);
    this.requestId = this.$route.params.reqid;
  },

  beforeDestroy() {
    this.$root.$off('updateField');
  },

  methods: {
    isAllowed(permission) {
      return isAllowed(permission);
    },

    buildFacilityFields(institution, facilities) {
      if (!facilities.length) return;

      return facilities.map((facility, facIndex) => {
        const group = {
          type: 'FieldGroup',
          id: 'facility',
          label: facility.fieldValues.nameEng.value,
          fields: [],
          options: {
            subheader: true
          }
        };

        Object.values(facility.fieldValues.instruments).map((instrument, instrIndex) => {
          const maxWorkingDays = this.maxWorkingDays || 15;
          const row = {
            type: 'FieldRow',
            id: `facility[${facIndex}].service[${instrIndex}]`,
            label: instrument.name.value,
            options: {
              field: 'SelectField',
              fieldOptions: {
                placeHolder: 'Amount of days',
                suffix: 'days',
                options: Array.from(Array(maxWorkingDays + 1), (x, i) => String(i))
              }
            }
          };
          group.fields.push(row);
          const value = institution.fieldValues.facility[facIndex]?.service[instrIndex] || null;
          this.$set(institution.fieldValues.facility, row.id, value);
          group.institution = institution;
        });
        return group;
      });
    },

    async handleFormField(payload) {
      if (!payload.fieldId) return;
      if (!payload.fieldId.includes('facility')) return;

      const facilityPayload = {
        institutionId: payload.context.institutionId,
        fieldId: payload.fieldId.split('.'),
        value: payload.value
      };
      await updateField(this.requestId, facilityPayload);
    },

    fetchFacilities() {
      this.institutionFacilities = [];
      this.formData.institutions.map(async institution => {
        const response = await fetchFacilitiesByInstitutionId(institution.id);
        const { name, id, status } = institution;
        const facilities = this.buildFacilityFields(institution, response.data.data.rows);
        if (facilities) {
          this.institutionFacilities.push({
            name,
            id,
            status,
            facilities
          });
          this.institutionFacilities = sortArray(this.institutionFacilities, 'id');
        }
      });
    },

    checkStatus(institution) {
      return this.isOwnInstitution(institution.id) && institution.status === 'submitted'
        ? 'toBeChecked'
        : institution.status;
    },

    isOwnInstitution(institutionId) {
      return isOwnInstitution(institutionId);
    }
  }
};
</script>

<style lang="scss" scoped>
.facility-wrapper {
  border: 1px solid $grey;
  margin-bottom: 2em;
  &.approved {
    border-color: $success;
  }
}

.institution-name {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5em 1em;
  height: 3em;
  font-weight: 600;
}

::v-deep .field-rows {
  margin-right: 1em;
}
</style>
