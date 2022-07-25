<template>
  <div v-if="institutions">
    <div class="action-bar">
      <div class="container">
        <search :placeholder="$t('search.institution')" :query="searchTerm" @input="setSearchTerm" />
      </div>
    </div>
    <div class="section">
      <div class="container">
        <header>
          <h1>
            {{ $t('institution.institutions') }} <span v-if="filteredData">({{ filteredData.length }})</span>
          </h1>
        </header>
        <div>
          <b-table
            :data="filteredData"
            :row-class="(row, index) => 'row'"
            :mobile-cards="false"
            :paginated="filteredData.length > 10"
            :per-page="perPage"
            :current-page.sync="page"
            :default-sort-direction="defaultSortDirection"
            :sort-icon="sortIcon"
            :sort-icon-size="sortIconSize"
            :default-sort="defaultSort"
            @select="showDetails"
            @sort="(field, order) => setSorting(field, order)"
            hoverable
            data-cy="table"
          >
            <b-table-column field="id" label="Id" sortable v-slot="props">{{ props.row.id }}</b-table-column>
            <b-table-column field="name" label="Summary" sortable v-slot="props">
              <div class="emphasized">{{ props.row.name }}</div>
              <div>{{ props.row.fieldValues.country.value[0] }} {{ props.row.fieldValues.city.value }}</div>
            </b-table-column>
            <b-table-column field="fieldValues.country.value" label="Country" sortable v-slot="props">{{
              props.row.fieldValues.country.value ? props.row.fieldValues.country.value[0] : ''
            }}</b-table-column>

            <template slot="empty">
              {{ $t('institution.no_institutions_found') }}
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
import { fetchInstitutions } from '@/services/institutionsService';
import Search from '@/modules/core/components/ui/Search';
import Pager from '@/modules/core/components/ui/Pager';

export default {
  components: {
    Search,
    Pager
  },

  computed: {
    filteredData() {
      if (this.institutions && this.institutions.length && this.searchTerm) {
        return this.institutions.filter(d => search(d, this.searchTerm));
      }
      return this.institutions;
    }
  },

  // watch: {
  //   page: {
  //     handler(value) {
  //       this.page = value;
  //       const query = { page: value, perPage: this.perPage };
  //       this.$router.replace({
  //         name: 'institutions',
  //         query
  //       });
  //     }
  //   },
  //   perPage: {
  //     handler(value) {
  //       this.perPage = value;
  //       const query = { page: this.page, perPage: value };
  //       this.$router.replace({
  //         name: 'institutions',
  //         query
  //       });
  //     }
  //   }
  // },

  data() {
    return {
      institutions: null,
      defaultSort: this.$route.query.orderBy || 'name',
      defaultSortDirection: this.$route.query.direction || 'asc',
      sortIcon: 'arrow-up',
      sortIconSize: 'is-small',
      searchTerm: this.$route.query.q || '',
      page: Number(this.$route.query.page) || 1,
      perPage: Number(this.$route.query.perPage) || 10
    };
  },

  async created() {
    try {
      const response = await fetchInstitutions();
      this.institutions = response.data.data.rows;
    } catch (error) {
      console.log(error);
    }
    this.checkQuery();
  },

  methods: {
    showDetails(event) {
      const params = { instId: event.id };
      const { query } = this.$route;
      this.$router.push({
        name: 'institution-details',
        params,
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

<style lang="scss" scoped>
.details {
  cursor: pointer;
}
.is-large {
  font-size: 24px;
}
</style>
