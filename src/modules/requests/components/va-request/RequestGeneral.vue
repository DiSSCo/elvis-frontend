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
        v-bind="{ ...field.options, validation: v$.formData.fieldValues[field.id] }"
      />
    </form>
  </div>
</template>

<script>
import useVuelidate from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import FieldRow from '@/modules/core/components/ui/formElements/FieldRow.vue';
import data from '../../schemas/fields-va.json';

export default {
  components: {
    FieldRow,
  },

  props: {
    formData: {
      type: Object,
    },
    editable: {
      type: Boolean,
      default: true,
    },
  },

  setup() {
    const v$ = useVuelidate();

    return { v$: v$ };
  },

  data() {
    return {
      fields: data.general,
    };
  },

  validations: {
    formData: {
      fieldValues: {
        subject: {
          required,
        },
      },
    },
  },
};
</script>

<style lang="scss" scoped></style>
