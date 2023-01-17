<template>
  <div>
    <div class="sub-heading">
      <strong>{{ $t('request.costs') }}</strong>
    </div>

    <field-row v-if="isAllowed('request_attachment_download') && myInstitution"
      :label="$t('request.download_costs')"
    >
      <a
        href="https://www.synthesys.info/content/dam/nhm-synthesys/Virtual%20Access%20Proposal%20-%20Cost%20Template.xlsx"
        >{{ $t('request.download_costs_template') }}</a
      >
    </field-row>

    <field-row
      v-if="isAllowed('request_attachment_add') && myInstitution"
      field="UploadField"
      :label="$t('request.upload_costs')"
      :fieldOptions="{
        url: `/call-requests/${requestId}/attachments/${institutionId}`,
        tooltip: $t('tooltip.file_upload')
      }"
    />

    <field-row
      field="AttachmentsField"
      label="Attachments"
      :fieldOptions="{
        fetchUrl: `/call-requests/${requestId}/attachments/${institutionId}`,
        baseUrl: `/call-requests/${requestId}/attachments`,
        closable: myInstitution,
        reload: componentKey
      }"
    />
  </div>
</template>

<script>
import { isAllowed } from '@/modules/core/utils/auth';
import FieldRow from '@/modules/core/components/ui/formElements/FieldRow.vue';

export default {
  components: {
    FieldRow,
  },
  props: {
    institutionId: {
      type: String,
    },
    requestId: {
      type: String,
    },
    myInstitution: {
      type: Boolean,
    },
  },

  data() {
    return {
      componentKey: 0,
    };
  },

  created() {
    this.emitter.on('fileUploaded', this.reloadAttachments);
  },

  beforeUnmount() {
    this.emitter.off('fileUploaded');
  },

  methods: {
    isAllowed(permission) {
      return isAllowed(permission);
    },

    reloadAttachments() {
      this.componentKey += 1;
    },
  },
};
</script>

<style lang="scss" scoped>
.sub-heading {
  background-color: $grey-light;
  padding: 0.5em 0.75em;
  margin-bottom: 1em;
}
</style>
