<template>
  <div>
    <h3 class="header">
      Project Methodology
      <b-tooltip type="is-dark" size="is-large" multilined animated>
        <b-icon custom-class="is-blue" size="is-small" icon="information" />
        <template v-slot:content>
          <p>
            Scientific content and project methodology including a detailed work plan with a timetable for planned
            activities during the period of research at the TAF, so it is clear what you will actually be doing during
            your visit. Where appropriate include the number of specimens to be studied.
          </p>
          <p>
            Where appropriate please include detail of laboratory work plans (for example the number of days requested
            for laboratory work, what do you wish to do in the laboratory, number of samples to be processed, number of
            genes to be studied, do you have a preferred protocol to follow, is any pre-preparation required).
          </p>
        </template>
      </b-tooltip>
    </h3>
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
import FieldRow from '@/modules/core/components/ui/formElements/FieldRow';
import FieldGroup from '@/modules/core/components/ui/formElements/FieldGroup';
import data from '../../schemas/fields-ta.json';

export default {
  components: {
    FieldRow,
    FieldGroup
  },

  props: {
    formData: {
      type: Object
    },
    editable: {
      type: Boolean,
      default: true
    }
  },

  data() {
    return {
      fields: data.projectMethodology
    };
  }
};
</script>

<style lang="scss" scoped></style>
