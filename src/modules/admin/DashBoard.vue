<template>
  <div class="section">
    <div class="container">
      <h1>Stats Requests</h1>
      <div v-if="chartData">
        <div class="action-btns">
          <o-radio v-model="requestYear" name="year" :native-value="currentYear" @input="setYear(currentYear)">{{
            currentYear
          }}</o-radio>
          <o-radio v-model="requestYear" name="year" :native-value="currentYear - 1" @input="setYear(currentYear - 1)">{{
            currentYear - 1
          }}</o-radio>
        </div>
        <div class="action-btns">
          <o-radio v-model="requestType" name="requestType" native-value="Virtual Access"
            @input="setType('Virtual Access')">Virtual Access</o-radio>
          <o-radio v-model="requestType" name="requestType" native-value="Transnational Access"
            @input="setType('Transnational Access')">Transnational Access</o-radio>
        </div>
        <bar-chart :data="chartData" :options="options" :height="600" />
      </div>
    </div>
  </div>
</template>

<script>
import BarChart from '@/modules/core/components/ui/BarChart.vue';
import {
  Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale,
} from 'chart.js';
import { fetchFilteredRequests } from '@/services/requestsService';
import { sortArray, makeStringFromDateArray } from '@/modules/core/utils/helpers';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

export default {
  components: {
    BarChart,
  },

  data() {
    return {
      chartData: null,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          yAxes: [
            {
              ticks: {
                beginAtZero: true,
                stepSize: 1,
              },
            },
          ],
        },
        // animation: {
        //   duration: 0
        // },
        // hover: {
        //   animationDuration: 0
        // },
        // responsiveAnimationDuration: 0
      },
      monthNames: [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
      ],
      statusses: {
        draft: '#b4b4bf',
        being_handled: '#f7a112',
        approved: '#3dca77',
        submitted: '#10c1ff',
        withdrawn: '#f4f4f1',
        scoring: '#205692',
      },
      currentYear: new Date().getFullYear(),
      requestYear: new Date().getFullYear(),
      requestType: 'Virtual Access',
      sortedData: null,
    };
  },

  created() {
    this.fetchRequests();
  },

  methods: {
    async fetchRequests() {
      const criteria = [{ field: 'deleted_at', type: 'eq', value: null }];
      const queries = [{ type: 'and', criteria }];

      try {
        const response = await fetchFilteredRequests(queries);
        const withDate = response.data.data.rows.map((row) => {
          const copyRow = { ...row };

          copyRow.dateString = makeStringFromDateArray(row.requestDate);
          copyRow.month = this.monthNames[new Date(row.dateString).getMonth()];

          return copyRow;
        });
        this.sortedData = sortArray(withDate, 'dateString');
        this.setGraphData();
      } catch (error) {
        console.log(error);
      }
    },

    setYear(year) {
      this.requestYear = year;
      this.setGraphData();
    },

    setType(type) {
      this.requestType = type;
      this.setGraphData();
    },

    setGraphData() {
      const data = this.monthNames.map((name) => ({
        month: name,
        statusses: [],
      }));

      this.chartData = {
        labels: [],
        datasets: [],
      };
      this.chartData.labels = this.monthNames;

      this.sortedData
        .filter((request) => request.requestDate[0] === this.requestYear
          && request.requestType === this.requestType)
        .map((request) => data.forEach((item) => {
          if (item.month === request.month) {
            return item.statusses.push(request.status);
          }

          return null;
        }));

      const reduced = data.map((d) => d.statusses.reduce((obj, item) => {
        const copyObj = { ...obj };

        copyObj[item] = (obj[item] || 0) + 1;

        return copyObj;
      }, {}));

      Object.keys(this.statusses).forEach((status) => {
        const filteredData = reduced.map((month) => month[status] || 0);
        this.chartData.datasets.push({
          label: status === 'scoring' ? 'Scored' : this.$t(`status.${status}`),
          backgroundColor: this.statusses[status],
          borderWidth: 1,
          data: filteredData,
        });
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.action-btns {
  margin-bottom: 1em;
}
</style>
