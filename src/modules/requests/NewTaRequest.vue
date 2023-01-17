<template>
  <div class="section">
    <div class="container">
      <router-link :to="'/requests'">
        <i class="feather icon-arrow-left" /> {{ $t('request.back_to_requests') }}
      </router-link>
      <h1 class="title-link">New TA request</h1>

      <div class="columns request-wrapper">
        <div class="column is-8">
          <div>
            <form @submit.prevent>
              <field-row
                field="StringField"
                label="Request title"
                :value="form.subject"
                :fieldOptions="{
                  validation: v$.form.subject,
                  errorMessage: 'Please fill in a title for this request',
                  placeHolder: 'Fill in a title first and press enter...',
                  maxlength: 500
                }"
              />
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
import { fetchRequestId, updateField } from '@/services/requestsService';
import FieldRow from '@/modules/core/components/ui/formElements/FieldRow.vue';

export default {
  components: {
    FieldRow,
  },

  setup() {
    const v$ = useVuelidate();

    return { v$: v$ };
  },

  data() {
    return {
      form: {
        subject: '',
      },
    };
  },

  validations: {
    form: {
      subject: {
        required,
      },
    },
  },

  created() {
    this.emitter.on('updateField', this.createNewRequest);
  },

  beforeUnmount() {
    this.emitter.off('updateField');
  },

  methods: {
    async createNewRequest(event) {
      const { value } = event.value;
      if (!value) return;

      const { id } = this.$route.params;

      try {
        const response = await fetchRequestId(id);
        if (response) {
          const reqid = response.data.data.id;
          const payload = {
            context: { resource: 'requests' },
            fieldId: ['subject'],
            value: { type: 'string', value },
          };
          await updateField(reqid, payload);

          this.$router.push({
            name: 'calls-edit-ta-request',
            params: { id, reqid },
          });
        }
      } catch (error) {
        console.log(error);
      }
    },
  },
};
</script>
