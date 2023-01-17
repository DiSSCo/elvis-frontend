<template>
  <div>
    <div class="section">
      <div class="container">
        <router-link :to="'/calls'">
          <i class="feather icon-arrow-left" />
          {{ $t('call.back_to_calls') }}
        </router-link>

        <h1 class="title-link">{{ title }}</h1>
        <div class="columns request-wrapper">
          <div class="column is-8">
            <form v-if="call" @submit.prevent>
              <component v-for="field in fields" :is="field.type" :key="field.id"
                :value="call[field.id]" :path="[field.id]" :label="field.label"
                :context="{ resource: 'calls' }" v-bind="{ ...field.options }" />
              <transition name="fade" mode="out-in">
                <div v-if="showScoring" class="scoring">
                  <div class="scoring-title"><strong>Scoring variables</strong></div>

                  <component v-for="field in scoringFields" :is="field.type"
                  :key="field.id" :value="score[field.id]" :path="[field.id]" :label="field.label"
                  :context="{ resource: 'scoring' }" v-bind="{ ...field.options }" />
                </div>
              </transition>

              <div class="action-btns">
                <o-button :loading="loadingCancel" @click="cancel" outlined class="cancelButton">
                  {{ $t('cancel') }}
                </o-button>
                <o-button class="primaryButton"
                  :loading="loading"
                  :disabled="!formIsValid"
                  @click.stop="saveCall"
                >
                  {{ $t('call.call_save') }}
                </o-button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import useVuelidate from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import { createCall, editCall, fetchCallData } from '@/services/callsService';
import { makeStringFromDateArray } from '@/modules/core/utils/helpers';
import FieldRow from '@/modules/core/components/ui/formElements/FieldRow.vue';
import fields from './schemas/fields.json';

