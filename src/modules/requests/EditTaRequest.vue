<template>
  <div id="details" class="section">
    <div class="container">
      <router-link :to="'/requests'">
        <i class="feather icon-arrow-left" /> {{ $t('request.back_to_requests') }}
      </router-link>
      <h1 class="title-link">{{ requestTitle }}</h1>
      <div class="columns request-wrapper">
        <div class="column is-8">
          <div v-if="formData && institutions">
            <project-subject :formData="formData" :institutions="institutions" />
            <b-notification
              v-if="errorMessage"
              type="is-danger is-light"
              aria-close-label="Close notification"
              role="alert"
            >
              {{ errorMessage }}
            </b-notification>
            <div v-show="institutionsSelected">
              <project-details
                :formData="formData"
                :startDate="startDate"
                :endDate="endDate"
                :institutions="institutions"
              />
              <other-institutions id="other" :formData="formData" :institutions="institutions" />
              <project-methodology id="methodology" :formData="formData" />
              <previous-visits id="visits" :formData="formData" />
              <resource-needs id="needs" :formData="formData" :maxWorkingDays="maxWorkingDays" />
              <supporting-statement id="statement" :formData="formData" />
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
          <request-info :text="$t('request.request_info')" :moreText="$t('request.request_ta_more_info')" />
          <request-status v-if="formData" :formData="formData" />
          <div class="sticky-wrapper">
            <request-navigation :steps="steps" />
            <request-comments v-if="formData && requestId" :requestStatus="formData.status" :requestId="requestId" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
/* eslint-disable camelcase */
import {
  submitRequest,
  fetchRequestData,
  updateField,
  addInstitution,
  removeInstitution
} from '@/services/requestsService';

import { fetchInstitutions } from '@/services/institutionsService';
import { makeStringFromDateArray } from '@/modules/core/utils/helpers';
import ProjectSubject from './components/ta-request/ProjectSubject';
import ProjectDetails from './components/ta-request/ProjectDetails';
import OtherInstitutions from './components/ta-request/OtherInstitutions';
import ProjectMethodology from './components/ta-request/ProjectMethodology';
import PreviousVisits from './components/ta-request/PreviousVisits';
import ResourceNeeds from './components/ta-request/ResourceNeeds';
import SupportingStatement from './components/ta-request/SupportingStatement';
import RequestSubmit from './components/ta-request/RequestSubmit';
import RequestInfo from './components/RequestInfo';
import RequestStatus from './components/RequestStatus';
import RequestComments from './components/RequestComments';
import RequestNavigation from './components/RequestNavigation';

