<template>
  <div>
    <div class="action-bar">
      <div class="container">
        <o-button v-if="creatable" variant="primary" @click="createNewRequest">
          <span> <i class="feather icon-plus" /> {{ $t('call.new_request') }} </span>
        </o-button>
      </div>
    </div>
    <div class="section">
      <div class="container">
        <router-link :to="'/calls'">
          <i class="feather icon-arrow-left" /> {{ $t('call.back_to_calls') }}
        </router-link>
        <h1 class="title-link">{{ title }}</h1>
        <div class="columns request-wrapper">
          <div class="column is-8">
            <div v-if="call">
              <form @submit.prevent>
                <component
                  v-for="field in fields"
                  :is="field.type"
                  :key="field.id"
                  :value="call[field.id]"
                  :path="[field.id]"
                  :context="{ resource: 'calls', callId: call.id }"
                  :label="field.label"
                  :editable="false"
                  v-bind="{ ...field.options }"
                />
                <field-row
                  field="StringField"
                  label="Status"
                  :value="call.status"
                  :editable="false"
                  :fieldOptions="{ isTag: true }"
                />
                <div v-if="showScoring" class="scoring">
                  <div class="scoring-title"><strong>Scoring variables</strong></div>
                  <component
                    v-for="field in scoringFields"
                    :is="field.type"
                    :key="field.id"
                    :value="call.scoring.weight[field.id]"
                    :path="[field.id]"
                    :label="field.label"
                    :context="{ resource: 'scoring' }"
                    :editable="false"
                    v-bind="{ ...field.options }"
                  />
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import FieldRow from '@/modules/core/components/ui/formElements/FieldRow.vue';
import { fetchCallData } from '@/services/callsService';
import { isAllowed } from '@/modules/core/utils/auth';
import fields from './schemas/fields.json';

export default {
  components: {
    FieldRow,
  },

  computed: {
    title() {
      return this.call?.name || 'No title';
    },

    status() {
      return this.call?.status || '';
    },

    creatable() {
      return this.isAllowed('request_create') && this.status === 'available';
    },
  },

  data() {
    return {
      call: null,
      fields: fields.data,
      scoringFields: fields.scoring,
      showScoring: false,
    };
  },

  async created() {
    this.getCallData();
  },

  methods: {
    isAllowed(permission) {
      return isAllowed(permission);
    },

    async getCallData() {
      const { id } = this.$route.params;
      try {
        const response = await fetchCallData(id);

        [this.call] = response.data.data.rows;
        this.call.type = this.$t(`call.${this.call.type}`);
        this.call.scoring.weight.scoringEndDate = this.call.scoring.endDate;
        if (this.call.type.toLowerCase() === 'transnational access') this.showScoring = true;
      } catch (error) {
        console.log('error: ', error);
      }
    },

    createNewRequest() {
      if (this.call.type.toLowerCase() === 'va' || this.call.type.toLowerCase() === 'virtual access') {
        return this.$router.push({
          name: 'calls-new-va-request',
        });
      }
      this.$router.push({
        name: 'calls-new-ta-request',
      });
    },

    handleFormField(payload) {
      this.call[payload.fieldId] = payload.value.value;
      if (payload.fieldId.includes('startDate')) {
        this.setStartDate();
      }
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
}
.scoring-title {
  margin: 1em 0;
}
</style>
