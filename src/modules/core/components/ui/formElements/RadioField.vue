<template>
  <div v-if="editable" class="radio-wrapper">
    <div v-for="(item, index) in options" :key="index" class="radio-box">
      <b-radio :value="val" :native-value="item" @input="input" :disabled="!editable">{{
        checkIfBoolean(item)
      }}</b-radio>

      <a v-if="editable && external && external.length" :href="external[index]" target="blank" class="link"
        >more info</a
      >
    </div>
  </div>
  <div v-else>{{ checkIfBoolean(val) || '-' }}</div>
</template>

<script>
import { capitalize } from '@/modules/core/utils/helpers';
export default {
  props: {
    path: {
      type: Array
    },
    value: {
      type: [String, Object]
    },
    options: {
      type: Array
    },
    external: {
      type: [String, Array]
    },
    editable: {
      type: Boolean,
      default: true
    }
  },

  computed: {
    val() {
      if (this.radio && Object.keys(this.radio).includes('value')) {
        return this.radio.value;
      }

      return this.radio || typeof this.radio === 'boolean' ? this.radio : '';
    }
  },

  data() {
    return {
      radio: this.value
    };
  },

  methods: {
    input(event) {
      this.radio = event;
      this.$emit('input', { path: this.path, type: typeof event === 'boolean' ? 'boolean' : 'string', value: event });
    },

    checkIfBoolean(value) {
      if (typeof value === 'boolean') {
        return value ? 'Yes' : 'No';
      }
      return capitalize(value);
    }
  }
};
</script>

<style lang="scss" scoped>
::v-deep .b-radio.radio {
  margin: 0.5em;
}
::v-deep .radio[disabled] {
  color: $black;
  opacity: 1;
}
.radio-wrapper {
  display: flex;

  .radio-box {
    display: flex;
    flex-flow: row wrap;
    justify-content: space-between;
    .link {
      margin: 0.5em;
      margin-left: 2em;
      font-size: 14px;
    }
  }
}
</style>
