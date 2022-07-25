<template>
  <div v-if="facility" class="section">
    <div class="container">
      <router-link :to="{ path: `/institutions/${facility.institutionId}`, query: { tab: 1 } }">
        <i class="feather icon-arrow-left" /> Back to {{ facility.institutionName }}
      </router-link>
      <h1 class="title-link">{{ formTitle }}</h1>
      <div class="columns facility-wrapper">
        <div class="column is-8">
          <div v-if="facility">
            <facility-general :facility="facility" :editable="true" />

            <div class="facility-image-wrapper" :class="{ editable: facility.images.length }">
              <div v-if="facility.images.length" class="label">Facility image</div>
              <div class="facility-image-row">
                <span @click="removeImage" class="remove-image"><i class="feather icon-x" /></span>
                <facility-image class="facility-image" :facility="facility" :editable="true" @reload="fetchData" />
              </div>
            </div>

            <facility-instruments :facility="facility" :editable="true" />
            <div v-if="isAllowed('facility_create')" class="action-btns">
              <b-button type="is-primary" :loading="loading" @click="saveFacility">
                {{ $t('facility.facility_save') }}
              </b-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { isAllowed } from '@/modules/core/utils/auth';
import { fetchFacilityData, updateField, removeGroup, deleteImage } from '@/services/facilitiesService';
import FacilityGeneral from './components/FacilityGeneral';
import FacilityInstruments from './components/FacilityInstruments';
import FacilityImage from './components/FacilityImage';

export default {
  components: {
    FacilityGeneral,
    FacilityInstruments,
    FacilityImage
  },

  computed: {
    formTitle() {
      return this.facility?.fieldValues.nameEng?.value || 'No name';
    }
  },

  data() {
    return {
      facility: null,
      clickable: true,
      institutionId: null,
      facilityId: null,
      loading: false
    };
  },

  created() {
    this.$root.$on('updateField', this.handleFormField);
    this.$root.$on('removeGroup', this.handleRemoveGroup);

    this.institutionId = this.$route.params.instId;
    this.facilityId = this.$route.params.id;
    this.fetchData(this.facilityId);
  },

  beforeDestroy() {
    this.$root.$off('updateField');
    this.$root.$off('removeGroup');
  },

  methods: {
    isAllowed(permission) {
      return isAllowed(permission);
    },

    async fetchData(id) {
      try {
        const response = await fetchFacilityData(id);
        const [data] = response.data.data.rows;
        this.facility = data;
      } catch (error) {
        console.log(error);
      }
    },

    saveFacility() {
      this.loading = true;
      setTimeout(() => {
        this.$router.push({
          name: 'institution-details',
          params: { instId: this.institutionId }
        });
      }, 2000);
    },

    async handleFormField(payload) {
      try {
        await updateField(this.institutionId, this.facilityId, payload);
      } catch (error) {
        console.log(error);
      }
    },

    async handleRemoveGroup(payload) {
      try {
        await removeGroup(this.institutionId, this.facilityId, payload);
      } catch (error) {
        console.log(error);
      }
    },

    removeImage() {
      this.facility.images.map(async image => {
        try {
          await deleteImage(this.facility.institutionId, this.facility.id, image);
          this.fetchData(this.facilityId);
        } catch (error) {
          console.log(error);
        }
      });
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
.facility-image-wrapper {
  display: flex;
  margin-bottom: 2em;

  .label {
    flex: 1;
    text-align: right;
    margin: 0 1.5em;
    margin-bottom: 0;
    font-weight: 400;
    color: $black;
    position: relative;
  }
  .facility-image-row {
    flex: 3;
    display: flex;
    flex-flow: column nowrap;
    position: relative;

    .facility-image {
      justify-content: flex-start;
      margin-bottom: 0;
    }

    .remove-image {
      display: none;
      position: absolute;
      right: 5px;
      top: 5px;
      cursor: pointer;
      i {
        font-weight: bold;
        font-size: 1em;
      }
    }
  }
  &.editable {
    .facility-image-row {
      border: 1px solid $grey-medium;
    }
    .remove-image {
      display: inline-block;
    }
  }
}
</style>
