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
  },

  components: {
    Tag,
  },

  data() {
    return {
      val: this.value
        ? Object.keys(this.value).includes('value')
          ? this.$t(this.value.value)
          : this.$t(this.value)
        : '',
    };
  },

  methods: {
    handleInput(event) {
      this.$emit('updateInput', { path: this.path, type: 'string', value: event.target.value });
    },
  },
};
</script>
