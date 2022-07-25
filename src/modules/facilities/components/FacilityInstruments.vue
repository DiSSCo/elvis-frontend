<template>
  <div v-if="facility">
    <form v-if="editable" @submit.prevent>
      <component
        v-for="field in fields"
        :is="field.type"
        :key="field.id"
        :value="facility.fieldValues[field.id]"
        :path="[field.id]"
        :context="{ resource: 'facilities', institutionId: facility.institutionId }"
        :label="field.label"
        :showLabel="editable"
        :fields="field.fields"
        :editable="editable"
        v-bind="{ ...field.options }"
      />
    </form>
    <div v-else>
      <b-table
        :data="instruments"
        :row-class="(row, index) => 'row'"
        :mobile-cards="false"
        :default-sort-direction="defaultSortDirection"
        :sort-icon="sortIcon"
        :sort-icon-size="sortIconSize"
        default-sort="name"
        data-cy="table"
      >
        <b-table-column field="name" label="Instrument or service" width="250" sortable v-slot="props">
          <div>{{ props.row.name ? props.row.name.value : '' }}</div>
        </b-table-column>
        <b-table-column field="description" label="Description" sortable v-slot="props">
          <div v-html="props.row.description ? anchorLinks(props.row.description.value) : ''" />
        </b-table-column>

        <template slot="empty">
          {{ $t('facility.no_instruments_found') }}
        </template>
      </b-table>
      <div v-if="noInstrumentsFound">
        {{ $t('facility.no_instruments_found') }}
      </div>
    </div>
  </div>
</template>

<script>
import { anchorLinks } from '@/modules/core/utils/helpers';
import FieldRow from '@/modules/core/components/ui/formElements/FieldRow';
import FieldGroupRepeatable from '@/modules/core/components/ui/formElements/FieldGroupRepeatable';
import fields from '../schemas/fields.json';

export default {
  components: {
    FieldRow,
    FieldGroupRepeatable
  },

  props: {
    facility: {
      type: [Object, Array]
    },

    editable: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    instruments() {
      return Object.values(this.facility.fieldValues.instruments);
    },

    noInstrumentsFound() {
      return (
        Object.keys(this.facility.fieldValues.instruments).length === 1 &&
        !Object.values(this.facility.fieldValues.instruments)[0].name.value
      );
    }
  },

  data() {
    return {
      fields: fields.instruments,
      defaultSortDirection: 'asc',
      sortIcon: 'arrow-up',
      sortIconSize: 'is-small'
    };
  },

  methods: {
    anchorLinks(value) {
      return anchorLinks(value);
    }
  }
};
</script>

<style lang="scss" scoped></style>
