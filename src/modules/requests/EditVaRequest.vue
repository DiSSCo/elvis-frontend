<template>
  <div id="details" class="section">
    <div class="container">
      <router-link :to="'/requests'">
        <i class="feather icon-arrow-left" /> {{ $t('request.back_to_requests') }}
      </router-link>
      <h1 class="title-link">{{ requestTitle }}</h1>
      <div class="columns request-wrapper">
        <div class="column is-8">
          <div v-if="formData && formData.id">
            <request-general :formData="formData" />
            <request-institutions id="institutions" :formData="formData" @reload="getRequestData" />
            <div v-if="institutions">
              <request-impact id="impact" :formData="formData" />
              <request-submit
                id="finish"
                :formData="formData"
                @submitRequest="submitRequest"
                @updateRequest="updateRequest"
              />
            </div>
          </div>
        </div>
        <div class="column is-4">
          <request-info :text="$t('request.request_info')"
            :moreText="$t('request.request_va_more_info')"
          />
          <request-status v-if="formData" :formData="formData" />
          <div class="sticky-wrapper">
            <request-navigation :steps="steps" />
            <request-comments v-if="formData && requestId"
              :requestStatus="formData.status"
              :requestId="requestId"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  submitRequest, fetchRequestData, updateField, removeGroup,
} from '@/services/requestsService';
import RequestGeneral from './components/va-request/RequestGeneral.vue';
import RequestInstitutions from './components/va-request/RequestInstitutions.vue';
import RequestImpact from './components/va-request/RequestImpact.vue';
import RequestInfo from './components/RequestInfo.vue';
import RequestStatus from './components/RequestStatus.vue';
import RequestComments from './components/RequestComments.vue';
import RequestSubmit from './components/va-request/RequestSubmit.vue';
import RequestNavigation from './components/RequestNavigation.vue';

export default {
  components: {
    RequestGeneral,
    RequestInstitutions,
    RequestImpact,
    RequestInfo,
    RequestStatus,
    RequestComments,
    RequestSubmit,
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
        { id: 'finish', name: 'Finish', disabled: false },
      ];
    },

    institutions() {
      return !!this.formData.institutions.length;
    },
  },

  data() {
    return {
      formData: null,
      clickable: true,
      requestId: null,
      activeStep: 0,
      loading: false,
    };
  },

  async created() {
    this.emitter.on('updateField', this.handleFormField);
    this.emitter.on('removeGroup', this.handleRemoveGroup);
    this.emitter.on('reload', this.getRequestData);

    this.requestId = this.$route.params.reqid;
    if (this.requestId) {
      this.getRequestData(this.requestId);
    }
  },

  beforeUnmount() {
    this.emitter.off('updateField');
    this.emitter.off('removeGroup');
    this.emitter.off('reload');
  },

  methods: {
    async getRequestData(id) {
      console.log(id);

      try {
        this.formData = await fetchRequestData(id);
      } catch (error) {}
    },

    async handleFormField(payload) {
      try {
        await updateField(this.requestId, payload);
      } catch (error) {}
    },

    async handleRemoveGroup(payload) {
      try {
        await removeGroup(this.requestId, payload);
        this.formData = await fetchRequestData(this.requestId);
      } catch (error) {}
    },

    async submitRequest() {
      this.loading = true;
      try {
        const response = await submitRequest(this.requestId);
        if (response.status === 200) {
          setTimeout(() => {
            this.$router.push({
              name: 'requests',
            });
            this.loading = false;
          }, 1500);
        }
      } catch (error) {
        console.log(error);
        this.loading = false;
      }
    },

    updateRequest() {
      this.loading = true;
      setTimeout(() => {
        this.$router.push({
          name: 'requests',
        });
        this.loading = false;
      }, 1500);
    },
  },
};
</script>

<style lang="scss" scoped>
.request-wrapper {
  border-top: 1px solid $grey-light;
}
</style>