export default {
  components: {
    FieldRow,
  },

  props: {
    editable: {
      type: Boolean,
      default: false,
    },
  },

  computed: {
    title() {
      return this.call?.name ? this.call.name : 'New Call';
    },
  },

  setup() {
    const v$ = useVuelidate();

    return { v$: v$ };
  },

  data() {
    return {
      call: {
        name: '',
        type: null,
        description: '',
        additionalInfo: '',
        startDate: null,
        endDate: null,
      },
      score: {
        scoringEndDate: null,
        methodology: '1',
        researchExcellence: '1',
        supportStatement: '1',
        justification: '1',
        gainsOutputs: '1',
        merit: '1',
        societalChallenge: '1',
      },
      showScoring: false,
      fields: fields.data,
      scoringFields: fields.scoring,
      loading: false,
      loadingCancel: false,
      formIsValid: true,
      callId: null,
    };
  },

  validations: {
    call: {
      name: {
        required,
      },
      type: {
        required,
      },
      startDate: {
        required,
      },
      endDate: {
        required,
      },
    },
    score: {
      scoringEndDate: {
        required,
      },
    },
  },

  async created() {
    this.emitter.on('updateField', this.handleFormField);
    this.emitter.on('isValid', this.checkIfValid);
    await this.setupForEdit();
    this.setValidation();
  },

  beforeUnmount() {
    this.emitter.off('updateField');
    this.emitter.off('isValid');
  },

  methods: {
    async getCallData() {
      this.callId = this.$route.params.id;
      try {
        const response = await fetchCallData(this.callId);
        return response.data.data.rows;
      } catch (error) {
        console.log('error: ', error);
      }
    },

    async setupForEdit() {
      const found = this.fields.find((field) => field.id === 'type');
      found.options.editable = !this.editable;
      found.options.fieldOptions.errorMessage = this.editable ? null : 'Please choose a type for this call';
      if (this.editable) {
        const [data] = await this.getCallData();
        this.prefillFields(data);
      }
    },

    prefillFields(data) {
      const call = { ...this.call };
      const score = { ...this.score };
      this.call = null;
      this.score = null;
      Object.keys(call).forEach((key) => {
        if (Object.keys(data).includes(key)) {
          call[key] = data[key];
        }
      });

      Object.keys(score).forEach((key) => {
        if (Object.keys(data.scoring.weight).includes(key)) {
          score[key] = data.scoring.weight[key];
        }
      });
      score.scoringEndDate = data.scoring.endDate;
      call.type = this.$t(`call.${call.type}`);
      if (call.type.toLowerCase() === 'transnational access') this.showScoring = true;
      this.call = call;
      this.score = score;
    },

    setValidation() {
      this.fields = this.fields.map((field) => {
        if (field.options.fieldOptions?.errorMessage) {
          field.options.fieldOptions.validation = this.v$.call[field.id];
        }
        return field;
      });
      this.scoringFields = this.scoringFields.map((field) => {
        if (field.options.fieldOptions?.errorMessage) {
          field.options.fieldOptions.validation = this.v$.score[field.id];
        }
        return field;
      });
    },

    handleFormField(payload) {
      if (payload.fieldId.includes('type')) {
        this.checkIfScoring(payload.value.value);
      }
      if (payload.context.resource === 'scoring') {
        this.score[payload.fieldId] = payload.value.value;
      } else {
        this.call[payload.fieldId] = payload.value.value;
      }
      if (payload.fieldId.includes('startDate')) {
        this.setStartDate(payload.value.value);
      }
      if (payload.fieldId.includes('endDate')) {
        this.setEndDate(payload.value.value);
      }
    },

    checkIfScoring(type) {
      this.showScoring = type.toLowerCase() === 'transnational access';
    },

    setStartDate(date) {
      const found = this.fields.find((field) => field.id === 'endDate');
      if (found) {
        found.options.fieldOptions.minDate = new Date(makeStringFromDateArray(date));
      }
      if (
        this.call.endDate
        && new Date(makeStringFromDateArray(date))
        >= new Date(makeStringFromDateArray(this.call.endDate))
      ) {
        this.call.endDate = date;
      }
    },

    setEndDate(date) {
      const found = this.scoringFields.find((field) => field.id === 'scoringEndDate');
      if (found) {
        found.options.fieldOptions.minDate = new Date(makeStringFromDateArray(date));
      }
      if (
        this.score.scoringEndDate
        && new Date(makeStringFromDateArray(date))
        >= new Date(makeStringFromDateArray(this.score.scoringEndDate))
      ) {
        this.score.scoringEndDate = date;
      }
    },

    async saveCall() {
      this.loading = true;
      this.v$.call.$touch();
      if (this.showScoring) this.v$.score.$touch();
      const isValid = this.showScoring
        ? !this.v$.call.$invalid && !this.v$.score.$invalid : !this.v$.call.$invalid;
      if (isValid) {
        const loadingComponent = this.$oruga.loading.open();
        try {
          this.call.type = this.call.type.toLowerCase() === 'virtual access' ? 'VA' : 'TA';
          const scoreFields = {
            scoringEndDate: this.score.scoringEndDate,
            scoringWeight: { ...this.score },
          };
          delete scoreFields.scoringWeight.scoringEndDate;
          const payload = this.showScoring ? { ...this.call, ...scoreFields } : this.call;
          this.editable ? this.editCall(payload) : await createCall(payload);
          setTimeout(() => {
            loadingComponent.close();
            this.$router.push({
              name: 'calls',
            });
          }, 1000);
        } catch (error) {
          console.log('error: ', error);
          this.loading = false;
          loadingComponent.close();
        }
      } else {
        this.loading = false;
      }
    },

    async editCall(payload) {
      const copyPayload = { ...payload };

      delete copyPayload.type;
      await editCall(this.callId, copyPayload);
    },

    checkIfValid(event) {
      this.formIsValid = event;
    },

    cancel() {
      this.$router.push({
        name: 'calls',
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.action-bar .container {
  justify-content: flex-end;
}

.action-btns {
  justify-content: flex-end;

  .button {
    margin-left: 1em;
  }
}

.scoring {
  border-top: 1px solid $grey;
  border-bottom: 1px solid $grey;
  padding-top: 2em;
  margin-bottom: 2em;

  .scoring-title {
    margin-bottom: 1em;
  }
}

.scoring-form {
  margin-top: 1em;
}

:deep(.scoring .select-field) {
  flex: 0 1 120px !important;
}
</style>

<style>
.cancelButton {
  border-color: #dbdbdb;
  color: #363636;
}

.cancelButton:hover {
  border-color: #dbdbdb;
  color: #363636;
  background-color: white;
}
</style>
