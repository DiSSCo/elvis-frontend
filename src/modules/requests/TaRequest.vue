<template>
  <div>
    <div class="action-bar">
      <div class="container">
        <div class="action-btns">
          <b-button v-if="canScore" type="is-primary" @click="goToScoring">
            <span> <i class="feather icon-award" /> {{ $t('request.score') }} </span>
          </b-button>
          <b-button v-if="canViewScores" type="is-primary" @click="viewScores">
            <span> <i class="feather icon-bar-chart-2" /> {{ $t('request.view_scores') }} </span>
          </b-button>
        </div>
      </div>
    </div>
    <div id="details" class="section">
      <div class="container">
        <router-link :to="{ path: '/requests', query: $route.query }">
          <i class="feather icon-arrow-left" /> {{ $t('request.back_to_requests') }}
        </router-link>
        <h1 class="title-link">{{ requestTitle }}</h1>
        <div class="columns request-wrapper">
          <div class="column is-8">
            <div v-if="formData && institutions">
              <project-subject :formData="formData" :institutions="institutions" :editable="false" />
              <div v-if="formData.institutions.length">
                <project-details :formData="formData" :editable="false" />
                <other-institutions id="other" :formData="formData" :institutions="institutions" :editable="false" />
                <project-methodology id="methodology" :formData="formData" :editable="false" />
                <previous-visits id="visits" :formData="formData" :editable="false" />
                <resource-needs
                  v-if="facilities"
                  id="needs"
                  :formData="formData"
                  :facilities="facilities"
                  :editable="false"
                />
                <supporting-statement id="statement" :formData="formData" :editable="false" />
              </div>
            </div>
          </div>
          <div class="column is-4">
            <request-status v-if="formData" :formData="formData" />
            <div class="sticky-wrapper">
              <request-navigation :steps="steps" />
              <request-comments v-if="formData && requestId" :requestStatus="formData.status" :requestId="requestId" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
/* eslint-disable camelcase */
import { fetchRequestData } from '@/services/requestsService';
import { fetchFacilitiesByInstitutionId } from '@/services/facilitiesService';
import { fetchInstitutions } from '@/services/institutionsService';
import ProjectSubject from './components/ta-request/ProjectSubject';
import ProjectDetails from './components/ta-request/ProjectDetails';
import OtherInstitutions from './components/ta-request/OtherInstitutions';
import ProjectMethodology from './components/ta-request/ProjectMethodology';
import PreviousVisits from './components/ta-request/PreviousVisits';
import ResourceNeeds from './components/ta-request/ResourceNeeds';
import SupportingStatement from './components/ta-request/SupportingStatement';
import RequestStatus from './components/RequestStatus';
import RequestComments from './components/RequestComments';
import RequestNavigation from './components/RequestNavigation';
import { fetchCallData } from '@/services/callsService';
import { isAllowed, isAdmin, isTafAdmin } from '@/modules/core/utils/auth';
import { isAfterDate } from '@/modules/core/utils/helpers';

export default {
  components: {
    ProjectSubject,
    ProjectDetails,
    OtherInstitutions,
    ProjectMethodology,
    PreviousVisits,
    ResourceNeeds,
    SupportingStatement,
    RequestStatus,
    RequestComments,
    RequestNavigation
  },

  computed: {
    requestTitle() {
      const subject = this.formData ? this.formData.fieldValues.subject : {};
      return subject && subject.value ? subject.value : 'New TA request';
    },

    noInstitutionYet() {
      return !this.formData?.institutions?.length;
    },

    steps() {
      return [
        { id: 'details', name: 'Request details', disabled: false },
        { id: 'other', name: 'Other institutions', disabled: this.noInstitutionYet },
        { id: 'methodology', name: 'Project methodology', disabled: this.noInstitutionYet },
        { id: 'visits', name: 'Previous visits', disabled: this.noInstitutionYet },
        { id: 'needs', name: 'Resource needs', disabled: this.noInstitutionYet },
        { id: 'statement', name: 'Supporting statement', disabled: this.noInstitutionYet }
      ];
    },

    isAdmin() {
      return isAdmin();
    },

    isTafAdmin() {
      return isTafAdmin();
    },

    isAfterDate() {
      return this.call?.scoring.endDate ? isAfterDate(this.call.scoring.endDate) : false;
    },

    canScore() {
      return (
        !this.isAfterDate &&
        this.isAllowed('request_score') &&
        (this.formData?.status === 'approved' || this.formData?.status === 'scoring')
      );
    },

    canViewScores() {
      return (
        (this.isTafAdmin || this.isAdmin) &&
        this.formData?.scoreFormId?.length &&
        (this.formData?.status === 'approved' || this.formData?.status === 'scoring')
      );
    }
  },

  data() {
    return {
      formData: null,
      institutions: null,
      facilities: null,
      call: null,
      activeStep: 0,
      clickable: true,
      requestId: null,
      loading: false
    };
  },

  async created() {
    this.$root.$on('reload', this.getRequestData);
    this.requestId = this.$route.params.id;
    await this.getInstitutions();

    if (this.requestId) {
      await this.getRequestData(this.requestId);
    }
  },

  methods: {
    isAllowed(permission) {
      return isAllowed(permission);
    },

    async getRequestData(id) {
      try {
        const data = await fetchRequestData(id);
        const response = await fetchCallData(data.callId);
        [this.call] = response.data.data.rows;
        if (data.institutions.length) {
          const [institution] = data.institutions;
          this.selectedInstitution = institution;
          data.fieldValues.institution = this.selectedInstitution.name;
          this.fetchFacilities(institution.id);
        }
        this.formData = data;
      } catch (error) {
        console.log(error);
      }
    },

    setActiveStep(index) {
      this.activeStep = index;
    },

    async getInstitutions() {
      const response = await fetchInstitutions();
      this.institutions = response.data.data.rows;
    },

    async fetchFacilities(institutionId) {
      try {
        const response = await fetchFacilitiesByInstitutionId(institutionId);
        this.facilities = response.data.data.rows;
      } catch (error) {
        console.log('error: ', error);
      }
    },

    goToScoring() {
      const { id } = this.$route.params;
      const params = { id };
      this.$router.push({
        name: 'request-scoring-ta',
        params
      });
    },

    viewScores() {
      const { id } = this.$route.params;
      const params = { id };
      this.$router.push({
        name: 'request-view-scores-ta',
        params
      });
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

.action-btns {
  justify-content: flex-end;
}
</style>
