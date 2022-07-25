<template>
  <div class="field-group-wrapper">
    <header v-if="label">{{ label }}</header>
    <div v-for="(item, key, index) in value" :key="key" class="field-group" :class="{ 'no-label': !label }">
      <component
        v-for="field in fields"
        :is="field.type"
        :key="field.id"
        :value="field.id ? value[key][field.id] : value[key]"
        :context="context"
        :path="[...path, key, field.id]"
        :label="field.label"
        :fields="field.fields"
        :editable="editable"
        v-bind="{ ...field.options }"
      />
      <div class="btn-actions">
        <b-tooltip label="add new group" type="is-dark">
          <b-button
            v-if="Object.keys(value).length - 1 === index && editable"
            type="is-secondary"
            @click="addGroup"
            rounded
          >
            <span class="btn-icon">
              <i class="feather icon-plus" />
            </span>
          </b-button>
        </b-tooltip>

        <b-tooltip label="remove group" type="is-dark">
          <b-button v-if="Object.keys(value).length > 1 && editable" class="remove" @click="deleteGroup(key)" rounded>
            <span class="btn-icon">
              <i class="feather icon-minus" />
            </span>
          </b-button>
        </b-tooltip>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  components: {
    FieldRow: () => import('@/modules/core/components/ui/formElements/FieldRow'),
    FieldGroup: () => import('@/modules/core/components/ui/formElements/FieldGroup')
  },

  props: {
    path: {
      type: Array
    },
    context: {
      type: Object,
      default: null
    },
    value: {
      type: Object
    },
    label: {
      type: String
    },
    fields: {
      type: Array
    },
    editable: {
      type: Boolean,
      default: true
    }
  },

  computed: {
    getFields() {
      return this.fields && this.fields.fields ? this.fields.fields : this.fields;
    }
  },

  methods: {
    addGroup() {
      this.$set(this.value, Number(Object.keys(this.value).pop()) + 1, {});
    },

    deleteGroup(key) {
      this.$root.$emit('removeGroup', {
        context: this.context,
        path: this.path,
        key
      });
      this.$delete(this.value, key);
    }
  }
};
</script>
<style lang="scss" scoped>
.field-group-wrapper {
  margin-bottom: 2em;
}
.field-group {
  border: 1px solid $grey;
  border-top: none;
  padding-top: 2em;
  &:first-child {
    padding-top: 0;
  }
  &.no-label {
    &:first-child {
      border-top: 1px solid $grey;
      padding-top: 1em;
    }
    .field-row {
      margin-bottom: 0;
    }
  }
}
.field-row {
  padding-right: 30px;
}
header {
  background: $yellow;
  color: $black;
  padding: 0.5em;
  font-weight: 600;
}
.btn-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: -1em;

  button {
    padding: 5px;
    margin: 0.5em;

    .btn-icon {
      display: flex;
      align-items: center;
    }
    i {
      font-size: 24px;
    }
    &.remove {
      background: $grey-medium;
      color: $white;
      border-color: $grey-medium;
      margin-left: 0;
    }
  }
}
</style>
