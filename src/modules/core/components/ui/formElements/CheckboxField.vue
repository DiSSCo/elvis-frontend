<template>
  <div class="checkbox-wrapper">
    <o-checkbox
      v-model="val" variant="info"
      @update:modelValue="$emit('updateInput', { path, type: 'boolean', value: $event })"
      :disabled="!editable || disabled"
    >
      <span v-if="isHtml" v-html="anchorLinks(label)"></span>
      <span v-else>{{ label }}</span></o-checkbox
    >
  </div>
</template>

<script>
import { anchorLinks } from '@/modules/core/utils/helpers';

export default {
  props: {
    path: [Array, String],
    value: [Boolean, Object],
    label: String,
    editable: {
      type: Boolean,
      default: true,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    isHtml: {
      type: Boolean,
      default: false,
    },
  },

  computed: {
    val() {
      return this.value && Object.keys(this.value).includes('value') ? this.value.value : this.value;
    },
  },

  methods: {
    anchorLinks(value) {
      return anchorLinks(value);
    },
  },
};
</script>

<style lang="scss" scoped>
.checkbox-wrapper {
  display: flex;
  flex-flow: row wrap;
}
:deep(.b-checkbox.checkbox) {
  margin: 0.5em;
}
:deep(.checkbox[disabled]) {
  color: $black;
  opacity: 1;
}
</style>
