<template>
  <Bar :data="data" />
</template>

<script>
import { Bar } from 'vue-chartjs';

export default {
  props: ['data', 'options'],

  components: {
    Bar,
  },

  watch: {
    data: {
      handler() {
        this.$data._chart.update();
        // this.renderChart(this.data, this.options);
      },
    },
  },
};
</script>
