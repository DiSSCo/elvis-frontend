<template>
  <div v-if="facilities">
    <div class="action-bar">
      <div class="container">
        <search :placeholder="$t('search.facilities')" :query="searchTerm" @input="setSearchTerm" />
      </div>
    </div>
    <div class="section">
      <div class="container">
        <header>
          <h1>
            {{ $t('facility.facilities') }}
            <span v-if="filteredData">({{ filteredData.length }})</span>
          </h1>
        </header>
        <div>
          <o-table :data="isEmpty ? [] : filteredData" hoverable :mobile-cards="hasMobileCards" :paginated="isPaginated"
            :per-page="perPage" :default-sort-direction="defaultSortDirection" :sort-icon="sortIcon"
            :sort-icon-size="sortIconSize" :default-sort="defaultSort" @select="row => showDetails(row)">
            <o-table-column field="fieldValues.nameEng.value" label="Facility" v-slot:default="props" sortable>
              {{ props.row.fieldValues.nameEng.value }}
            </o-table-column>

            <o-table-column field="fieldValues.joinedInstruments" label="Instruments & Services" v-slot:default="props"
              sortable>
              {{ props.row.fieldValues.joinedInstruments.join(', ') }}
            </o-table-column>

            <o-table-column field="institutionName" label="Provided by" v-slot:default="props" sortable>
              {{ props.row.institutionName }}
            </o-table-column>

            <o-table-column field="country" label="Country" v-slot:default="props" sortable>
              {{ props.row.country[0] }}
            </o-table-column>

            <template v-slot:empty>
              {{ $t('facility.no_facilities_found') }}
            </template>
            <template v-slot:bottom-left>
              <o-field grouped group-multiline>
                <o-select v-model="perPage" :disabled="!isPaginated">
                  <option value="10">10 per page</option>
                  <option value="25">25 per page</option>
                  <option value="50">50 per page</option>
                  <option value="100">100 per page</option>
                  <option :value="filteredData.length"> {{ `${filteredData.length} per page` }} </option>
                </o-select>
              </o-field>
            </template>
          </o-table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { search, setQuery } from '@/modules/core/utils/helpers';
import Search from '@/modules/core/components/ui/Search.vue';
import { fetchFacilities } from '@/services/facilitiesService';
import { fetchInstitutions } from '@/services/institutionsService';
// import Pager from '@/modules/core/components/ui/Pager.vue';

export default {
  components: {
    Search,
    // Pager,
  },

  data() {
    return {
      facilities: null,
      defaultSort: this.$route.query.orderBy || 'fieldValues.nameEng.value',
      defaultSortDirection: this.$route.query.direction || 'asc',
      sortIcon: 'arrow-up',
      sortIconSize: 'is-small',
      searchTerm: this.$route.query.q || '',
      currentPage: 1,
      perPage: Number(this.$route.query.perPage) || 10,
      totalPages: 0,
      loading: false,
      isPaginated: ref(true),
    };
  },

  computed: {
    filteredData() {
      if (this.facilities && this.facilities.length && this.searchTerm) {
        return this.facilities.filter((d) => search(d, this.searchTerm));
      }
      return this.facilities;
    },
  },

  created() {
    this.getFacilities();
    this.checkQuery();
  },

  methods: {
    async getFacilities() {
      try {
        const instResponse = await fetchInstitutions();
        const institutions = instResponse.data.data.rows;
        const response = await fetchFacilities();
        if (response.data.data.rows.length) {
          response.data.data.rows.forEach((fac) => {
            fac.fieldValues.joinedInstruments = fac.fieldValues.instruments
              ? Object.values(fac.fieldValues.instruments).map(
                (instrument) => instrument.name.value,
              )
              : [];
            const found = institutions.find((row) => row.id === fac.institutionId);
            fac.country = found ? (found.fieldValues.country ? found.fieldValues.country.value : '') : '';
          });
        }
        this.facilities = response.data.data.rows;
        this.totalPages = response.data.data.pagination.total;
      } catch (error) {
        console.log(error);
      }
    },

    showDetails(event) {
      const { query } = this.$route;

      this.$router.push({
        name: 'facility-details',
        params: { instId: event.institutionId, id: event.id },
        query,
      });
    },

    setSearchTerm(event) {
      if (typeof event === 'object') {
        this.searchTerm = event.target.value;

        const query = { ...this.$route.query, q: this.searchTerm };
        setQuery(query);
      } else {
        this.searchTerm = event;

        const query = { ...this.$route.query, q: this.searchTerm };
        setQuery(query);
      }
    },

    setSorting(field, order) {
      this.defaultSort = field;
      this.defaultSortDirection = order;
      const query = {
        ...this.$route.query,
        orderBy: this.defaultSort,
        direction: this.defaultSortDirection,
      };
      setQuery(query);
    },

    setPerPage(count) {
      this.perPage = count;
      const query = { ...this.$route.query, perPage: this.perPage };
      setQuery(query);
    },

    checkQuery() {
      const query = {
        ...this.$route.query,
        orderBy: this.defaultSort,
        direction: this.defaultSortDirection,
        perPage: this.perPage,
        q: this.searchTerm,
      };
      setQuery(query);
    },
  },
};
</script>

<style lang="css">
td {
  font-size: 14px !important;
  padding-top: 1em !important;
  padding-bottom: 1em !important;
}

td:hover {
  cursor: pointer !important;
}

.td-center {
  vertical-align: middle !important;
}
</style>
