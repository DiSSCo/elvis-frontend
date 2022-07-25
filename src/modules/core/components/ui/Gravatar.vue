<template>
  <div class="gravatar">
    <div class="mask" :style="{ transform: `rotate(${randomRotation()}deg)`, width: `${size}px`, height: `${size}px` }">
      <span
        class="circle circle1"
        :style="{
          backgroundColor: randomColor(),
          width: `${size}px`,
          height: `${size}px`,
          top: `-${size / 4}px`,
          left: 0
        }"
      />
      <span
        class="circle circle2"
        :style="{
          backgroundColor: randomColor(),
          width: `${size}px`,
          height: `${size}px`,
          top: `${size / 4}px`,
          left: `${size / 4}px`
        }"
      />
      <span
        class="circle circle3"
        :style="{
          backgroundColor: randomColor(),
          width: `${size}px`,
          height: `${size}px`,
          top: `${size / 4}px`,
          left: `-${size / 4}px`
        }"
      />
    </div>
    <div class="initials" :style="{ fontSize: `${size / 2}px` }">{{ initials }}</div>
  </div>
</template>

<script>
export default {
  props: {
    initials: {
      type: String
    },
    size: {
      type: Number,
      default: 40
    }
  },
  methods: {
    randomColor() {
      const colors = ['#0c86c6', '#205692', '#ffd85d', '#10c1ff', '#f7a112'];
      const index = Math.floor(Math.random() * colors.length);
      return colors[index];
    },

    randomRotation() {
      return Math.floor(Math.random() * 360);
    }
  }
};
</script>

<style lang="scss" scoped>
$circle-size: 40px;
.gravatar {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.mask {
  position: relative;
  overflow: hidden;
  border-radius: 50%;
}
.circle {
  opacity: 0.75;
  position: absolute;
  border-radius: 50%;
}
.circle1 {
  background: $blue;
}
.circle2 {
  background: $blue-dark;
}
.circle3 {
  background: $yellow;
}
.initials {
  font-weight: 600;
  font-size: 18px;
  text-transform: uppercase;
  color: $white;
  position: absolute;
}
</style>
