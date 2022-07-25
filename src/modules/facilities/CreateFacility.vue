<template>
  <div class="section">
    <div class="container">
      <router-link :to="{ path: `/institutions/${institutionId}`, query: { tab: 1 } }">
        <i class="feather icon-arrow-left" /> Back to {{ institutionName }}
      </router-link>
      <h1 class="title-link">New facility</h1>

      <div class="columns facility-wrapper">
        <div class="column is-8">
          <form @submit.prevent class="new-facility">
            <field-row
              field="StringField"
              label="Facility name"
              :value="form.name"
              :fieldOptions="{
                validation: $v.form.name,
                errorMessage: 'Please fill in a name first',
                placeHolder: 'Fill in a name first and press enter...',
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
import { fetchNewFacilityId, updateField } from '@/services/facilitiesService';
import { fetchInstitution } from '@/services/institutionsService';
import FieldRow from '@/modules/core/components/ui/formElements/FieldRow';

export default {
  components: {
    FieldRow
  },

  data() {
    return {
      institutionId: '',
      institutionName: '',
      form: {
        name: ''
      }
    };
  },

  validations: {
    form: {
      name: {
        required
      }
    }
  },

  async created() {
    this.$root.$on('updateField', this.createNewFacility);
    this.institutionId = this.$route.params.instId;
    this.getInstitutionName(this.institutionId);
  },

  beforeDestroy() {
    this.$root.$off('updateField');
  },

  methods: {
    async getInstitutionName(id) {
      const response = await fetchInstitution(id);
      this.institutionName = response.data.data.name;
    },

    async createNewFacility(event) {
      const { value } = event.value;
      if (!value) return;

      try {
        const response = await fetchNewFacilityId(this.institutionId);
        if (response) {
          const { id } = response.data.data;
          const payload = {
            context: { resource: 'facilities' },
            fieldId: ['nameEng'],
            value: { type: 'string', value }
          };
          await updateField(this.institutionId, id, payload);

          this.$router.push({
            name: 'facility-new',
            params: { instId: this.institutionId, id }
          });
        }
      } catch (error) {
        console.log(error);
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.facility-wrapper {
  border-top: 1px solid $grey-light;
}

.new-facility {
  display: flex;
  align-items: center;

  .field-input {
    display: flex;
    flex: 3;
    border: 1px solid $grey-medium;
    height: auto;
    padding: 0.5em;
    font-size: 1rem;
  }
  .field-label {
    flex: 1;
    text-align: right;
    margin: 0 1.5em;
    margin-bottom: 0;
    font-weight: 400;
    color: $black;
    position: relative;

    .required {
      color: $danger;
      position: absolute;
      top: -7px;
      right: -12px;
    }
  }
}
</style>
