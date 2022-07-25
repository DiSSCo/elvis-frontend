<template>
  <div>
    <new-call editable />
  </div>
</template>

<script>
import { isAllowed } from '@/modules/core/utils/auth';
import NewCall from './NewCall';

export default {
  components: {
    NewCall
  },

  created() {
    if (!isAllowed('call_edit')) {
      return this.$router.push({ name: 'message', params: { status: 403 } });
    }
  }
};
</script>
