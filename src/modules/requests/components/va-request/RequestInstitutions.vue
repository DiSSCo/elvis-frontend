<template>
  <div v-if="formData">
    <h1>{{ $t('request.institutions_involved') }}</h1>
    <form id="institutions" @submit.prevent>
      <o-collapse v-for="(institution, index) in formData.institutions" animation="slide" class="card" :key="index"
        :open="isOpen == index" @open="openSelectedInstitution(index)">
        <template #trigger="props">
          <div class="card-header" :class="{ 'white-bg': formData.status !== 'draft' }" role="button">
            <span class="card-header-title">{{ index + 1 }}. {{ institution.name }}</span>

            <tag v-if="formData.status !== 'draft' && checkStatus(institution)"
              :text="$t(`status.${checkStatus(institution)}`)" :variant="$t(`status.class.${checkStatus(institution)}`)" :rounded="true"
            />

            <a class="card-header-icon">
              <o-icon :icon="props.open ? 'menu-up' : 'menu-down'"></o-icon>
            </a>
            <o-tooltip label="remove institution" variant="primary">
              <a v-if="institution.name && (formData.status === 'draft'
              || formData.status === 'submitted') && editable" class="card-header-icon close"
                @click.stop="removeInstitution(institution)">
                <o-icon icon="close"></o-icon>
              </a>
            </o-tooltip>
          </div>
        </template>

        <div class="card-content">
          <div class="content">
            <field-row field="SelectField" :class="{ hidden: institution.name }" label="Institution"
              :value="institution.name" :fieldOptions="{
                options: filteredInstitutions,
                field: 'name',
                placeHolder: 'Select an institution'
              }" />

            <div v-if="institution.name">
              <component v-for="field in fields" :is="field.type" :key="field.id"
                :value="institution.fieldValues[field.id]" :path="[field.id]"
                :context="{ resource: 'requests', institutionId: institution.id }" :label="field.label"
                :fields="field.fields" :editable="editable" v-bind="{ ...field.options }" />

              <div v-if="!editable || institution.status === 'approved'">
                <request-costs :requestId="formData.id" :institutionId="institution.id"
                  :myInstitution="isOwnInstitution(institution.id)" />
              </div>

              <request-approval v-if="isAllowed('request_approve') && formData.status !== 'draft'"
                :status="institution.status" :requestId="formData.id" :editable="isOwnInstitution(institution.id)" />
            </div>
          </div>
        </div>
      </o-collapse>
      <div v-if="showAddInstitution" class="new-institution">
        <o-button v-if="formData.status === 'draft' || formData.status === 'submitted'" class="primaryButton"
          v-scroll-to="{ element: '#institutions', duration: 500 }" type="is-secondary" @click="appendInstitution">
          <span> <i class="feather icon-plus" /> {{ $t('request.add_institution') }} </span>
        </o-button>
      </div>
    </form>
  </div>
</template>

<script>
import { sortArray } from '@/modules/core/utils/helpers';
import { isOwnInstitution, isAllowed } from '@/modules/core/utils/auth';
import { addInstitution, removeInstitution } from '@/services/requestsService';
import { fetchInstitutions } from '@/services/institutionsService';
import Tag from '@/modules/core/components/ui/Tag.vue';
import FieldRow from '@/modules/core/components/ui/formElements/FieldRow.vue';
import FieldGroupRepeatable from '@/modules/core/components/ui/formElements/FieldGroupRepeatable.vue';
import FieldGroup from '@/modules/core/components/ui/formElements/FieldGroup.vue';
import Dialog from '@/modules/core/components/ui/Dialog.vue';
import RequestCosts from './RequestCosts.vue';
import RequestApproval from '../RequestApproval.vue';
import data from '../../schemas/fields-va.json';

