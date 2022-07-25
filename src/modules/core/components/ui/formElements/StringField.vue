<template>
  <input
    v-if="editable"
    type="text"
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
    },
    reset: Boolean
  },

  data() {
    return {
      val: this.value && Object.keys(this.value).includes('value') ? this.value.value : this.value
    };
  },

  watch: {
    reset: {
      handler() {
        this.val = '';
      }
    },

    value: {
      handler(value) {
        this.val = value && Object.keys(value).includes('value') ? value.value : value;
      }
    }
  },

  methods: {
    handleInput(event) {
      const value = event.target.value.trim();
      this.$emit('input', { path: this.path, type: 'string', value });
    }
  }
};
</script>
