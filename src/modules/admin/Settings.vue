<template>
  <div class="section">
    <div class="container">
      <h1 class="title-link">{{ $t('admin.settings') }}</h1>

      <div class="columns">
        <div class="column">
          <b-tabs :animated="false" v-model="activeTab">
            <b-tab-item label="Homepage">
              <tab-homepage :data="homepageText" />
            </b-tab-item>
            <b-tab-item label="Privacy Statement">
              <tab-privacy-statement :data="privacyStatement" />
            </b-tab-item>
          </b-tabs>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { fetchSettingsByKey } from '@/services/adminService';
import { fallbackHomepage } from '@/i18n/fallback/homepage';
import { fallbackPrivacyStatement } from '@/i18n/fallback/privacystatement';
import TabHomepage from './components/TabHomepage';
import TabPrivacyStatement from './components/TabPrivacyStatement';

export default {
  components: {
    TabHomepage,
    TabPrivacyStatement
  },

  data() {
    return {
      homepageText: null,
      activeTab: 0,
      privacyStatement: null
    };
  },

  watch: {
    activeTab: {
      handler(value) {
        if (value === 0) {
          this.getHomePageText();
        }
        if (value === 1) {
          this.getPrivacyStatement();
        }
      },
      immediate: true
    }
  },

  methods: {
    async getHomePageText() {
      try {
        const response = await fetchSettingsByKey('homepage');
        this.homepageText = response.data.data.value;
      } catch (error) {
        console.log('error: ', error);
        this.homepageText = fallbackHomepage;
      }
    },

    async getPrivacyStatement() {
      try {
        const response = await fetchSettingsByKey('privacy_statement');
        this.privacyStatement = response.data.data.value;
      } catch (error) {
        console.log('error: ', error);
        this.privacyStatement = fallbackPrivacyStatement;
      }
    }
  }
};
</script>
