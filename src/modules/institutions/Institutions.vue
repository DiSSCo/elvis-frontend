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
            {{ $t('institution.institutions') }}
            <span v-if="filteredData">({{ filteredData.length }})</span>
          </h1>
        </header>
        <div>
          <o-table :data="isEmpty ? [] : filteredData" hoverable :mobile-cards="hasMobileCards" :paginated="isPaginated"
            :per-page="perPage" :default-sort-direction="defaultSortDirection" :sort-icon="sortIcon"
            :sort-icon-size="sortIconSize" :default-sort="defaultSort" @select="row => showDetails(row)">
            <o-table-column field="id" label="Id" v-slot:default="props" sortable class="td-center">
              {{ props.row.id }}
            </o-table-column>

            <o-table-column field="name" label="Summary" v-slot:default="props" sortable>
              <div class="emphasized">{{ props.row.name }}</div>
              <div>
                {{ props.row.fieldValues.country.value[0] }}
                {{ props.row.fieldValues.city.value }}
              </div>
            </o-table-column>

            <o-table-column field="fieldValues.country.value" label="Country" v-slot:default="props" sortable>
              {{ props.row.fieldValues.country.value ? props.row.fieldValues.country.value[0] : '' }}
            </o-table-column>

            <template v-slot:empty>
              {{ $t('facility.no_facilities_found') }}
            </template>
            <template v-slot:bottom-left>
              <o-field grouped group-multiline>
                <o-select v-model="perPage" :disabled="!isPaginated">
                  <option value="10">10 per page</option>
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
import { fetchInstitutions } from '@/services/institutionsService';
import Search from '@/modules/core/components/ui/Search.vue';

export default {
  components: {
    Search,
  },

  computed: {
    filteredData() {
      if (this.institutions && this.institutions.length && this.searchTerm) {
        return this.institutions.filter((d) => search(d, this.searchTerm));
      }
      return this.institutions;
    },
  },

  watch: {
    page: {
      handler(value) {
        this.page = value;
        const query = { page: value, perPage: this.perPage };
        this.$router.replace({
          name: 'institutions',
          query,
        });
      },
    },
    perPage: {
      handler(value) {
        this.perPage = value;
        const query = { page: this.page, perPage: value };
        this.$router.replace({
          name: 'institutions',
          query,
        });
      },
    },
  },

  data() {
    return {
      institutions: null,
      defaultSort: this.$route.query.orderBy || 'name',
      defaultSortDirection: this.$route.query.direction || 'asc',
      sortIcon: 'arrow-up',
      sortIconSize: 'is-small',
      searchTerm: this.$route.query.q || '',
      page: Number(this.$route.query.page) || 1,
      perPage: Number(this.$route.query.perPage) || 10,
      isPaginated: ref(true),
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

<style lang="scss" scoped>
.details {
  cursor: pointer;
}

.is-large {
  font-size: 24px;
}
</style>

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
