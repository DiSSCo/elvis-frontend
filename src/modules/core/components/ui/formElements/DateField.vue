<template>
  <div v-if="editable" class="date-picker">
    <o-datepicker
      :value="date"
      :placeholder="placeHolder"
      icon="calendar-today"
      position="top-right"
      trap-focus
      @update:modelValue="handleInput"
      :min-date="minDate"
    >
    </o-datepicker>
  </div>
  <div v-else>{{ val ? (val.value ? setDate(val.value) : setDate(val)) : '-' }}</div>
</template>

<script>
import { setDate } from '@/modules/core/utils/helpers';

export default {
  props: {
    path: {
      type: Array,
    },
    value: [String, Object, Array],
    placeHolder: {
      type: String,
    },
    loading: {
      type: Boolean,
    },
    editable: {
      type: Boolean,
      default: true,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    minDate: Date,
  },

  computed: {
    date() {
      const date = this.val;

      let newDate;
      if (date) {
        if (Array.isArray(date)) {
          newDate = new Date(Date.UTC(date[0], date[1] - 1, date[2]));
        } else if (typeof date === 'string') {
          newDate = new Date(date);
        } else {
          newDate = Number.isNaN(newDate.getTime()) ? new Date() : null;
        }
      }

      return newDate;
    },
  },

  data() {
    return {
      val: this.value?.value || this.value,
    };
  },

  watch: {
    minDate: {
      handler(value) {
        if (value && value >= this.date) {
          this.val = value;
        }
      },
      immediate: true,
    },

    value(val) {
      this.val = val;
    },
  },

  methods: {
    setDate(date) {
      return setDate(date);
    },

    handleInput(event) {
      const value = [event.getFullYear(), event.getMonth() + 1, event.getDate(), 0, 0];

      this.$emit('updateInput', { path: this.path, type: 'string', value });
    },
  },
};
</script>
<style lang="scss" scoped>
.date-picker {
  flex: 1;
}
</style>
