<template>
  <editor v-if="data" :content="data" @update="updateReporting" />
</template>

<script>
import editor from '@/modules/core/components/editor';
import { updateSettings } from '@/services/adminService';

export default {
  components: {
    editor,
  },

  props: {
    data: String,
  },

  methods: {
    async updateReporting(value) {
      const payload = { key: 'reporting', type: 'string', value };
      await updateSettings(payload);
    },
  },
};
</script>
