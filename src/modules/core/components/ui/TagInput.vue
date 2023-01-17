<template>
  <div class="taginput-container" :loading="isLoading">
    <span v-for="(tag, index) in tagList" :key="index" class="tag">
      <span class="tag-title" @click="tagSelect(tag)">{{ tag }}</span>
      <span v-if="removeable" class="delete-tag" @click="removeTag(index)">
        <i class="feather icon-x" />
      </span>
    </span>
    <auto-complete
      v-if="showAutoComplete"
      v-bind="$attrs"
      :autoCompleteData="autoCompl"
      @input="onInput"
      @select="select"
    />
  </div>
</template>

<script>
import AutoComplete from './AutoComplete.vue';

export default {
  components: {
    AutoComplete,
  },

  props: {
    path: Array,
    value: [String, Object, Array],
    autoCompleteData: {
      type: Array,
      default: () => [],
    },
    removeable: {
      type: Boolean,
      default: true,
    },
  },

  data() {
    return {
      tagList: [],
      results: [],
      isLoading: false,
    };
  },

  computed: {
    fieldPath() {
      return Array.isArray(this.path) ? this.path.join('.') : this.path;
    },

    showAutoComplete() {
      return (this.$attrs?.isSingleLink && !this.tagList.length) || !this.$attrs?.isSingleLink;
    },

    autoCompl() {
      return this.autoCompleteData.filter((item) => !this.tagList.includes(item));
    },
  },

  watch: {
    value: {
      handler(value) {
        this.tagList = typeof value === 'string' ? [value] : value;
      },
      immediate: true,
    },
  },

  methods: {
    async onInput(value) {
      if (!value) return;

      console.log(value);

      this.$emit('auto-complete', { path: this.fieldPath, value });
    },

    select(value) {
      this.tagList.push(value);
      this.$emit('update-tags', this.tagList);
    },

    tagSelect(event) {
      this.$emit('tag-select', event);
    },

    removeTag(index) {
      this.tagList.splice(index, 1);
      this.$emit('update-tags', this.tagList);
    },
  },
};
</script>

<style lang="scss" scoped>
.taginput-container {
  display: flex;
  flex-flow: row wrap;
  height: auto;
  border: 1px solid $grey;
  padding: 0;
  position: relative;
  flex: 1;

  .tag {
    margin: 3px;
    padding: 5px 0.5em;
    max-width: calc(100% - 50px);
    font-size: 14px;
    border-radius: 0;
    cursor: pointer;
    background-color: $secondary;
    color: #000;
    height: 34px;
    &:hover {
      background: lighten($secondary, 10%);
    }
    .tag-title {
      text-decoration: underline;
      max-width: 240px;
      white-space: nowrap;
      overflow-x: hidden;
      text-overflow: ellipsis;
    }
    .delete-tag {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 16px;
      height: 16px;
      margin-left: 0.5rem;
      color: $white;
      background-color: rgba(0, 0, 0, 0.2);
      &:hover {
        background-color: rgba(0, 0, 0, 0.3);
      }
      i {
        font-weight: 700;
      }
    }
  }

  :deep(.autocomplete-input) {
    border: none !important;
  }

  .dropdown {
    position: absolute;
    right: -1px;
    bottom: -1px;
    .tag-block & {
      right: 0;
      bottom: 0;
    }
    *:not(.button):focus {
      border: none;
      outline: none;
    }
    .dropdown-item {
      background: $grey-xlight;
      padding: 0.4em 0.5em;
      margin-bottom: 3px;
      .o-tooltip {
        display: block;
      }
      &:last-child {
        margin-bottom: 0;
      }
      .icon {
        height: auto;
        width: auto;
        font-size: 20px;
        vertical-align: middle;
      }
      &:hover {
        background: $grey-xlight;
      }
    }
    .button {
      padding-right: 0.5em;
      padding-left: 0.5em;
      min-height: 42px;
      border-radius: 0;
      background: none;

      .icon-more-vertical- {
        font-size: 20px;
      }
      &:hover {
        color: $primary;
      }
      &.search {
        min-width: 37px;
      }
    }
    .icon-search {
      font-size: 16px;
    }
  }
  :deep(.dropdown-content) {
    padding: 3px;
  }
}
</style>
