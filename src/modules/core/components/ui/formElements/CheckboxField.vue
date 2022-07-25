<template>
  <div class="checkbox-wrapper">
    <b-checkbox
      :value="val"
      @input="$emit('input', { path, type: 'boolean', value: $event })"
      :disabled="!editable || disabled"
    >
      <span v-if="isHtml" v-html="anchorLinks(label)"></span>
      <span v-else>{{ label }}</span></b-checkbox
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
      default: true
    },
    disabled: {
      type: Boolean,
      default: false
    },
    isHtml: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    val() {
      return this.value && Object.keys(this.value).includes('value') ? this.value.value : this.value;
    }
  },

  methods: {
    anchorLinks(value) {
      return anchorLinks(value);
    }
  }
};
</script>

<style lang="scss" scoped>
.checkbox-wrapper {
  display: flex;
  flex-flow: row wrap;
}
::v-deep .b-checkbox.checkbox {
  margin: 0.5em;
}
::v-deep .checkbox[disabled] {
  color: $black;
  opacity: 1;
}
</style>
