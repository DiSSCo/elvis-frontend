<template>
  <input
    v-if="editable"
    type="number"
    v-model.trim="val"
    :placeholder="placeHolder"
    :loading="loading"
    :disabled="disabled"
    @keypress="checkIfNumber"
    @blur="$emit('updateInput', { path, type: 'string', value: $event.target.value })"
    maxlength
  />
  <div v-else class="read-only-container">{{ placeHolder || val || '-' }}</div>
</template>

<script>
export default {
  props: {
    path: Array,
    value: [String, Object],
    placeHolder: String,
    loading: Boolean,
    editable: {
      type: Boolean,
      default: true,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    reset: Boolean,
  },

  data() {
    return {
      val: this.value && Object.keys(this.value).includes('value') ? this.value.value : this.value,
    };
  },

  watch: {
    reset: {
      handler() {
        this.val = '';
      },
    },
  },

  methods: {
    handleInput(event) {
      const value = event.target.value.trim();
      this.$emit('updateInput', { path: this.path, type: 'string', value });
    },

    checkIfNumber(event) {
      const regex = /^[0-9]+$/;
      if (!regex.test(event.key)) {
        event.preventDefault();
      }
    },
  },
};
</script>
