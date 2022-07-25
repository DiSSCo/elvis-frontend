<template>
  <div class="field-row" :class="{ error: !isValid }">
    <div class="field-row-body">
      <div v-if="showLabel" class="label">
        <label>{{ label }} </label>
        <span v-if="isRequired && editable" class="required">*</span>
        <span v-if="fieldOptions && fieldOptions.tooltip" class="tooltip">
          <b-tooltip
            type="is-dark"
            multilined
            animated
            :size="fieldOptions.tooltip.length > 250 ? 'is-large' : 'is-medium'"
          >
            <b-icon custom-class="is-blue" size="is-small" icon="information" />
            <template v-slot:content><span v-html="fieldOptions.tooltip" /></template>
          </b-tooltip>
        </span>
      </div>

      <div class="form-field">
        <slot v-if="$slots.default" />
        <component
          v-else
          :is="field"
          :value="value"
          :loading="loading"
          :path="path"
          :label="label"
          :editable="fieldOptions.hasOwnProperty('editable') ? fieldOptions.editable : editable"
          v-bind="{ ...fieldOptions }"
          :tabindex="tabindex"
          @input="updateField($event)"
        />
        <spinner v-if="showSpinner" />
      </div>
    </div>
    <div class="error-message">
      <div v-if="showLabel" class="label" />
      <transition name="slide-down" mode="out-in">
        <div v-if="!isValid" class="error">{{ fieldOptions.errorMessage }}</div>
      </transition>
    </div>
  </div>
</template>

<script>
export default {
  components: {
    Spinner: () => import('../Spinner'),
    StringField: () => import('./StringField'),
    PasswordField: () => import('./PasswordField'),
    TextField: () => import('./TextField'),
    SelectField: () => import('./SelectField'),
    NumberField: () => import('./NumberField'),
    CheckboxField: () => import('./CheckboxField'),
    RadioField: () => import('./RadioField'),
    DateField: () => import('./DateField'),
    UploadField: () => import('./UploadField'),
    LinkField: () => import('./LinkField'),
    AttachmentsField: () => import('./AttachmentsField')
  },

  props: {
    path: [Array, String],
    context: {
      type: Object,
      default: null
    },
    value: [String, Number, Boolean, Object, Array],
    label: String,
    field: String,
    fieldOptions: {
      type: Object,
      default: () => ({})
    },
    showLabel: {
      type: Boolean,
      default: true
    },
    editable: {
      type: Boolean,
      default: true
    },
    tabindex: Number
  },

  data() {
    return {
      loading: false
    };
  },

  computed: {
    val() {
      return this.value;
    },

    showSpinner() {
      return this.loading && this.field !== 'CheckboxField' && this.field !== 'SelectField';
    },

    isRequired() {
      return this.fieldOptions.validation?.$params?.required;
    },

    isValid() {
      return !this.fieldOptions.validation?.$error;
    }
  },

  methods: {
    updateField(field) {
      this.loading = true;
      if (this.fieldOptions.validation) {
        this.fieldOptions.validation.$model = field.value;
        this.fieldOptions.validation.$touch();
      }

      const value = { type: field.type, value: field.value };

      if (this.isValid) {
        this.$emit('updateField', { context: this.context, fieldId: field.path, value });
        this.$root.$emit('updateField', { context: this.context, fieldId: field.path, value });
      }

      setTimeout(() => {
        this.loading = false;
      }, 500);
    }
  }
};
</script>

<style lang="scss" scoped>
.field-row {
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  margin-bottom: 0.8em;
  width: 100%;
  .form-block & {
    padding-right: 0.8em;
  }

  .label {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    flex: 1;
    margin-right: 2em;
    margin-bottom: 0;
    font-weight: 400;
    color: $black;
    position: relative;
    .field-rows & {
      label {
        margin: 0 1.5em;
      }
    }

    label {
      text-align: right;
      margin-bottom: 0;
    }

    .required {
      align-self: flex-start;
      color: $danger;
      margin-top: -10px;
      margin-left: 2px;
    }
  }
  .tooltip {
    position: absolute;
    right: -1.5em;
  }

  &.error {
    .form-field {
      input,
      .input,
      textarea,
      select,
      ::v-deep select,
      ::v-deep input {
        border: 1px solid $danger;
      }
    }
  }
  &.hidden {
    display: none;
  }
}
.field-row-body {
  display: flex;
  width: 100%;
  align-items: center;
  margin-bottom: 1em;

  button {
    flex: 1 1 0;
  }
  .form-field {
    position: relative;
    display: flex;
    flex: 3;
    flex-flow: row wrap;
    width: 100%;
    input {
      padding: 5px;
      font-size: 1rem;
      flex: 1 1 auto;
    }
  }
}

.error-message {
  display: none;
  font-size: 12px;
  color: $danger;
  width: 100%;
  line-height: 1;
  height: 1em;

  .error {
    flex: 3;
    padding: 0 0.5em;
  }
  .field-row.error & {
    margin-top: -1em;
    display: flex;
  }
}
::v-deep .is-blue {
  color: $blue;
}
</style>
