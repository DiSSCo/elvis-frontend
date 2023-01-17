<template>
  <section class="section privacy-statement">
    <div class="content" v-html="privacyStatement" />
  </section>
</template>

<script>
import { fetchSettingsByKey } from '@/services/adminService';
import fallbackPrivacyStatement from '@/i18n/fallback/privacystatement';

export default {
  data() {
    return {
      content: null,
    };
  },

  computed: {
    privacyStatement() {
      return this.content;
    },
  },

  created() {
    this.getText();
  },

  methods: {
    async getText() {
      try {
        const response = await fetchSettingsByKey('privacy_statement');
        this.content = response.data.data.value;
      } catch (error) {
        console.log('error: ', error);
        this.content = fallbackPrivacyStatement;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.privacy-statement {
  background: $white;
}
:deep(li) {
  list-style-type: disc;

  li {
    list-style-type: circle;
  }
}
</style>
