<template>
  <div>
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
        v-bind="{ ...field.options, validation: this.v$.formData.fieldValues[field.id] || this.v$.formData.institutions }"
      />
    </form>
    <div v-if="institutionHosts.length" class="institution-hosts">
      <div v-for="(host, index) in institutionHosts" :key="index" class="hosts">
        <form @submit.prevent>
          <component
            :is="host.type"
            :path="[host.id]"
            :value="formData.institutions[index].fieldValues.host"
            :fields="host.fields"
            :context="{ resource: 'requests', institutionId: host.institutionId }"
            :label="host.label"
            :editable="editable"
            v-bind="{ ...host.options }"
          />
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import useVuelidate from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import FieldRow from '@/modules/core/components/ui/formElements/FieldRow.vue';
import { sortArray } from '@/modules/core/utils/helpers';

import data from '../../schemas/fields-ta.json';

export default {
  components: {
    FieldRow,
  },

  props: {
    formData: Object,
    institutions: Array,
    editable: {
      type: Boolean,
      default: true,
    },
  },

  setup() {
    const v$ = useVuelidate();

    return { v$: v$ };
  },

  data() {
    return {
      fields: data.subject,
      institutionHosts: [],
    };
  },

  validations: {
    formData: {
      fieldValues: {
        subject: {
          required,
        },
      },
      institutions: {
        required,
      },
    },
  },

  watch: {
    formData: {
      handler(value, oldValue) {
        if (value !== oldValue) {
          this.setInstitutionsList();
          this.getHostFields();
        }
      },
      deep: true,
      immediate: true,
    },
  },

  methods: {
    setAutocompleteData() {
      const [selectedInstitution] = this.formData?.fieldValues.institution?.value;
      const foundInstitution = this.institutions.find((inst) => inst.name === selectedInstitution);
      const [country] = foundInstitution ? foundInstitution.fieldValues.country?.value : '';

      const found = this.fields.find((field) => field.id === 'institution');
      const filteredInstitutions = country
        ? this.institutions.filter((i) => i.fieldValues.country.value.includes(country))
        : this.institutions;

      found.options.fieldOptions.autoCompleteData = filteredInstitutions.map(
        (inst) => inst.name,
      ).sort();
    },

    setInstitutionsList() {
      const institutionsList = this.formData?.institutions.map((inst) => inst.name);
      this.formData.fieldValues.institution = { type: 'list', value: institutionsList };

      const found = this.fields.find((field) => field.id === 'institution');
      found.options.fieldOptions.removeable = this.formData.status !== 'approved' && this.formData.status !== 'scoring';

      this.setAutocompleteData();
    },

    getHostFields() {
      this.institutionHosts = [];
      this.formData.institutions.map(async (institution) => {
        const hosts = this.buildHostFields(institution);
        if (hosts) {
          this.institutionHosts.push(hosts);
          this.institutionHosts = sortArray(this.institutionHosts, 'id', true);
        }
      });
    },

    buildHostFields(institution) {
      const row = {
        type: 'FieldRow',
        institutionId: institution.id,
        id: 'host',
        label: `Host for institution ${institution.name}`,
        options: {
          field: 'StringField',
          fieldOptions: {
            placeHolder: 'Enter the name of the host',
          },
        },
      };
      institution.fieldValues.host = institution.fieldValues.host?.value || null;
      return row;
    },
  },
};
</script>

<style lang="scss" scoped></style>
