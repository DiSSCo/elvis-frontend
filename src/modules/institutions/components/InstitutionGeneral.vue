<template>
  <div v-if="institution">
    <form @submit.prevent>
      <component v-for="field in fields" :is="field.type" :key="field.id" :value="institution.fieldValues[field.id]"
        :path="[field.id]" :context="{ resource: 'institutions', institutionId: institution.id }" :label="field.label"
        :editable="editable" v-bind="{ ...field.options, validation: v$.institution.fieldValues[field.id] }"
        />
    </form>
  </div>
</template>

<script>
import useVuelidate from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import FieldRow from '@/modules/core/components/ui/formElements/FieldRow.vue';
import countries from '@/modules/core/schemas/country-list.json';
import fields from '../schemas/fields.json';

export default {
  components: {
    FieldRow,
  },

  props: {
    institution: {
      type: [Object, Array],
    },
    institutionId: {
      type: String,
    },
    editable: {
      type: Boolean,
      default: false,
    },
  },

  setup() {
    const v$ = useVuelidate();

    return { v$: v$ };
  },

  data() {
    return {
      fields: fields.general,
    };
  },

  validations: {
    institution: {
      fieldValues: {
        country: {
          required,
        },
      },
    },
  },

  created() {
    this.setAutocompleteData();
  },

  methods: {
    setAutocompleteData() {
      const found = this.fields.find((field) => field.id === 'country');
      found.options.fieldOptions.autoCompleteData = countries.map((country) => country.name).sort();
    },
  },
};
</script>

<style lang="scss" scoped>

</style>
