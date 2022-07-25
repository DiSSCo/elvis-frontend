<script>
import { Bar } from 'vue-chartjs';

export default {
  extends: Bar,
  props: ['data', 'options'],
  watch: {
    data: {
      handler() {
        this.$data._chart.update();
        this.renderChart(this.data, this.options);
      }
    }
  },
  mounted() {
    this.renderChart(this.data, this.options);
  }
};
</script>
