<template>
  <div>
    <div class="section">
      <div class="container">
        <router-link :to="{ path: `/institutions/${institutionId}`, query: $route.query }">
          <i class="feather icon-arrow-left" /> Back to {{ institutionName }}
        </router-link>
        <h1 class="title-link">{{ institutionName }}</h1>
        <div v-if="institution">
          <institution-name :institution="institution" :editable="true" />
          <institution-general :institution="institution" :editable="true" />
          <institution-address :institution="institution" :editable="true" />
          <institution-locations :institution="institution" :editable="true" />
          <div class="action-btns">
            <b-button type="is-primary" :loading="loading" @click="saveInstitution">
              {{ $t('institution.institution_save') }}
            </b-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { fetchInstitution, updateField, removeGroup, updateCetaf } from '@/services/institutionsService';
import InstitutionName from './components/InstitutionName';
import InstitutionGeneral from './components/InstitutionGeneral';
import InstitutionAddress from './components/InstitutionAddress';
import InstitutionLocations from './components/InstitutionLocations';

export default {
  components: {
    InstitutionName,
    InstitutionGeneral,
    InstitutionAddress,
    InstitutionLocations
  },

  computed: {
    institutionName() {
      return this.institution?.fieldValues?.name?.value || 'No name yet';
    },

    institutionId() {
      return this.$route.params.instId;
    }
  },

  data() {
    return {
      institution: null,
      loading: false
    };
  },

  async created() {
    this.$root.$on('updateField', this.handleFormField);
    this.$root.$on('removeGroup', this.handleRemoveGroup);
    this.getInstitution(this.institutionId);
  },

  beforeDestroy() {
    this.$root.$off('updateField');
    this.$root.$off('removeGroup');
  },

  methods: {
    async getInstitution(id) {
      try {
        const response = await fetchInstitution(id);
        this.institution = response.data.data;
      } catch (error) {
        console.log(error);
      }
    },

    async handleFormField(payload) {
      if (payload.fieldId.includes('cetaf')) {
        const cetafPayload = {
          context: { resource: 'institutions', institutionId: this.institution.id },
          name: this.institution.name,
          cetaf: payload?.value.value
        };
        this.$set(this.institution, 'cetaf', payload?.value.value || null);
        await updateCetaf(cetafPayload);
      } else {
        try {
          await updateField(payload);
        } catch (error) {
          console.log(error);
        }
      }
    },

    async handleRemoveGroup(payload) {
      try {
        await removeGroup(payload);
      } catch (error) {
        console.log(error);
      }
    },

    saveInstitution() {
      this.loading = true;
      setTimeout(() => {
        this.$router.push({
          name: 'institution-details',
          params: { id: this.institutionId }
        });
      }, 2000);
    }
  }
};
</script>

<style lang="scss" scoped></style>
