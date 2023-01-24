<template>
  <div v-if="facility" class="section">
    <div class="container">
      <div class="redirect-link">
        <router-link :to="{ path: `/facilities`, query: $route.query }">
          <i class="feather icon-arrow-left" /> Back to facilities
        </router-link>
      </div>
      <div class="redirect-link">
        <router-link :to="{ path: `/institutions/${facility.institutionId}`, query: { tab: 1 } }">
          <i class="feather icon-arrow-left" /> To {{ facility.institutionName }}
        </router-link>
      </div>
      <h1 class="title-link">{{ title }}</h1>
      <div>
        <div class="columns">
          <div class="column is-9">
            <facility-general :facility="facility" />
          </div>
          <div class="column is-3">
            <facility-image :facility="facility" />
          </div>
        </div>
      </div>
      <div>
        <facility-instruments :facility="facility" />
      </div>
    </div>
  </div>
</template>

<script>
import { fetchFacilityData } from '@/services/facilitiesService';
import FacilityGeneral from './components/FacilityGeneral.vue';
import FacilityImage from './components/FacilityImage.vue';
import FacilityInstruments from './components/FacilityInstruments.vue';

export default {
  components: {
    FacilityGeneral,
    FacilityImage,
    FacilityInstruments,
  },

  computed: {
    title() {
      const subject = this.facility ? this.facility.fieldValues.nameEng : {};
      return subject && subject.value ? subject.value : 'New facility';
    },
  },

  data() {
    return {
      facility: null,
      loading: false,
    };
  },

  created() {
    this.fetchData();
  },

  methods: {
    async fetchData() {
      const { id } = this.$route.params;
      try {
        const response = await fetchFacilityData(id);
        const [data] = response.data.data.rows;
        this.facility = data;
      } catch (error) {
        console.log(error);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.card-header {
  border: 1px solid $grey;
  &.institution {
    background: $blue;
    border: 1px solid $blue;
    color: $white;
    margin-bottom: 1em;
    .card-header-title {
      color: $white;
    }
  }
  .card-header-icon {
    font-size: 24px;
  }
}
</style>
