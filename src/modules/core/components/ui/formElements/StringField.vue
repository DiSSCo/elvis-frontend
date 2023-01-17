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
    <tag v-if="isTag" :text="$t(`status.${val}`)" :variant="$t(`status.class.${val}`)" :rounded="true" />
    <div v-else>{{ placeHolder || val || '-' }}</div>
  </div>
</template>

<script>
import Tag from '@/modules/core/components/ui/Tag.vue';

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
    isTag: {
      type: Boolean,
      default: false,
    },
    reset: Boolean,
  },

  components: {
    Tag,
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

    value: {
      handler(value) {
        this.val = value && Object.keys(value).includes('value') ? value.value : value;
      },
    },
  },

  methods: {
    handleInput(event) {
      const value = event.target.value.trim();

      this.$emit('updateInput', { path: this.path, type: 'string', value });
    },
  },
};
</script>
