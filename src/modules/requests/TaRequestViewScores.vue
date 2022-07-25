<template>
  <div id="details" class="section">
    <div class="container">
      <router-link :to="{ name: 'request-details-ta', params: { id: requestId } }">
        <i class="feather icon-arrow-left" /> {{ $t('request.back_to_request') }}
      </router-link>
      <h1 class="title-link">View Scores</h1>
      <table v-if="totalScoring" class="scoring-results">
        <tr class="table-head">
          <td>{{ $t(`scores.${totalScoring.scorer.label}`) }} <span class="weight-label">weight:</span></td>
          <td v-for="(col, index) in totalScoring.scoring" :key="index" class="score">
            <div class="score-label">
              <div>{{ $t(`scores.${col.label}`) }}</div>
              <div class="weight">{{ col.weight }}x</div>
            </div>
          </td>
          <td class="total-score">{{ $t(`scores.${totalScoring.total.label}`) }}</td>
        </tr>
        <tr>
          <td>
            <div>
              {{ totalScoring.scorer.title }}
            </div>
            <div class="is-size-7">Requester: {{ totalScoring.scorer.requester }}</div>
          </td>
          <td v-for="(col, index) in totalScoring.scoring" :key="index" class="score">
            {{ col.value }}
          </td>
          <td class="score total">
            {{ totalScoring.total.value }}
          </td>
        </tr>
      </table>

      <div class="all-scores">
        <h3>Score Summary</h3>

        <table v-if="allScores.length && allScores[0].scorer" class="scoring-results">
          <tr class="table-head">
            <td>{{ $t(`scores.${allScores[0].scorer.label}`) }}</td>
            <td v-for="(col, index) in allScores[0].scoring" :key="index" class="score">
              {{ $t(`scores.${col.label}`) }}
            </td>
            <td>{{ $t(`scores.${allScores[0].total.label}`) }}</td>
          </tr>
          <tr v-for="(row, index) in allScores" :key="index" :class="{ striped: index % 2 !== 0 }">
            <td>
              <div>
                <strong>{{ row.scorer.value.name }}</strong>
              </div>
              <div v-if="row.scorer.value.comments" class="is-size-7">
                <strong>Comment:</strong> {{ row.scorer.value.comments }}
              </div>
            </td>
            <td v-for="(col, index) in row.scoring" :key="index" class="score">
              {{ col.value }}
            </td>
            <td class="score">
              <strong>{{ row.total.value }}</strong>
            </td>
          </tr>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import { fetchRequestData, viewScore } from '@/services/requestsService';
import { fetchUserById } from '@/services/usersService';
import { fetchCallData } from '@/services/callsService';
import { sortArray } from '@/modules/core/utils/helpers';

export default {
  computed: {
    allScores() {
      return this.scores;
    },

    totalScoring() {
      return this.calcTotal(this.allScores);
    }
  },

  data() {
    return {
      request: null,
      requestId: null,
      call: null,
      scores: [],
      totalScores: [],
      loading: false,
      scoringOrder: [
        'methodology',
        'research_excellence',
        'support_statement',
        'justification',
        'gains_outputs',
        'merit',
        'societal_challenge'
      ]
    };
  },

  async created() {
    this.requestId = this.$route.params.id;
    await this.fetchAllScores();
  },

  methods: {
    async fetchAllScores() {
      this.request = await fetchRequestData(this.requestId);
      const response = await fetchCallData(this.request.callId);
      [this.call] = response.data.data.rows;
      const scoreFormIds = this.request.scoreFormId || [];

      scoreFormIds.map(async form => {
        const score = await viewScore(this.requestId, form.id);
        const total = { label: 'total', value: 0 };
        const row = Object.keys(score.data.form.values)
          .filter(f => f !== 'comments')
          .map(fieldId => {
            total.value += Number(score.data.form.values[fieldId].value.value);
            return {
              index: this.scoringOrder.indexOf(fieldId),
              label: fieldId,
              value: Number(score.data.form.values[fieldId].value.value)
            };
          });

        const scorerName = await this.getScorerName(score.data.scorerId);
        const scorer = {
          label: 'reviewer',
          value: { name: scorerName, comments: score.data.form.values.comments.value.value }
        };
        const scoring = sortArray(row, 'index', 'asc');
        this.scores.push({ scorer, scoring, total });
      });
    },

    async getScorerName(id) {
      const response = await fetchUserById(id);
      const [user] = response.data.data.rows;
      return `${user.firstName} ${user.lastName}`;
    },

    calcTotal(scores) {
      if (scores.length) {
        const clone = [...scores];
        const scorer = {};
        const scoring = [...clone[0].scoring];
        const total = {};
        let averageTotal = 0;

        scorer.label = 'request_title';
        scorer.title = this.request.fieldValues.subject?.value || '';
        scorer.requester = `${this.request.creatorData.firstName} ${this.request.creatorData.lastName}`;
        const totalScores = clone.map(score => score.scoring.map(s => s.value));
        const average = this.calcAverage(...totalScores);
        const averageScoring = scoring.map((s, i) => {
          const weight = this.call.scoring.weight[this.toCamelCase(s.label)];
          averageTotal += average[i] * weight;
          return {
            label: s.label,
            value: average[i],
            weight
          };
        });
        total.label = 'average_weighted_total';
        total.value = Number(averageTotal.toFixed(2));

        return { scorer, scoring: averageScoring, total };
      }
    },

    calcAverage(...arrays) {
      const n = arrays.reduce((max, xs) => Math.max(max, xs.length), 0);
      const result = Array.from({ length: n });
      return result.map((_, i) => {
        const av = arrays.map(xs => xs[i] || 0).reduce((sum, x) => sum + x, 0) / arrays.length;
        return Number(av.toFixed(2));
      });
    },

    toCamelCase(str) {
      const parts = str.split('_');
      return parts.map((part, index) => (index ? part.charAt(0).toUpperCase() + part.slice(1) : part)).join('');
    }
  }
};
</script>

<style lang="scss" scoped>
.all-scores {
  margin-top: 2em;
  h3 {
    padding: 10px;
  }
  .striped {
    td {
      background: $grey-xlight;
    }
  }
}
.scoring-results {
  .table-head td {
    vertical-align: top;
    position: relative;
    .weight-label {
      position: absolute;
      bottom: 10px;
      right: 0;
      font-size: 9px;
      font-weight: bold;
      color: $primary;
    }
  }

  td {
    width: 100%;
    padding: 10px;
    vertical-align: middle;
    border-bottom: 1px solid $grey;
    .all-scores & {
      vertical-align: top;
    }
  }

  .score {
    text-align: center;
    position: relative;
    height: 0;

    &.total {
      background: $primary;
      color: $white;
      font-weight: bold;
    }
    .weight {
      font-size: 9px;
      color: $primary;
      text-align: center;
      font-weight: bold;
      margin-top: 10px;
    }
    .score-label {
      display: flex;
      flex-flow: column;
      align-items: center;
      justify-content: space-between;
      min-height: 100%;
    }
  }

  .total-score {
    min-width: 100px;
    text-align: center;
  }
}
.slider {
  height: 200px;
}
.merge-tooltip {
  position: absolute;
  left: 50%;
  bottom: 20px;
  transform: translate(-50%, 0);
  &.bottom {
    bottom: -40px;
  }
}
::v-deep .vue-slider-dot-tooltip-inner {
  background: $white;
  color: $black;
  font-size: 10px;
}
::v-deep .vue-slider-dot-handle-disabled {
  background: $white;
}
</style>