export default {
  components: {
    ProjectSubject,
    ProjectDetails,
    OtherInstitutions,
    ProjectMethodology,
    PreviousVisits,
    ResourceNeeds,
    SupportingStatement,
    RequestSubmit,
    RequestInfo,
    RequestStatus,
    RequestComments,
    RequestNavigation
  },

  computed: {
    requestTitle() {
      const subject = this.formData ? this.formData.subject : {};
      return subject && subject.value ? subject.value : 'New TA request';
    },

    institutionsSelected() {
      return this.formData?.institutions.length;
    },

    steps() {
      return [
        { id: 'details', name: 'Request details', disabled: false },
        { id: 'other', name: 'Other institutions', disabled: !this.institutionsSelected },
        { id: 'methodology', name: 'Project methodology', disabled: !this.institutionsSelected },
        { id: 'visits', name: 'Previous visits', disabled: !this.institutionsSelected },
        { id: 'needs', name: 'Resource needs', disabled: !this.institutionsSelected },
        { id: 'statement', name: 'Supporting statement', disabled: !this.institutionsSelected },
        { id: 'finish', name: 'Finish', disabled: !this.institutionsSelected }
      ];
    }
  },

  data() {
    return {
      formData: null,
      institutions: null,
      selectedInstitutions: [],
      activeStep: 0,
      clickable: true,
      requestId: null,
      loading: false,
      errorMessage: null,
      startDate: null,
      endDate: null,
      maxWorkingDays: null
    };
  },

  async created() {
    this.$root.$on('updateField', this.handleFormField);
    this.$root.$on('reload', this.getRequestData);
    this.$root.$on('set-working-days', this.setWorkingDays);
    this.requestId = this.$route.params.reqid;
    await this.getInstitutions();
    await this.getRequestData();
  },

  beforeDestroy() {
    this.$root.$off('updateField');
    this.$root.$off('reload');
    this.$root.$off('set-working-days');
  },

  methods: {
    async getRequestData() {
      if (this.requestId) {
        try {
          const response = await fetchRequestData(this.requestId);
          this.formData = response;
          this.selectedInstitutions = this.formData.institutions.map(i => i.name);
        } catch (error) {
          console.log(error);
        }
      }
    },

    setActiveStep(index) {
      this.activeStep = index;
    },

    setWorkingDays(count) {
      this.maxWorkingDays = count;
    },

    async getInstitutions() {
      const response = await fetchInstitutions();
      this.institutions = response.data.data.rows;
    },

    async selectInstitutions(institutionsList) {
      const loadingComponent = this.$buefy.loading.open();
      this.institutions.map(async institution => {
        if (institutionsList.includes(institution.name) && !this.selectedInstitutions.includes(institution.name)) {
          await this.addNewInstitution(institution);
        }
        if (this.selectedInstitutions.includes(institution.name) && !institutionsList.includes(institution.name)) {
          await removeInstitution(institution.id, this.formData.id);
        }
      });
      setTimeout(() => {
        this.getRequestData(this.requestId);
        loadingComponent.close();
      }, 1000);
    },

    async addNewInstitution(institution) {
      this.errorMessage = null;
      try {
        await addInstitution(institution.id, this.formData.id);
      } catch (error) {
        this.errorMessage = `Something went wrong selecting ${institution.name}. Is there a TA coordinator assigned to this institution?`;
        console.log(error);
      }
    },

    async handleFormField(payload) {
      if (!payload.fieldId) return;
      const [fieldId] = this.getPath(payload.fieldId);
      if (fieldId.includes('facility_list')) return;

      if (fieldId === 'institution') {
        await this.selectInstitutions(payload.value.value);
        return;
      }

      if (fieldId === 'start_date') {
        payload.value.value = makeStringFromDateArray(payload.value.value);
        this.startDate = payload.value.value;
        payload.fieldId = [fieldId];
        await this.submit(payload);

        if (new Date(this.startDate) > new Date(this.endDate)) {
          this.endDate = this.startDate;
          payload.fieldId = ['end_date'];
          payload.value.value = this.endDate;
          await this.submit(payload);
        }
        return;
      }

      if (fieldId === 'end_date') {
        payload.value.value = makeStringFromDateArray(payload.value.value);
        this.endDate = payload.value.value;
      }

      payload.fieldId = [fieldId];
      await this.submit(payload);
    },

    async submit(payload) {
      try {
        await updateField(this.requestId, payload);
      } catch (error) {
        console.log(error);
      }
    },

    getPath(fieldId) {
      const arr = fieldId.slice();
      if (arr.length > 1) arr.shift();
      return arr;
    },

    async submitRequest() {
      this.loading = true;
      try {
        const response = await submitRequest(this.requestId);
        if (response.status === 200) {
          setTimeout(() => {
            this.$router.push({
              name: 'requests'
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
          name: 'requests'
        });
        this.loading = false;
      }, 1500);
    }
  }
};
</script>

<style lang="scss" scoped>
.request-wrapper {
  border-top: 1px solid $grey-light;
  padding-top: 2em;
}
::v-deep .header {
  background: $yellow;
  padding: 0.4em 0.8em;
  margin-bottom: 1em;
}
::v-deep .field-row-body .form-field,
::v-deep .error-message .error {
  flex: 2;
}
</style>
