<template>
  <div>
    <h3 class="header">Supporting statement</h3>
    <p>
      The Supporting Statement will be used as a professional reference. Therefore, it should be provided by a senior
      peer who knows both you and your work first-hand. It must not be provided by a staff member from your chosen TAF.
      Ideally this should be from an international expert in your field who is not from your own institution nor is your
      User Group leader. It is acknowledged that for PhD students this will be difficult to attain and please email the
      SYNTHESYS team on synthesys@nhm.ac.uk, if you are encountering difficulties procuring a supporting statement that
      fits these rules.
    </p>
    <p>
      Supporting Statements are mandatory, but we recognise that due to various disruptions in 2020 and 2021, now is a
      difficult time to procure letters of reference. For now, all Transnational Access requests can be submitted
      without a Supporting Statement, but one must be added later before any funding is applied. Once the Call closes,
      the statement will be validated by the SYNTHESYS administrator to ensure that your Supporter reference is genuine.
      You must contact your Supporter prior to submission.
    </p>
    <form @submit.prevent>
      <component
        v-for="field in fields"
        :is="field.type"
        :key="field.id"
        :value="field.fields ? formData.fieldValues : formData.fieldValues[field.id]"
        :path="[field.id]"
        :fields="field.fields"
        :context="{ resource: 'requests' }"
        :label="field.label"
        :editable="editable"
        v-bind="{ ...field.options }"
      />
    </form>
  </div>
</template>

<script>
import FieldRow from '@/modules/core/components/ui/formElements/FieldRow';
import FieldGroup from '@/modules/core/components/ui/formElements/FieldGroup';
import data from '../../schemas/fields-ta.json';

export default {
  components: {
    FieldRow,
    FieldGroup
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
      fields: data.supportingStatement
    };
  }
};
</script>

<style lang="scss" scoped></style>
