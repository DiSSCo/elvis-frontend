<template>
  <b-select :value="perPage" @input="$emit('input', $event)">
    <option v-for="step in steps" :key="step" :value="step">{{ step }} {{ $t('per_page') }}</option>
  </b-select>
</template>

<script>
export default {
  props: {
    total: Number,
    perPage: {
      type: Number,
      default: 10
    }
  },

  computed: {
    steps() {
      const steps = [];
      const max = this.total > 100 ? 100 : this.total;
      if (max > 60) {
        steps.push(25, 50);
      } else if (max > 40) {
        steps.push(25);
      }
      return [10, ...steps, max];
    }
  }
};
</script>
