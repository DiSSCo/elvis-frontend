<template>
  <div class="section">
    <div class="container">
      <h1 class="title-link">{{ $t('admin.settings') }}</h1>

      <div class="columns">
        <div class="column">
          <o-tabs :animated="false" v-model="activeTab">
            <o-tab-item label="Homepage">
              <tab-homepage :data="homepageText" />
            </o-tab-item>
            <o-tab-item label="Privacy Statement">
              <tab-privacy-statement :data="privacyStatement" />
            </o-tab-item>
          </o-tabs>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { fetchSettingsByKey } from '@/services/adminService';
import fallbackHomepage from '@/i18n/fallback/homepage';
import fallbackPrivacyStatement from '@/i18n/fallback/privacystatement';
import TabHomepage from './components/TabHomepage.vue';
import TabPrivacyStatement from './components/TabPrivacyStatement.vue';

export default {
  components: {
    TabHomepage,
    TabPrivacyStatement,
  },

  data() {
    return {
      homepageText: null,
      activeTab: 0,
      privacyStatement: null,
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
      immediate: true,
    },
  },

  created() {
    this.activeTab = 1;
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
    },
  },
};
</script>

<style lang="css">
.o-tabs__nav--default {
  border-bottom: 1px solid #dbdbdb;
}

.o-tabs__nav-item {
  border-bottom: 5px solid white;
  color: #868696;
}

.o-tabs__nav-item:hover {
  border-bottom: 5px solid #ffd85d !important;
}

.o-tabs__nav-item-default--active {
  color: #0c86c6;
  border-bottom: 5px solid #ffd85d;
}
</style>
