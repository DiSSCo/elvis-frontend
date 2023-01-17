<template>
  <div class="autocomplete" ref="root">
    <div class="control has-icons-left" :class="{ 'has-icons-right': clearable }">
      <input
        type="text"
        ref="input"
        class="autocomplete-input"
        :placeholder="placeHolder"
        @focus="onFocus"
        @input.stop="onInput"
        @keyup.enter="freeText ? select($event.target.value) : null"
        v-model="search"
      />
      <span class="icon is-small is-left">
        <i :class="icon" class="feather"></i>
      </span>
      <span v-if="clearable && search"
        @click.stop="clearValue"
        class="icon is-small is-right clear-input"
      >
        <i class="feather icon-x"></i>
      </span>
    </div>

    <ul v-show="isOpen" class="autocomplete-results">
      <li class="no-results" v-if="isLoading">{{ $t('no_results') }}</li>
      <li v-else v-for="(result, i) in filteredList"
        :key="i"
        @click.stop="select(result)"
        class="autocomplete-row"
      >
        {{ result }}
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  props: {
    value: Array,
    autoCompleteData: Array,
    placeHolder: {
      type: String,
      default: 'Add link',
    },
    isLoading: {
      type: Boolean,
      default: false,
    },
    icon: {
      type: String,
      default: 'icon-link',
    },
    clearable: {
      type: Boolean,
      default: false,
    },
    freeText: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      filteredList: [],
      search: '',
      isOpen: false,
    };
  },

  watch: {
    value: {
      handler(value) {
        this.search = (value && value.length && value[0].value.title) || '';
      },
      immediate: true,
    },
  },

  mounted() {
    document.addEventListener('click', this.handleClickOutside);
  },

  unmounted() {
    document.removeEventListener('click', this.handleClickOutside);
  },

  methods: {
    onFocus() {
      this.filteredList = this.autoCompleteData;
      this.isOpen = true;
    },

    onInput(event) {
      if (!event.target.value) return;
      this.filteredList = this.filterByValue(this.autoCompleteData, this.search);
      this.isOpen = true;
    },

    filterByValue(arr, q) {
      return arr.filter((item) => item.toLowerCase().includes(q.toLowerCase()));
    },

    select(selected) {
      if (!selected) return;
      this.$emit('select', selected);
      this.search = '';
      this.isOpen = false;
    },

    clearValue() {
      this.search = '';
      this.$refs.input.focus();
    },

    handleClickOutside(evt) {
      if (!this.$refs.root.contains(evt.target)) {
        this.isOpen = false;
      }
    },
  },
};
</script>
<style lang="scss" scoped>
.autocomplete {
  display: flex;
  position: relative;
  flex: 1;
  .control {
    display: flex;
    flex: 1;
  }
}

.clear-input {
  cursor: pointer;
  pointer-events: all !important;
}

.autocomplete-input {
  border: none;
  height: 40px;
  border-radius: 0;
  box-shadow: none;
  padding: 5px;
  padding-left: 2.5em;
  font-size: 15px;
  line-height: 1.5;
  flex: 1;
}

.autocomplete-results {
  position: absolute;
  background-color: $white;
  box-shadow: $box-shadow;
  padding-bottom: 0.5rem;
  padding-top: 0.5rem;
  padding: 0;
  margin: 0;
  max-height: 200px;
  overflow: auto;
  width: 100%;
  top: 100%;
  z-index: 5;
  font-size: 0.9em;
}

.autocomplete-row {
  padding: 0.2em 1em;
  cursor: pointer;
  &.is-active,
  &:hover {
    background-color: $grey-light;
    color: #000;
  }
}
.no-results {
  padding: 1em;
}
</style>
