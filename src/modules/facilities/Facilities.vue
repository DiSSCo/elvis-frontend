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
          <b-table
            :data="filteredData"
            :row-class="(row, index) => 'row'"
            :mobile-cards="false"
            :paginated="totalPages > 10"
            :per-page="perPage"
            :default-sort-direction="defaultSortDirection"
            :sort-icon="sortIcon"
            :sort-icon-size="sortIconSize"
            :default-sort="defaultSort"
            @select="showDetails"
            @sort="(field, order) => setSorting(field, order)"
            hoverable
          >
            <b-table-column field="fieldValues.nameEng.value" label="Facility" width="250" sortable v-slot="props">
              {{ props.row.fieldValues.nameEng.value }}
            </b-table-column>
            <b-table-column
              field="fieldValues.joinedInstruments"
              label="Instruments & Services"
              sortable
              v-slot="props"
            >
              {{ props.row.fieldValues.joinedInstruments.join(', ') }}
            </b-table-column>
            <b-table-column field="institutionName" label="Provided by" width="250" sortable v-slot="props">
              {{ props.row.institutionName }}
            </b-table-column>
            <b-table-column field="country" label="Country" width="150" sortable v-slot="props">
              {{ props.row.country[0] }}
            </b-table-column>

            <template slot="empty">
              {{ $t('facility.no_facilities_found') }}
            </template>
            <template slot="bottom-left">
              <pager :total="filteredData.length" :perPage="perPage" @input="setPerPage" />
            </template>
          </b-table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { search, setQuery } from '@/modules/core/utils/helpers';
import Search from '@/modules/core/components/ui/Search';
import { fetchFacilities } from '@/services/facilitiesService';
import { fetchInstitutions } from '@/services/institutionsService';
import Pager from '@/modules/core/components/ui/Pager';

export default {
  components: {
    Search,
    Pager
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
      loading: false
    };
  },

  computed: {
    filteredData() {
      if (this.facilities && this.facilities.length && this.searchTerm) {
        return this.facilities.filter(d => search(d, this.searchTerm));
      }
      return this.facilities;
    }
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
          response.data.data.rows.map(fac => {
            fac.fieldValues.joinedInstruments = fac.fieldValues.instruments
              ? Object.values(fac.fieldValues.instruments).map(instrument => instrument.name.value)
              : [];
            const found = institutions.find(row => row.id === fac.institutionId);
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
        query
      });
    },

    setSearchTerm(event) {
      this.searchTerm = event;
      const query = { ...this.$route.query, q: this.searchTerm };
      setQuery(query);
    },

    setSorting(field, order) {
      this.defaultSort = field;
      this.defaultSortDirection = order;
      const query = { ...this.$route.query, orderBy: this.defaultSort, direction: this.defaultSortDirection };
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
        q: this.searchTerm
      };
      setQuery(query);
    }
  }
};
</script>

<style lang="scss" scoped></style>
