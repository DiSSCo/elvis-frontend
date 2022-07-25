<template>
  <div class="section">
    <div class="container">
      <h1>Stats Requests</h1>
      <div v-if="chartData">
        <div class="action-btns">
          <b-radio :value="requestYear" name="year" :native-value="currentYear" @input="setYear(currentYear)">{{
            currentYear
          }}</b-radio>
          <b-radio :value="requestYear" name="year" :native-value="currentYear - 1" @input="setYear(currentYear - 1)">{{
            currentYear - 1
          }}</b-radio>
        </div>
        <div class="action-btns">
          <b-radio
            :value="requestType"
            name="requestType"
            native-value="Virtual Access"
            @input="setType('Virtual Access')"
            >Virtual Access</b-radio
          >
          <b-radio
            :value="requestType"
            name="requestType"
            native-value="Transnational Access"
            @input="setType('Transnational Access')"
            >Transnational Access</b-radio
          >
        </div>
        <bar-chart :data="chartData" :options="options" :height="600" />
      </div>
    </div>
  </div>
</template>

<script>
import BarChart from '@/modules/core/components/ui/BarChart';
import { fetchFilteredRequests } from '@/services/requestsService';
import { sortArray, makeStringFromDateArray } from '@/modules/core/utils/helpers';
export default {
  components: {
    BarChart
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
                stepSize: 1
              }
            }
          ]
        }
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
        'December'
      ],
      statusses: {
        draft: '#b4b4bf',
        being_handled: '#f7a112',
        approved: '#3dca77',
        submitted: '#10c1ff',
        withdrawn: '#f4f4f1',
        scoring: '#205692'
      },
      currentYear: new Date().getFullYear(),
      requestYear: new Date().getFullYear(),
      requestType: 'Virtual Access',
      sortedData: null
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
        const withDate = response.data.data.rows.map(row => {
          row.dateString = makeStringFromDateArray(row.requestDate);
          row.month = this.monthNames[new Date(row.dateString).getMonth()];
          return row;
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
      const data = this.monthNames.map(name => {
        return {
          month: name,
          statusses: []
        };
      });

      this.chartData = {
        labels: [],
        datasets: []
      };
      this.chartData.labels = this.monthNames;

      this.sortedData
        .filter(request => request.requestDate[0] === this.requestYear && request.requestType === this.requestType)
        .map(request => {
          return data.map(item => {
            if (item.month === request.month) {
              return item.statusses.push(request.status);
            }
          });
        });

      const reduced = data.map(d => {
        return d.statusses.reduce((obj, item) => {
          obj[item] = (obj[item] || 0) + 1;
          return obj;
        }, {});
      });

      Object.keys(this.statusses).map(status => {
        const filteredData = reduced.map(month => month[status] || 0);
        this.chartData.datasets.push({
          label: status === 'scoring' ? 'Scored' : this.$t(`status.${status}`),
          backgroundColor: this.statusses[status],
          borderWidth: 1,
          data: filteredData
        });
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.action-btns {
  margin-bottom: 1em;
}
</style>
