<template>
  <footer>
    <div class="columns">
      <div class="column">
        <div class="logo">
          <img :src="require('@/assets/images/logo/footer-logo-elvis.svg')" alt="Elvis" />
          <div class="version">{{ version }}</div>
        </div>
      </div>
      <div class="column">
        <router-link to="/privacy-statement">{{ $t('footer.privacy_statement') }}</router-link>
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  computed: {
    version() {
      return `${this.$t('footer.version')}: ${process.env.VUE_APP_VERSION}`;
    },
  },
};
</script>

<style lang="scss" scoped>
footer {
  height: $footer-height;
  padding: 10px 1.5rem;
  background: $grey-light;
  font-size: 13px;
  color: $blue;

  .logo {
    height: 20px;
    display: flex;
    align-items: center;
    img {
      height: 100%;
    }
  }
  .version {
    margin-left: 1em;
    white-space: nowrap;
    align-self: flex-end;
    line-height: 1;
  }
}
</style>
