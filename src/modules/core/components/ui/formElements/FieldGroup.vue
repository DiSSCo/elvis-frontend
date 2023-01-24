<template>
  <div class="group" :class="{ 'sub-header': subheader }">
    <label>{{ label }}</label>
    <div class="field-rows">
      <field-row
        v-for="field in getFields"
        :key="field.id"
        :value="value && field ? value[field.id] : ''"
        :context="context"
        :path="[...path, field.id]"
        :label="field.label"
        :editable="editable"
        v-bind="{ ...field.options }"
        @updateField="$emit('updateField', $event)"
      />
    </div>
  </div>
</template>

<script>
import FieldRow from './FieldRow.vue';

export default {
  components: {
    FieldRow,
  },

  props: {
    path: Array,
    context: {
      type: Object,
      default: null,
    },
    value: Object,
    label: String,
    fields: Array,
    fieldOptions: Object,
    editable: {
      type: Boolean,
      default: true,
    },
    subheader: Boolean,
  },

  computed: {
    getFields() {
      return this.fields;
    },
  },
};
</script>
<style lang="scss" scoped>
.group {
  display: flex;
  margin-bottom: 1.8em;
  padding-right: 30px;
  align-items: center;
  &.sub-header {
    display: block;
    padding-right: 0;
    margin-bottom: 0.8em;
    .field-rows .field-row {
      margin-bottom: 0.8em;
      width: 100%;
      :deep(.field-row-body) {
        margin-bottom: 1em;
        width: 100%;
      }
    }
    label {
      background: $grey;
      width: 100%;
      text-align: left;
      padding: 0.4em 1em;
      margin: 0;
      margin-bottom: 2em;
    }
  }
  label {
    flex: 1;
    text-align: right;
    margin: 0 1.5em;
    margin-bottom: 0;
  }
  .field-rows {
    display: flex;
    flex-flow: row wrap;
    flex: 3;

    .field-row,
    :deep(.field-row-body) {
      margin-bottom: 0;
      width: auto;
    }
  }
}
</style>
