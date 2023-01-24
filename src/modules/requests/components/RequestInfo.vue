<template>
  <div class="info">
    <div class="actions-wrapper">
      <span>{{ text }}</span>
      <span class="icon-wrapper"><i class="feather icon-info" /></span>
    </div>
    <a class="more-info" @click="modalActive = true">{{ $t('more_info') }}</a>

    <o-modal v-model="modalActive">
      <div class="box">
        <div v-html="moreText" />
      </div>
    </o-modal>
  </div>
</template>

<script>
export default {
  props: {
    text: String,
    moreText: String,
  },

  data() {
    return {
      modalActive: false,
    };
  },
};
</script>

<style lang="scss" scoped>
.info {
  display: flex;
  flex-direction: column;
  font-size: 13px;
  background: lighten($blue, 35%);
  padding: 0.5em 1em 1em;
  margin-bottom: 1em;
  .actions-wrapper {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    flex: 1;
  }

  .icon-wrapper {
    font-size: 24px;
    line-height: 1;
  }

  .more-info {
    color: $blue-dark;
    text-decoration: underline;
  }
}
</style>
