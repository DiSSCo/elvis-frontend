<template>
  <div v-if="institution">
    <div v-if="isAllowed('institution_edit') && isOwnInstitution" class="action-bar">
      <div class="container">
        <div></div>
        <b-button type="is-primary" @click.stop="editInstitution">
          <span> <i class="feather icon-plus" /> Edit institution </span>
        </b-button>
      </div>
    </div>
    <div class="section">
      <div class="container">
        <router-link :to="{ path: `/institutions`, query: $route.query }">
          <i class="feather icon-arrow-left" /> {{ $t('institution.back_to_institutions') }}
        </router-link>
        <h1 class="title-link">{{ institutionName }}</h1>

        <b-tabs :animated="false" v-model="activeTab">
          <b-tab-item label="Institution">
            <tab-institution :institution="institution" />
          </b-tab-item>

          <b-tab-item label="Facilities">
            <tab-facilities
              :institution="institution"
              :facilities="facilities"
              @reload="fetchFacilities(institution.id)"
            />
          </b-tab-item>

          <b-tab-item label="People">
            <tab-people :institution="institution" :people="people" @reload="fetchPeople(true)" />
          </b-tab-item>

          <b-tab-item label="Collections">
            Collections (this functionality will be implemented later in 2022)
          </b-tab-item>
        </b-tabs>
      </div>
    </div>
  </div>
</template>

<script>
import { isAllowed, isOwnInstitution } from '@/modules/core/utils/auth';
import { fetchInstitution } from '@/services/institutionsService';
import { fetchFacilitiesByInstitutionId } from '@/services/facilitiesService';
import { fetchUsers } from '@/services/usersService';
import TabInstitution from './components/TabInstitution';
import TabFacilities from './components/TabFacilities';
import TabPeople from './components/TabPeople';

export default {
  components: {
    TabInstitution,
    TabFacilities,
    TabPeople
  },

  data() {
    return {
      institution: null,
      facilities: null,
      people: null
    };
  },

  computed: {
    isOwnInstitution() {
      const { instId } = this.$route.params;
      return isOwnInstitution(instId);
    },

    institutionName() {
      return this.institution.name || 'No name yet';
    },

    activeTab: {
      set(val) {
        const query = { ...this.$route.query };
        query.tab = parseInt(val, 10);
        this.$router.push({ query });
      },
      get() {
        return parseInt(this.$route.query.tab, 10) || 0;
      }
    }
  },

  watch: {
    activeTab: {
      async handler(value) {
        if (!this.institution) await this.getInstitution();

        value = parseInt(value, 10);
        if (value === 1 && !this.facilities) {
          this.fetchFacilities(this.institution.id);
        }
        if (value === 2 && !this.people) {
          this.fetchPeople();
        }
      },
      immediate: true
    }
  },

  methods: {
    async getInstitution() {
      const { instId } = this.$route.params;
      try {
        const response = await fetchInstitution(instId);
        this.institution = response.data.data;
      } catch (error) {
        console.log(error);
      }
    },

    isAllowed(permission) {
      return isAllowed(permission);
    },

    async fetchPeople(reload = false) {
      const response = await fetchUsers(reload);
      this.people = response.data.data.rows;
    },

    async fetchFacilities(id) {
      try {
        const response = await fetchFacilitiesByInstitutionId(id);
        this.facilities = response.data.data.rows;
        if (this.facilities && this.facilities.length) {
          this.facilities.map(row => {
            row.fieldValues.joinedInstruments = row.fieldValues.instruments
              ? Object.values(row.fieldValues.instruments).map(instrument => instrument.name.value)
              : [];
            row.country = '';
          });
        }
      } catch (error) {
        console.log('error: ', error);
      }
    },

    editInstitution() {
      const { instId } = this.$route.params;
      const { query } = this.$route;
      this.$router.push({
        name: 'institution-edit',
        params: { instId },
        query
      });
    }
  }
};
</script>

<style lang="scss" scoped>
::v-deep .tab-content {
  margin-top: 1em;
}
.details {
  cursor: pointer;
}
.profile-pic {
  border-radius: 50%;
  width: 50px;
  height: 50px;
  overflow: hidden;

  img {
    height: 100%;
    object-fit: cover;
  }
}

dl:not(:last-child) {
  border-bottom: 1px solid $grey;
  margin-bottom: 1em;
  padding-bottom: 1em;
}
</style>
