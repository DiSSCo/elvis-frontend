<template>
  <div id="details" class="section">
    <div class="container">
      <router-link :to="{ name: 'request-details-ta', params: { id: requestId } }">
        <i class="feather icon-arrow-left" /> {{ $t('request.back_to_request') }}
      </router-link>
      <h1 class="title-link">Score application</h1>

      <div class="scoring-form">
        <form @submit.prevent>
          <component v-for="field in fields"
            :is="field.type"
            :key="field.id"
            :value="score[field.id]"
            :path="[field.id]"
            :fields="field.fields"
            :context="{ resource: 'requests', type: 'ta' }"
            :label="field.label" v-bind="{ ...field.options }" />
        </form>
        <div class="action-btns">
          <o-button @click="cancel" outlined class="cancelButton"> {{ $t('cancel') }} </o-button>
          <o-button variant="primary" :loading="loading" @click="save">
            {{ $t('save') }}
          </o-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  fetchRequestData, createScore, updateScore, viewScore,
} from '@/services/requestsService';
import { getProfile } from '@/modules/core/utils/auth';
import FieldRow from '@/modules/core/components/ui/formElements/FieldRow.vue';
import fields from './schemas/scoring.json';

export default {
  components: {
    FieldRow,
  },

  computed: {
    profile() {
      return getProfile();
    },
  },

  data() {
    return {
      score: {
        methodology: null,
        research_excellence: null,
        support_statement: null,
        justification: null,
        gains_outputs: null,
        merit: null,
        societal_challenge: null,
        comments: '',
      },
      requestId: null,
      fields: fields.data,
      formData: null,
      loading: false,
    };
  },

  created() {
    this.emitter.on('updateField', this.handleFormField);
    this.getRequestData();
    this.setOptions();
  },

  beforeUnmount() {
    this.emitter.off('updateField');
  },

  methods: {
    async getRequestData() {
      this.requestId = this.$route.params.id;
      try {
        this.request = await fetchRequestData(this.requestId);
        this.request.scoreFormId.map(async (score) => {
          const result = await viewScore(this.requestId, score.id);
          if (result.data.scorerId === this.profile.id) {
            this.setScoreValues(result.data.form.values);
          }
        });
      } catch (error) {
        console.log(error);
      }
    },

    setScoreValues(values) {
      this.score.methodology = values.methodology.value?.value || null;
      this.score.research_excellence = values.research_excellence.value?.value || null;
      this.score.support_statement = values.support_statement.value?.value || null;
      this.score.justification = values.justification.value?.value || null;
      this.score.gains_outputs = values.gains_outputs.value?.value || null;
      this.score.merit = values.merit.value?.value || null;
      this.score.societal_challenge = values.societal_challenge.value?.value || null;
      this.score.comments = values.comments.value?.value || '';
    },

    handleFormField(payload) {
      this.score[payload.fieldId] = payload.value.value;
    },

    setOptions() {
      this.fields.map((field) => {
        if (field.options.field === 'SelectField') {
          field.options.fieldOptions.options = Array.from(Array(10), (x, i) => i + 1);
        }
        return field;
      });
    },

    async save() {
      const loadingComponent = this.$oruga.loading.open();
      try {
        const response = await createScore(this.requestId);
        const { id } = response.data.data;

        const payload = Object.keys(this.score).map((fieldId) => {
          const value = this.score[fieldId];
          return {
            fieldId,
            value: {
              type: 'string',
              value,
            },
          };
        });
        await updateScore(this.requestId, id, { list: payload });
        setTimeout(() => {
          loadingComponent.close();
          this.$router.push({ name: 'request-details-ta', params: { id: this.requestId } });
        }, 2000);
      } catch (error) {
        console.log('error: ', error);
        loadingComponent.close();
      }
    },

    cancel() {
      this.$router.push({ name: 'request-details-ta', params: { id: this.requestId } });
    },
  },
};
</script>

<style lang="scss" scoped>
.action-btns {
  justify-content: flex-end;
}

:deep(.select-field) {
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
