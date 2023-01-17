<template>
  <div class="hero search-bar">
    <form @submit.prevent>
      <o-field class="search">
        <o-input icon="magnify" :value="test" type="search" icon-clickable :placeholder="placeholder"
          @input="$emit('input', $event)" />
      </o-field>
    </form>
  </div>
</template>

<script>
export default {
  props: {
    placeholder: String,
    query: String,
  },

  created() {
    if (this.query) {
      this.$emit('input', this.query);
    }
  },
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

  :deep(input) {
    border: 1px solid $grey-dark;
    box-shadow: none;
  }

  :deep(.icon) {
    color: $grey-medium;
  }
}
</style>
