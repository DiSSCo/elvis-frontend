<template>
  <editor v-if="data" :content="data" @update="updatePrivacyStatement" />
</template>

<script>
import editor from '@/modules/core/components/editor';
import { updateSettings } from '@/services/adminService';

export default {
  components: {
    editor
  },

  props: {
    data: String
  },

  methods: {
    async updatePrivacyStatement(value) {
      const payload = { key: 'privacy_statement', type: 'string', value };
      await updateSettings(payload);
    }
  }
};
</script>
