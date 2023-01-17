<template>
  <div v-if="institution">
    <div v-if="isAllowed('institution_edit') && isOwnInstitution" class="action-bar">
      <div class="container">
        <div></div>
        <o-button class="primaryButton" @click.stop="editInstitution">
          <span> <i class="feather icon-plus" /> Edit institution </span>
        </o-button>
      </div>
    </div>
    <div class="section">
      <div class="container">
        <router-link :to="{ path: `/institutions`, query: $route.query }">
          <i class="feather icon-arrow-left" /> {{ $t('institution.back_to_institutions') }}
        </router-link>
        <h1 class="title-link">{{ institutionName }}</h1>

        <o-tabs :animated="false" v-model="activeTab">
          <o-tab-item label="Institution">
            <tab-institution :institution="institution" />
          </o-tab-item>

          <o-tab-item label="Facilities">
            <tab-facilities
              :institution="institution"
              :facilities="facilities"
              @reload="fetchFacilities(institution.id)"
            />
          </o-tab-item>

          <o-tab-item label="People">
            <tab-people :institution="institution" :people="people" @reload="fetchPeople(true)" />
          </o-tab-item>

          <o-tab-item label="Collections">
            Collections (this functionality will be implemented later in 2023)
          </o-tab-item>
        </o-tabs>
      </div>
    </div>
  </div>
</template>

<script>
import { isAllowed, isOwnInstitution } from '@/modules/core/utils/auth';
import { fetchInstitution } from '@/services/institutionsService';
import { fetchFacilitiesByInstitutionId } from '@/services/facilitiesService';
import { fetchUsers } from '@/services/usersService';
import TabInstitution from './components/TabInstitution.vue';
import TabFacilities from './components/TabFacilities.vue';
import TabPeople from './components/TabPeople.vue';

export default {
  components: {
    TabInstitution,
    TabFacilities,
    TabPeople,
  },

  data() {
    return {
      institution: null,
      facilities: null,
      people: null,
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
        let active = parseInt(this.$route.query.tab, 10) || 0;

        if (active === 0) {
          active = 1;
        }

        return active;
      },
    },
  },

  watch: {
    activeTab: {
      async handler(value) {
        if (!this.institution) await this.getInstitution();

        value = parseInt(value, 10);
        if (value === 2 && !this.facilities) {
          this.fetchFacilities(this.institution.id);
        }
        if (value === 3 && !this.people) {
          this.fetchPeople();
        }
      },
      immediate: true,
    },
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
          this.facilities.forEach((row) => {
            row.fieldValues.joinedInstruments = row.fieldValues.instruments
              ? Object.values(row.fieldValues.instruments).map(
                (instrument) => instrument.name.value,
              )
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
        query,
      });
    },
  },
};
</script>

<style lang="scss" scoped>
:deep(.tab-content) {
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

<style lang="css">
  .o-tabs__nav--default {
    border-bottom: 1px solid #dbdbdb;
  }

  .o-tabs__nav-item {
    border-bottom: 5px solid white;
    color: #868696;
  }

  .o-tabs__nav-item:hover {
    border-bottom: 5px solid #ffd85d !important;
  }

  .o-tabs__nav-item-default--active {
    color: #0c86c6;
    border-bottom: 5px solid #0c86c6;
  }

  .o-tabs__nav-item-default--active:hover {
    border-bottom: 5px solid #0c86c6 !important;
  }
</style>
