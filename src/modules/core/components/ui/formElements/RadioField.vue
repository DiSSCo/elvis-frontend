<template>
  <div v-if="editable" class="radio-wrapper">
    <div v-for="(item, index) in options" :key="index" class="radio-box">
      <o-radio v-model="radio" :native-value="item" class="radioButton" :disabled="!editable"
        :events="{'input': input}">{{
          checkIfBoolean(item)
        }}</o-radio>

      <a v-if="editable && external && external.length" :href="external[index]" target="blank" class="link">
        more info
      </a>
    </div>
  </div>
  <div v-else>{{ checkIfBoolean(radio) || '-' }}</div>
</template>

<script>
import { capitalize } from '@/modules/core/utils/helpers';

export default {
  props: {
    path: {
      type: Array,
    },
    value: {
      type: [String, Object],
    },
    options: {
      type: Array,
    },
    external: {
      type: [String, Array],
    },
    editable: {
      type: Boolean,
      default: true,
    },
  },

  data() {
    return {
      radio: this.value,
    };
  },

  watch: {
    radio: {
      async handler(value) {
        this.input(value);
      },
    },
  },

  created() {
    this.val();
  },

  methods: {
    val() {
      if (this.radio && Object.keys(this.radio).includes('value')) {
        this.radio = this.radio.value;
      }

      this.radio = this.radio || typeof this.radio === 'boolean' ? this.radio : '';
    },

    input(v) {
      this.radio = v;

      this.$emit('updateInput', { path: this.path, type: typeof v === 'boolean' ? 'boolean' : 'string', value: v });
    },

    checkIfBoolean(value) {
      if (typeof value === 'boolean') {
        return value ? 'Yes' : 'No';
      }
      return capitalize(value);
    },
  },
};
</script>

<style lang="scss" scoped>
:deep(.b-radio.radio) {
  margin: 0.5em;
}

:deep(.radio[disabled]) {
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

<style>
.o-radio__check {
  background-color: white;
  background-image: none;
  border: 2px solid lightgray;
}

.o-radio__check:hover {
  border-color: #0c86c6;
}

.o-radio__check--checked {
  border: 5px solid #0c86c6;
}
</style>
