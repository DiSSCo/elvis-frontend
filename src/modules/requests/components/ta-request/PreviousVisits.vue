<template>
  <div>
    <h3 class="header">
      Previous visits
      <o-tooltip variant="primary" size="large" multilined animated>
        <o-icon custom-class="is-blue" size="small" icon="information" />
        <template v-slot:content>
          <p>
            Have you had a visit to this or any other TAF(s) funded by the current
            H2020 SYNTHESYS+ project (February 2019 – January 2023)? If Yes, which
            TAF(s) and please give your application number(s) and describe the
            output(s) delivered from your prior visit(s).
          </p>
        </template>
      </o-tooltip>
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
import FieldRow from '@/modules/core/components/ui/formElements/FieldRow.vue';
import FieldGroup from '@/modules/core/components/ui/formElements/FieldGroup.vue';
import data from '../../schemas/fields-ta.json';

export default {
  components: {
    FieldRow,
    FieldGroup,
  },

  props: {
    formData: {
      type: Object,
    },
    editable: {
      type: Boolean,
      default: true,
    },
  },

  data() {
    return {
      fields: data.previousVisits,
    };
  },
};
</script>

<style lang="scss" scoped></style>
