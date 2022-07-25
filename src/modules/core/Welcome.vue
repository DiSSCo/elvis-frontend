<template>
  <div class="home">
    <section class="hero">
      <div class="hero-body">
        <div>
          <img class="logo" src="@/assets/images/logo/logo-elvis-white-compact.svg" />
          <div class="hero-text">
            <h1>Virtual and Transnational Access</h1>
            <p>Towards smoother, faster and better access to natural history collections across Europe.</p>
          </div>
        </div>
        <b-button class="is-primary" @click="register">{{ $t('registration.register_now') }}</b-button>
      </div>
      <div class="map" />

      <section class="section grey-bg">
        <div class="columns">
          <div class="column">
            <div class="box">
              <div v-html="homepageText" />
            </div>
          </div>
        </div>
      </section>
    </section>

    <section class="section grey-bg no-padding-top">
      <div class="banner">
        <a href="https://www.dissco.eu/" target="_blank"
          ><img :src="require('@/assets/images/logo/logo-dissco.png')" alt="DISSCO"
        /></a>
        <!--<div class="banner-text">Building the future of European Natural Science Collections</div>-->
        <a href="https://www.synthesys.info/" target="_blank" class="logo-synthesys"
          ><img :src="require('@/assets/images/logo/logo-synthesys.png')" alt="Synthesys"
        /></a>
        <div class="eu-flag">
          <a href="https://ec.europa.eu/" target="_blank"
            ><img :src="require('@/assets/images/logo/EU-flag.png')" alt="European Union"
          /></a>
          <div class="eu-text">
            Developed in the SYNTHESYS+ project with funding from the European Union’s Horizon 2020 research and
            innovation programme under grant agreement ID:
            <a href="https://cordis.europa.eu/project/id/823827" tagret="_blank">823827</a>.
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { isAuthenticated } from '@/modules/core/utils/auth';
import { fetchSettingsByKey } from '@/services/adminService';
import { fallbackHomepage } from '@/i18n/fallback/homepage';

export default {
  data() {
    return {
      content: null
    };
  },

  computed: {
    homepageText() {
      return this.content;
    }
  },

  created() {
    if (isAuthenticated()) {
      this.$router.push('/');
    }
    this.getText();
  },

  methods: {
    register() {
      this.$router.push('/register');
    },

    async getText() {
      try {
        const response = await fetchSettingsByKey('homepage');
        this.content = response.data.data.value;
      } catch (error) {
        console.log('error: ', error);
        this.content = fallbackHomepage;
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.home {
  background: url('~@/assets/images/europe-map-2020-35.svg') top right no-repeat,
    linear-gradient(180deg, #2460a9 0%, #34b2d0 99%);
  background-size: auto 100%;
  min-height: calc(100vh - 110px);
  @media only screen and (min-width: 1600px) {
    background: url('~@/assets/images/europe-map-2020.svg') top right no-repeat,
      linear-gradient(180deg, #2460a9 0%, #34b2d0 99%);
  }
  .hero {
    position: relative;
    background: none;
    //height: 500px;
  }
  .logo {
    height: 50px;
    margin-bottom: 1em;
  }
  .hero-body {
    padding: 1.6em 2em;
    width: 40%;
    color: $white;
    z-index: 1;
    display: flex;
    flex-flow: column nowrap;
    align-items: flex-start;
    .size-up-to-desktop & {
      width: 100%;
    }
  }
  .hero-text {
    max-height: 340px;
    overflow: hidden;
    overflow-y: auto;
    h1 {
      color: $white;
      font-size: 36px;
      font-weight: 400;
      line-height: 1.2;
      margin: 0 0 8px;
    }
    p {
      font-size: 18px;
    }
  }
  .grey-bg {
    max-width: 1600px;
  }
  .banner {
    background: #fff;
    padding: 20px;
  }
  .banner,
  .eu-flag {
    display: flex;
    align-items: flex-start;
    flex-wrap: wrap;
    .banner-text {
      margin-left: 2em;
      color: $blue-dark;
      font-size: 18px;
    }
    img {
      margin-right: 24px;
      margin-bottom: 16px;
    }
  }
  .eu-flag {
    flex-wrap: nowrap;
  }
  .eu-text {
    max-width: 400px;
    font-size: 0.8em;
  }
}
.no-padding-top {
  padding-top: 0;
}
</style>
