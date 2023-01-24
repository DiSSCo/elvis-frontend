<template>
  <div id="details" class="section">
    <div v-if="formData" class="container">
      <router-link :to="{ path: '/requests', query: $route.query }">
        <i class="feather icon-arrow-left" /> {{ $t('request.back_to_requests') }}
      </router-link>
      <h1 class="title-link">{{ requestTitle }}</h1>
      <div class="columns">
        <div class="column is-8">
          <request-general :formData="formData" :editable="false" />
          <request-institutions id="institutions" :formData="formData" :editable="false" />
          <request-impact id="impact" :formData="formData" :editable="false" />
        </div>
        <div class="column is-4">
          <request-status :formData="formData" />
          <div class="sticky-wrapper">
            <request-navigation :steps="steps" />
            <request-comments :requestStatus="formData.status" :requestId="formData.id" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { isAllowed } from '@/modules/core/utils/auth';
import { fetchRequestData } from '@/services/requestsService';
import RequestGeneral from './components/va-request/RequestGeneral.vue';
import RequestInstitutions from './components/va-request/RequestInstitutions.vue';
import RequestImpact from './components/va-request/RequestImpact.vue';
import RequestStatus from './components/RequestStatus.vue';
import RequestComments from './components/RequestComments.vue';
import RequestNavigation from './components/RequestNavigation.vue';

export default {
  components: {
    RequestGeneral,
    RequestInstitutions,
    RequestImpact,
    RequestStatus,
    RequestComments,
    RequestNavigation,
  },

  computed: {
    requestTitle() {
      const subject = this.formData ? this.formData.fieldValues.subject : {};
      return subject && subject.value ? subject.value : 'New request';
    },

    steps() {
      return [
        { id: 'details', name: 'Request details', disabled: false },
        { id: 'institutions', name: 'Institutions involved', disabled: false },
        { id: 'impact', name: 'Impact', disabled: false },
      ];
    },
  },

  data() {
    return {
      formData: null,
      loading: false,
    };
  },

  created() {
    this.emitter.on('reload', this.getRequestData);
    const { id } = this.$route.params;
    if (isAllowed('request_approve')) {
      this.getRequestData({ id, isCoordinator: true });
      return;
    }
    this.getRequestData(id);
  },

  beforeUnmount() {
    this.emitter.off('reload');
  },

  methods: {
    async getRequestData(id) {
      try {
        this.formData = await fetchRequestData(id);
      } catch (error) {
        console.log(error);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.card-header {
  border: 1px solid $grey;
  &.institution {
    background: $blue;
    border: 1px solid $blue;
    color: $white;
    margin-bottom: 1em;
    .card-header-title {
      color: $white;
    }
  }
  .card-header-icon {
    font-size: 24px;
  }
}
</style>
