<template>
  <div class="section">
    <div class="container">
      <router-link :to="'/requests'">
        <i class="feather icon-arrow-left" /> {{ $t('request.back_to_requests') }}
      </router-link>
      <h1 class="title-link">New VA request</h1>

      <div class="columns">
        <div class="column is-8">
          <form @submit.prevent>
            <field-row
              field="StringField"
              label="Request title"
              :value="form.subject"
              :fieldOptions="{
                validation: $v.form.subject,
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
</template>

<script>
import { required } from 'vuelidate/lib/validators';
import { fetchRequestId, updateField } from '@/services/requestsService';
import FieldRow from '@/modules/core/components/ui/formElements/FieldRow';

export default {
  components: {
    FieldRow
  },

  data() {
    return {
      form: {
        subject: ''
      }
    };
  },

  validations: {
    form: {
      subject: {
        required
      }
    }
  },

  created() {
    this.$root.$on('updateField', this.createNewRequest);
  },

  beforeDestroy() {
    this.$root.$off('updateField');
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
            value: { type: 'string', value }
          };
          await updateField(reqid, payload);

          this.$router.push({
            name: 'calls-edit-va-request',
            params: { id, reqid }
          });
        }
      } catch (error) {
        console.log(error);
      }
    }
  }
};
</script>
