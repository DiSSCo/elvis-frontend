<template>
  <div v-if="formData">
    <h1>{{ $t('request.institutions_involved') }}</h1>
    <form id="institutions" @submit.prevent>
      <b-collapse
        v-for="(institution, index) in formData.institutions"
        :key="index"
        :open="isOpen === index"
        @open="openSelectedInstitution(index)"
      >
        <div
          slot="trigger"
          slot-scope="props"
          class="card-header"
          :class="{ 'white-bg': formData.status !== 'draft' }"
          role="button"
        >
          <span class="card-header-title">{{ index + 1 }}. {{ institution.name }}</span>

          <b-tag
            v-if="formData.status !== 'draft' && checkStatus(institution)"
            class="tag"
            rounded
            :class="$t(`status.class.${checkStatus(institution)}`)"
            >{{ $t(`status.${checkStatus(institution)}`) }}</b-tag
          >

          <a class="card-header-icon">
            <b-icon :icon="props.open ? 'menu-up' : 'menu-down'"></b-icon>
          </a>
          <b-tooltip label="remove institution" type="is-dark">
            <a
              v-if="institution.name && (formData.status === 'draft' || formData.status === 'submitted') && editable"
              class="card-header-icon close"
              @click.stop="removeInstitution(institution)"
            >
              <b-icon icon="close"></b-icon>
            </a>
          </b-tooltip>
        </div>

        <div class="card-content">
          <div class="content">
            <field-row
              field="SelectField"
              :class="{ hidden: institution.name }"
              label="Institution"
              :value="institution.name"
              :fieldOptions="{
                options: filteredInstitutions,
                field: 'name',
                placeHolder: 'Select an institution'
              }"
            />

            <div v-if="institution.name">
              <component
                v-for="field in fields"
                :is="field.type"
                :key="field.id"
                :value="institution.fieldValues[field.id]"
                :path="[field.id]"
                :context="{ resource: 'requests', institutionId: institution.id }"
                :label="field.label"
                :fields="field.fields"
                :editable="editable"
                v-bind="{ ...field.options }"
              />

              <div v-if="!editable || institution.status === 'approved'">
                <request-costs
                  :requestId="formData.id"
                  :institutionId="institution.id"
                  :myInstitution="isOwnInstitution(institution.id)"
                />
              </div>

              <request-approval
                v-if="isAllowed('request_approve') && formData.status !== 'draft'"
                :status="institution.status"
                :requestId="formData.id"
                :editable="isOwnInstitution(institution.id)"
              />
            </div>
          </div>
        </div>
      </b-collapse>
      <div v-if="showAddInstitution" class="new-institution">
        <b-button
          v-if="formData.status === 'draft' || formData.status === 'submitted'"
          v-scroll-to="{ element: '#institutions', duration: 500 }"
          type="is-secondary"
          @click="appendInstitution"
        >
          <span> <i class="feather icon-plus" /> {{ $t('request.add_institution') }} </span>
        </b-button>
      </div>
    </form>
  </div>
</template>

<script>
import { sortArray } from '@/modules/core/utils/helpers';
import { isOwnInstitution, isAllowed } from '@/modules/core/utils/auth';
import { addInstitution, removeInstitution } from '@/services/requestsService';
import { fetchInstitutions } from '@/services/institutionsService';
import FieldRow from '@/modules/core/components/ui/formElements/FieldRow';
import FieldGroupRepeatable from '@/modules/core/components/ui/formElements/FieldGroupRepeatable';
import FieldGroup from '@/modules/core/components/ui/formElements/FieldGroup';
import RequestCosts from './RequestCosts';
import RequestApproval from '../RequestApproval';
import data from '../../schemas/fields-va.json';

export default {
  components: {
    FieldGroupRepeatable,
    FieldGroup,
    FieldRow,
    RequestCosts,
    RequestApproval
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

  computed: {
    showAddInstitution() {
      const arrLength = this.formData.institutions.length - 1;
      return this.formData.institutions[arrLength] && this.formData.institutions[arrLength].id && this.editable;
    }
  },

  data() {
    return {
      fields: data.institutions,
      institutions: [],
      filteredInstitutions: [],
      isOpen: 0,
      loading: false
    };
  },

  watch: {
    formData: {
      handler() {
        this.updateInstitutionsList();
      },
      immediate: true
    }
  },

  created() {
    this.$root.$on('selection', this.selectInstitution);
    this.$root.$on('fileUploaded', this.reloadAttachments);

    if (!this.formData.institutions.length) {
      this.appendInstitution();
    }
  },

  beforeDestroy() {
    this.$root.$off('selection');
    this.$root.$off('fileUploaded');
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
      this.$set(this.formData.institutions, index, {});
      setTimeout(() => {
        this.isOpen = this.formData.institutions.length - 1;
      }, 500);
    },

    async selectInstitution(institutionName) {
      const institution = this.institutions.find(i => i.name === institutionName);
      try {
        const response = await addInstitution(institution.id, this.formData.id);
        if (response.status === 200) {
          this.$root.$emit('reload', this.formData.id);
        }
      } catch (error) {
        console.log(error);
      }
    },

    removeInstitution(institution) {
      this.loading = true;
      this.$buefy.dialog.confirm({
        confirmText: String(this.$t('remove')),
        cancelText: String(this.$t('cancel')),
        message: 'Are you sure you want to remove this institution from the form?',
        type: 'is-danger',
        onConfirm: async () => {
          try {
            const response = await removeInstitution(institution.id, this.formData.id);
            if (response.status === 200) {
              this.$root.$emit('reload', this.formData.id);
            }
          } catch (error) {
            console.log(error);
          }
        },
        onCancel: () => {
          this.loading = false;
        }
      });
    },

    async updateInstitutionsList() {
      try {
        const response = await fetchInstitutions();
        this.institutions = response.data.data.rows;
        this.filteredInstitutions = this.institutions
          .map(inst => inst.name)
          .filter(item => !this.formData.institutions.map(inst => inst.name).includes(item))
          .sort();
      } catch (error) {
        console.log(error);
      }
    },

    openSelectedInstitution(index) {
      this.isOpen = index;
    },

    reloadAttachments() {
      this.componentKey++;
    },

    checkStatus(institution) {
      return this.isOwnInstitution(institution.id) && institution.status === 'submitted'
        ? 'toBeChecked'
        : institution.status;
    },

    isOwnInstitution(institutionId) {
      return isOwnInstitution(institutionId);
    }
  }
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

::v-deep .is-blue {
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
