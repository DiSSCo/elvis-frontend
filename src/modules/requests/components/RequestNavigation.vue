<template>
  <div class="form-steps-wrapper">
    <div
      :scrollOnStart="false"
      :highlightFirstItem="true"
      :offset="0"
      :modifyUrl="false"
      :exact="true"
      class="form-steps"
    >
      <a
        v-for="(step, index) in steps"
        :key="index"
        :href="`#${step.id}`"
        :class="{ disabled: step.disabled, 'is-active': active === index }"
        class="scrollactive-item"
        @click="setActive(index)"
      >
        <span class="step" :class="{ last: index === steps.length - 1 }" />
        <span class="step-text">{{
          step.name
        }}</span>
      </a>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    steps: Array,
  },

  data() {
    return {
      active: 0,
    };
  },

  methods: {
    setActive(index) {
      this.active = index;
    },
  },
};
</script>

<style lang="scss" scoped>
.form-steps-wrapper {
  background: $grey-xlight;
  padding: 1em;
  margin-bottom: 1em;
  flex: 0;
}
.form-steps {
  display: flex;
  flex-flow: column nowrap;
  a {
    display: flex;
    align-items: flex-start;
    padding-bottom: 0.6em;
    overflow: hidden;
    color: $black;
    &:hover {
      text-decoration: none !important;
      font-weight: bold;
    }
    &.is-active {
      .step {
        background: $white;
        border-color: $yellow;
      }
      .step-text {
        font-weight: bold;
      }
    }
  }

  .step {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 25px;
    min-width: 25px;
    height: 25px;
    background: $grey-dark;
    border-radius: 50%;
    border: 3px solid $white;
    font-weight: 600;
    font-family: $font-family-secondary;
    &.last:after {
      content: '';
      width: 0;
      height: 0;
      background: none;
    }
    &:after {
      content: '';
      width: 2px;
      height: 200px;
      background: $grey-medium;
      position: absolute;
      bottom: -203px;
      left: 9px;
    }
  }
  .step-text {
    margin-left: 2em;
  }
}
.scrollactive-item.disabled {
  pointer-events: none;
  opacity: 0.3;
}
</style>
