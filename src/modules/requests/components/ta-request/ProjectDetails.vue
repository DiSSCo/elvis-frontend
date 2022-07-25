<template>
  <div v-if="formData">
    <h3 class="header">Request details</h3>
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
        @updateField="updateField"
      />
    </form>
  </div>
</template>

<script>
import { fetchUsers } from '@/services/usersService';
import FieldRow from '@/modules/core/components/ui/formElements/FieldRow';
import FieldGroup from '@/modules/core/components/ui/formElements/FieldGroup';
import data from '../../schemas/fields-ta.json';
import disciplines from '../../schemas/project-disciplines.json';

export default {
  components: {
    FieldRow,
    FieldGroup
  },

  props: {
    formData: Object,
    editable: {
      type: Boolean,
      default: true
    },
    startDate: String,
    endDate: String,
    institutions: {
      type: Array,
      default: () => []
    }
  },

  data() {
    return {
      fields: data.projectDetails,
      disciplines,
      sDate: new Date(),
      eDate: new Date()
    };
  },

  watch: {
    startDate: {
      handler(value) {
        this.setStartDate(value);
      },
      immediate: true,
      deep: true
    },

    endDate: {
      handler(value) {
        this.setEndDate(value);
      },
      immediate: true,
      deep: true
    }
  },

  created() {
    this.getResearchers();
    this.setDisciplines();
  },

  methods: {
    updateField(event) {
      if (event.fieldId.includes('project_specific_discipline')) {
        this.formData.fieldValues.project_specific_discipline = { type: 'string', value: event.value.value };
      }
      if (event.fieldId.includes('project_discipline')) {
        this.formData.fieldValues.project_discipline = { type: 'string', value: event.value.value };
        this.formData.fieldValues.project_specific_discipline = { type: 'string', value: '' };

        if (event.value.value) {
          this.setSubDisciplines(event.value.value);
        } else {
          this.setSubDisciplines(null);
        }
        setTimeout(() => {
          this.$root.$emit('updateField', {
            context: { resource: 'requests' },
            fieldId: ['project_specific_discipline'],
            value: { type: 'string', value: '' }
          });
        }, 1000);
      }
    },

    async getResearchers() {
      try {
        const response = await fetchUsers();
        const autoCompleteData = response.data.data.rows.map(person => {
          const [institution] = this.institutions.filter(i => i.id === person.attributes.relatedInstitutionId);
          return institution
            ? `${person.firstName} ${person.lastName} (${institution.name})`
            : `${person.firstName} ${person.lastName}`;
        });

        this.fields = this.fields.map(field => {
          if (field.group === 'team_details') {
            const found = field.fields.find(f => f.id === 'other_researchers');
            found.options.fieldOptions.autoCompleteData = autoCompleteData;
          }
          return field;
        });
      } catch (error) {
        console.log(error);
      }
    },

    setStartDate(date) {
      date = date || this.formData.fieldValues.start_date?.value;
      if (date) {
        this.sDate = date;
        this.calculateWorkingDays();
        const found = this.fields.find(field => field.id === 'end_date');
        if (found) {
          this.$set(found.options.fieldOptions, 'minDate', new Date(date));
        }
      }
    },

    setEndDate(date) {
      date = date || this.formData.fieldValues.end_date?.value;
      if (date) {
        this.eDate = date;
        this.calculateWorkingDays();
      }
    },

    calculateWorkingDays() {
      const startDate = new Date(this.sDate);
      const endDate = new Date(this.eDate);
      let count = 0;
      const currentDate = startDate;
      while (currentDate <= endDate) {
        const dayOfWeek = currentDate.getDay();
        if (!(dayOfWeek === 6 || dayOfWeek === 0)) count++;
        currentDate.setDate(currentDate.getDate() + 1);
      }

      this.setWorkingDays(count);
    },

    setWorkingDays(count) {
      const found = this.fields.find(field => field.id === 'visit_length');
      if (found) {
        this.$set(
          found.options.fieldOptions,
          'options',
          Array.from(Array(count + 1), (x, i) => String(i))
        );
        this.$root.$emit('set-working-days', count);
      }
    },

    setDisciplines() {
      const group = this.fields.find(field => field.group === 'project_information');
      const found = group.fields.find(field => field.id === 'project_discipline');
      const mainDisciplines = this.disciplines.map(discipline => discipline.name);

      if (found) {
        this.$set(found.options.fieldOptions, 'options', mainDisciplines);
        this.setSubDisciplines(this.formData.fieldValues.project_discipline?.value);
      }
    },

    setSubDisciplines(main) {
      const group = this.fields.find(field => field.group === 'project_information');
      const found = group.fields.find(field => field.id === 'project_specific_discipline');
      const foundDiscipline = main ? this.disciplines.find(discipline => discipline.name === main)?.sub : [];

      if (found) {
        this.$set(found.options.fieldOptions, 'options', foundDiscipline);
      }
    }
  }
};
</script>

<style lang="scss" scoped></style>
