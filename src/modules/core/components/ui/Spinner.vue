<template>
  <div class="v-spinner" v-show="loading">
    <div class="v-clip"></div>
  </div>
</template>

<script>
export default {
  props: {
    loading: {
      type: Boolean,
      default: true
    }
  }
};
</script>

<style lang="scss" scoped>
.v-spinner {
  text-align: center;
}
.v-spinner .v-clip {
  -webkit-animation: v-clipDelay 0.5s 0s infinite linear;
  animation: v-clipDelay 0.5s 0s infinite linear;
  -webkit-animation-fill-mode: both;
  animation-fill-mode: both;
  display: inline-block;
  position: absolute;
  right: 5px;
  top: calc(50% - 10px);

  height: 20px;
  width: 20px;
  border-width: 2px;
  border-style: solid;
  border-color: $blue $blue transparent;
  border-radius: 100%;
  background: transparent;
}
@-webkit-keyframes v-clipDelay {
  0% {
    -webkit-transform: rotate(0deg) scale(1);
    transform: rotate(0deg) scale(1);
  }
  100% {
    -webkit-transform: rotate(360deg) scale(1);
    transform: rotate(360deg) scale(1);
  }
}
@keyframes v-clipDelay {
  0% {
    -webkit-transform: rotate(0deg) scale(1);
    transform: rotate(0deg) scale(1);
  }
  100% {
    -webkit-transform: rotate(360deg) scale(1);
    transform: rotate(360deg) scale(1);
  }
}
</style>
