<template>
  <input
    v-if="editable"
    type="password"
    autocomplete="new-password"
    v-model.trim="val"
    :placeholder="placeHolder"
    :loading="loading"
    :disabled="disabled"
    @blur="handleInput"
    @keyup.enter="handleInput"
    maxlength
  />

  <div class="read-only-container" v-else>
    <b-tag v-if="isTag" class="tag" rounded :class="$t(`status.class.${val}`)">{{ $t(`status.${val}`) }}</b-tag>
    <div v-else>{{ placeHolder || val || '-' }}</div>
  </div>
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
      default: true
    },
    disabled: {
      type: Boolean,
      default: false
    },
    isTag: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      val: this.value
        ? Object.keys(this.value).includes('value')
          ? this.$t(this.value.value)
          : this.$t(this.value)
        : ''
    };
  },

  methods: {
    handleInput(event) {
      this.$emit('input', { path: this.path, type: 'string', value: event.target.value });
    }
  }
};
</script>
