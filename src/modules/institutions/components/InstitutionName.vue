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
      <div v-if="isInstitutionMod || isAdmin">
        <field-row
          field="StringField"
          label="CETAF identifier"
          :value="institution.cetaf"
          :path="['cetaf']"
          :context="{ resource: 'institutions', institutionId: institution.id }"
          :fieldOptions="{ editable: true, rows: 1, isHtml: true, maxlength: 500 }"
        />
      </div>
      <div v-else>
        <field-row
          field="TextField"
          label="CETAF identifier"
          :value="institution.cetaf"
          :fieldOptions="{ editable: false, rows: 1, isHtml: true, maxlength: 500 }"
        />
      </div>
    </form>
  </div>
</template>

<script>
import FieldRow from '@/modules/core/components/ui/formElements/FieldRow';
import fields from '../schemas/fields.json';
import { isInstitutionMod, isAdmin } from '@/modules/core/utils/auth';

export default {
  components: {
    FieldRow
  },
  computed: {
    isInstitutionMod() {
      return isInstitutionMod();
    },
    isAdmin() {
      return isAdmin();
    }
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
      fields: fields.name
    };
  }
};
</script>

<style lang="scss" scoped></style>
