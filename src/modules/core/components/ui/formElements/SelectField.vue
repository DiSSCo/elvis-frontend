<template>
  <div v-if="editable" class="select-field">
    <o-select :value="val" :placeholder="placeHolder" @input="select" expanded :disabled="disabled">
      <option v-if="withEmptyOption" value="">- {{ placeHolder }} -</option>
      <option v-for="(option, index) in options" :key="index" :value="option">
        {{ prefix }} {{ option }} {{ suffix }}
      </option>
    </o-select>
  </div>
  <div v-else>
    <span v-if="val">{{ prefix }} {{ val }} {{ suffix }}</span
    ><span v-else>-</span>
  </div>
</template>

<script>
export default {
  props: {
    path: Array,
    value: [String, Number, Object],
    placeHolder: String,
    editable: {
      type: Boolean,
      default: true,
    },
    options: Array,
    withEmptyOption: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    prefix: String,
    suffix: String,
  },

  computed: {
    val() {
      if (this.value?.value) {
        return this.value?.value;
      }
      if (typeof this.value === 'string') {
        return this.value;
      }
      return null;
    },
  },

  methods: {
    select(event) {
      const value = event.target.value.trim();

      this.$emit('updateInput', { path: this.path, type: 'string', value: String(value) });
      this.emitter.emit('selection', event);
    },
  },
};
</script>
<style lang="scss" scoped>
.select-field {
  display: flex;
  flex: 1;

  :deep(.control) {
    flex: 1;
  }
  :deep(.select.is-empty select) {
    color: $grey-dark;
  }
}
</style>
