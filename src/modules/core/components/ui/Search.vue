<template>
  <div class="hero search-bar">
    <form @submit.prevent>
      <b-field class="search">
        <b-input
          type="search"
          icon="magnify"
          icon-clickable
          :placeholder="placeholder"
          :value="query"
          @input="$emit('input', $event)"
        />
      </b-field>
    </form>
  </div>
</template>

<script>
export default {
  props: {
    placeholder: String,
    query: String
  },

  created() {
    if (this.query) {
      this.$emit('input', this.query);
    }
  }
};
</script>

<style lang="scss" scoped>
.search-bar {
  display: flex;
  justify-content: center;
  background: $grey-light;
}
.search {
  width: 350px;

  ::v-deep input {
    border: 1px solid $grey-dark;
    box-shadow: none;
  }
  ::v-deep .icon {
    color: $grey-medium;
  }
}
</style>
