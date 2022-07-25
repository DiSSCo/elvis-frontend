<template>
  <div>
    <form @submit.prevent>
      <component
        v-for="field in fields"
        :is="field.type"
        :key="field.id"
        :value="formData.fieldValues[field.id]"
        :path="[field.id]"
        :context="{ resource: 'requests' }"
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
import data from '../../schemas/fields-va.json';

export default {
  components: {
    FieldRow
  },

  props: {
    formData: {
      type: Object
    },
    editable: {
      type: Boolean,
      default: true
    }
  },

  data() {
    return {
      fields: data.general
    };
  },

  validations: {
    formData: {
      fieldValues: {
        subject: {
          required
        }
      }
    }
  },

  created() {
    this.setValidation();
  },

  methods: {
    setValidation() {
      this.fields = this.fields.map(field => {
        if (field.options.fieldOptions?.errorMessage) {
          this.$set(field.options.fieldOptions, 'validation', this.$v.formData.fieldValues[field.id]);
        }
        return field;
      });
    }
  }
};
</script>

<style lang="scss" scoped></style>
