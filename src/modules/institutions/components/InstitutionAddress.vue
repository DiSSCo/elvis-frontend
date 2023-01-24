<template>
  <div v-if="institution" class="institution-address">
    <h1>Institution Address</h1>
    <form @submit.prevent>
      <component
        v-for="field in fields"
        :is="field.type"
        :key="field.id"
        :value="institution.fieldValues[field.id]"
        :path="[field.id]"
        :context="{ resource: 'institutions', institutionId: institution.id }"
        :label="field.label"
        :editable="editable"
        v-bind="{ ...field.options }"
      />
    </form>
  </div>
</template>

<script>
import FieldRow from '@/modules/core/components/ui/formElements/FieldRow.vue';
import fields from '../schemas/fields.json';

export default {
  components: {
    FieldRow,
  },

  props: {
    institution: {
      type: [Object, Array],
    },
    institutionId: {
      type: String,
    },
    editable: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      fields: fields.address,
    };
  },
};
</script>

<style lang="scss" scoped>
.institution-address {
  padding-top: 2em;
  border-top: 1px solid $grey;
}
</style>
