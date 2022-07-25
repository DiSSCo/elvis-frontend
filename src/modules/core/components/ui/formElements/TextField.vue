<template>
  <div v-if="editable" class="textarea-wrapper">
    <b-tooltip v-if="maxlength" label="characters left" type="is-dark" class="counter">
      <span>{{ counter }}</span>
    </b-tooltip>
    <textarea
      type="textarea"
      v-model.trim="val"
      :placeholder="placeHolder"
      :loading="loading"
      @blur="handleInput"
      :rows="rows"
      :maxlength="maxlength"
      :class="{ 'counter-padding': maxlength }"
    ></textarea>
  </div>

  <div v-else class="read-only-container">
    <div v-if="isHtml" v-html="val ? anchorLinks(val) : '-'"></div>
    <div v-else>{{ placeHolder || val || '-' }}</div>
  </div>
</template>

<script>
import { anchorLinks } from '@/modules/core/utils/helpers';

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
    isHtml: {
      type: Boolean,
      default: false
    },
    reset: Boolean,
    maxlength: {
      type: Number,
      default: 2000
    },
    rows: Number
  },

  data() {
    return {
      val: this.value && Object.keys(this.value).includes('value') ? this.value.value : this.value
    };
  },

  computed: {
    counter() {
      return this.maxlength && this.val ? this.maxlength - this.val.length : this.maxlength;
    }
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
    },

    anchorLinks(value) {
      return anchorLinks(value);
    }
  }
};
</script>
<style lang="scss" scoped>
.textarea-wrapper {
  display: flex;
  flex: 1;

  .counter-padding {
    padding-top: 1em;
  }
}
.counter {
  font-size: 8px;
  position: absolute;
  right: 0 !important;
  top: 0;
  text-align: right;
  background: $white;
  padding: 2px 5px;
  border: 1px solid $grey;
  cursor: pointer;
  z-index: 1;
}
</style>
