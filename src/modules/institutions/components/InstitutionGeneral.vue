<template>
  <div v-if="institution">
    <form @submit.prevent>
      <component
        v-for="field in fields"
        :is="field.type"
        :key="field.id"
        :value="institution.fieldValues[field.id]"
        :path="[field.id]"
        :context="{ resource: 'institutions', institutionId: institution.id }"
        :label="field.label"
        :editable="editable"
        v-bind="{ ...field.options }"
      />
    </form>
  </div>
</template>

<script>
import { required } from 'vuelidate/lib/validators';
import FieldRow from '@/modules/core/components/ui/formElements/FieldRow';
import fields from '../schemas/fields.json';
import countries from '@/modules/core/schemas/country-list.json';

export default {
  components: {
    FieldRow
  },

  props: {
    institution: {
      type: [Object, Array]
    },
    institutionId: {
      type: String
    },
    editable: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      fields: fields.general
    };
  },

  validations: {
    institution: {
      fieldValues: {
        country: {
          required
        }
      }
    }
  },

  created() {
    this.setAutocompleteData();
    this.setValidation();
  },

  methods: {
    setAutocompleteData() {
      const found = this.fields.find(field => field.id === 'country');
      found.options.fieldOptions.autoCompleteData = countries.map(country => country.name).sort();
    },

    setValidation() {
      this.fields = this.fields.map(field => {
        if (field.options.fieldOptions?.errorMessage) {
          this.$set(field.options.fieldOptions, 'validation', this.$v.institution.fieldValues[field.id]);
        }
        return field;
      });
    }
  }
};
</script>

<style lang="scss" scoped></style>
