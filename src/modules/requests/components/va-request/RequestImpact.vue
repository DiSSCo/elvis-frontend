<template>
  <div>
    <h1>{{ $t('request.impact') }}</h1>
    <p>
      <strong>{{ $t('request.impact_info') }}</strong>
    </p>
    <form @submit.prevent>
      <component
        v-for="field in fields"
        :is="field.type"
        :key="field.id"
        :value="formData.fieldValues[field.id]"
        :path="[field.id]"
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
import data from '../../schemas/fields-va.json';

export default {
  components: {
    FieldRow
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
      fields: data.impact
    };
  }
};
</script>

<style lang="scss" scoped>
h1 {
  border-top: 1px solid $grey-light;
  margin-top: 1em;
}
</style>
