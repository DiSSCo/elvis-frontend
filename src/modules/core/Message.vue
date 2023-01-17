<template>
  <div class="error-message">
    <h1>{{ status }}</h1>
    <h2>{{ response.title }}</h2>
    <small>{{ response.description }}</small>
  </div>
</template>

<script>
export default {
  props: {
    status: {
      type: [Number, String],
      default: 404,
    },
  },

  computed: {
    response() {
      return this.$te(`error_handling.${this.status}`)
        ? this.$t(`error_handling.${this.status}`)
        : this.$t('error_handling.default');
    },
  },
};
</script>

<style lang="scss" scoped>
.error-message {
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  justify-content: center;
  padding: 2em;
  text-align: center;
  height: calc(100vh - #{$header-height + $footer-height});
}
</style>
