<template>
  <div v-if="isOwnRequest">
    <div v-if="isBeingHandled" class="submit-form">
      <h1>{{ $t('request.submit_update_title') }}</h1>
      <p>{{ $t('request.submit_update_text_ta') }}</p>
      <o-button class="primaryButton"
        size="large"
        @click.prevent="submit('updateRequest')"
        :loading="loading"
      >{{
        $t('request.update_request')
      }}</o-button>
    </div>
    <div v-else class="submit-form">
      <h3 class="header">Finish</h3>
      <p>Ready to submit your Transnational Access request?</p>
      <o-button class="primaryButton"
        size="large"
        @click.prevent="submit('submitRequest')"
        :loading="loading"
        >
          Submit
        </o-button
      >
    </div>
  </div>
</template>

<script>
import { isAdmin, getProfile } from '@/modules/core/utils/auth';

export default {
  props: {
    formData: {
      type: Object,
    },
  },

  data() {
    return {
      loading: false,
    };
  },

  computed: {
    isBeingHandled() {
      return this.formData.status === 'being_handled' || this.formData.status === 'submitted';
    },

    isAdmin() {
      return isAdmin();
    },

    profile() {
      return getProfile();
    },

    isOwnRequest() {
      return this.profile.id === this.formData.creatorData.id;
    },
  },

  methods: {
    submit(type) {
      this.loading = true;
      this.$emit(type);
    },
  },
};
</script>

<style lang="scss" scoped>
h1 {
  border-top: 1px solid $grey-light;
  margin-top: 1em;
}
</style>