export default {
  components: {
    FieldGroupRepeatable,
    FieldGroup,
    FieldRow,
    RequestCosts,
    RequestApproval,
    Tag,
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

  computed: {
    showAddInstitution() {
      const arrLength = this.formData.institutions.length - 1;
      return this.formData.institutions[arrLength]
        && this.formData.institutions[arrLength].id && this.editable;
    },
  },

  data() {
    return {
      fields: data.institutions,
      institutions: [],
      filteredInstitutions: [],
      isOpen: 0,
      loading: false,
    };
  },

  watch: {
    formData: {
      handler() {
        this.updateInstitutionsList();
      },
      immediate: true,
    },
  },

  created() {
    this.emitter.on('selection', this.selectInstitution);
    this.emitter.on('fileUploaded', this.reloadAttachments);

    if (!this.formData.institutions.length) {
      this.appendInstitution();
    }
  },

  beforeUnmount() {
    this.emitter.off('selection');
    this.emitter.off('fileUploaded');
  },

  methods: {
    sortArray(arr) {
      return sortArray(arr);
    },

    isAllowed(permission) {
      return isAllowed(permission);
    },

    value(values, fieldId) {
      const found = values[fieldId];
      return found && found.value ? found.value.value : '';
    },

    appendInstitution() {
      const index = this.formData.institutions.length ? Number(Object.keys(this.formData.institutions).pop()) + 1 : 0;

      this.formData.institutions[index] = {};

      setTimeout(() => {
        this.isOpen = this.formData.institutions.length - 1;
      }, 500);
    },

    async selectInstitution(institutionOption) {
      const institution = this.institutions.find((i) => i.name === institutionOption.target.value);

      console.log(this.institutions);

      try {
        const response = await addInstitution(institution.id, this.formData.id);
        if (response.status === 200) {
          this.emitter.emit('reload', this.formData.id);
        }
      } catch (error) {
        console.log(error);
      }
    },

    removeInstitution(institution) {
      this.loading = true;

      this.$oruga.modal.open({
        component: Dialog,
        props: {
          confirmText: String(this.$t('remove')),
          cancelText: String(this.$t('cancel')),
          message: 'Are you sure you want to remove this institution from the form?',
        },
        trapFocus: true,
        events: {
          onConfirm: async () => {
            this.$oruga.modal.closeAll();

            try {
              const response = await removeInstitution(institution.id, this.formData.id);
              if (response.status === 200) {
                this.emitter.emit('reload', this.formData.id);
              }
            } catch (error) {
              console.log(error);
            }
          },
          onCancel: () => {
            this.$oruga.modal.closeAll();

            this.loading = false;
          },
        },
      });
    },

    async updateInstitutionsList() {
      try {
        const response = await fetchInstitutions();
        this.institutions = response.data.data.rows;
        this.filteredInstitutions = this.institutions
          .map((inst) => inst.name)
          .filter((item) => !this.formData.institutions.map((inst) => inst.name).includes(item))
          .sort();
      } catch (error) {
        console.log(error);
      }
    },

    openSelectedInstitution(index) {
      this.isOpen = index;
    },

    reloadAttachments() {
      this.componentKey += 1;
    },

    checkStatus(institution) {
      return this.isOwnInstitution(institution.id) && institution.status === 'submitted'
        ? 'toBeChecked'
        : institution.status;
    },

    isOwnInstitution(institutionId) {
      return isOwnInstitution(institutionId);
    },
  },
};
</script>

<style lang="scss" scoped>
h1 {
  border-top: 1px solid $grey-light;
  margin-top: 1em;
}

.new-institution {
  display: flex;
  justify-content: flex-end;
}

:deep(.is-blue) {
  color: $blue;
}

.card-content {
  padding: 0;
}

.card-header {
  background: $blue;
  border: none;
  color: $white;
  margin-bottom: 1em;

  .card-header-title {
    color: $white;
  }

  .card-header-icon {
    font-size: 24px;

    &.close {
      background: $grey-medium;
      color: $white;
    }
  }

  .tag {
    align-self: center;
  }

  &.white-bg {
    background: $white;
    border-top: 1px solid $grey;
    border-bottom: 1px solid $grey;
    box-shadow: none;

    .card-header-title,
    .card-header-icon {
      color: $black;

      &.close {
        background: $grey-medium;
        color: $white;
      }
    }
  }
}

.approval {
  display: flex;
  justify-content: flex-end;
  background: $grey-xlight;
  padding: 0.5em;
}
</style>

<style lang="css">
.primaryButton {
  background-color: #0c86c6;
  border-color: #0c86c6
}

.primaryButton:hover {
  background-color: #173d68;
  border-color: #173d68;
}
</style>
