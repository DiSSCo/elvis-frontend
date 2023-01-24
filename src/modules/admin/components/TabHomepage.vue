<template>
  <editor v-if="data" :content="data" @update="updateHomePage" />
</template>

<script>
import editor from '@/modules/core/components/editor/index.vue';
import { updateSettings } from '@/services/adminService';

export default {
  components: {
    editor,
  },

  props: {
    data: String,
  },

  methods: {
    async updateHomePage(value) {
      const payload = { key: 'homepage', type: 'string', value };
      await updateSettings(payload);
    },
  },
};
</script>
