<template>
  <tag-input
    v-if="editable"
    :value="val"
    v-bind="$attrs"
    :autoCompleteData="autoCompleteData"
    @tag-select="showLinkedRecord"
    @update-tags="updateField"
  />
  <div v-else>{{ val.length ? val.join(', ') : '-' }}</div>
</template>

<script>
import TagInput from '../TagInput';

export default {
  components: {
    TagInput
  },

  props: {
    path: Array,
    value: [Object, Array, String],
    autoCompleteData: Array,
    editable: {
      type: Boolean,
      default: true
    }
  },

  computed: {
    val() {
      return this.value?.value || this.value || [];
    }
  },

  methods: {
    updateField(tags) {
      this.$emit('input', { path: this.path, type: 'list', value: tags });
    },

    showLinkedRecord(event) {
      console.log(event);
    }
  }
};
</script>

<style lang="scss" scoped></style>
