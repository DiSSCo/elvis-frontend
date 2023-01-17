<template>
  <div>
    <h3 class="header">Other institutions</h3>
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
  </div>
</template>

<script>
import FieldRow from '@/modules/core/components/ui/formElements/FieldRow.vue';
import FieldGroup from '@/modules/core/components/ui/formElements/FieldGroup.vue';
import data from '../../schemas/fields-ta.json';

export default {
  components: {
    FieldRow,
    FieldGroup,
  },

  props: {
    formData: Object,
    institutions: Array,
    editable: {
      type: Boolean,
      default: true,
    },
  },

  data() {
    return {
      fields: data.otherInstitutions,
    };
  },

  created() {
    this.getInstitutions();
  },

  methods: {
    getInstitutions() {
      try {
        const institutionsList = this.institutions.map((inst) => inst.name).sort();

        this.fields = this.fields.map((field) => {
          if (field.id === 'other_institutions' || field.id === 'visit_before_institution') {
            field.options.fieldOptions.autoCompleteData = institutionsList;
          }
          return field;
        });
      } catch (error) {
        console.log(error);
      }
    },
  },
};
</script>

<style lang="scss" scoped></style>
