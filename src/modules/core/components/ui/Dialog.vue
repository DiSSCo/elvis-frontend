<template>
    <div class="box">
        <p>
            {{ message }}
        </p>
    </div>
    <div class="action-btns action-buttons">
        <o-button class="cancelButton" @click="cancelDialog">
            {{ $t(cancelText) }}
        </o-button>
        <o-button v-if="confirmText" :class="!type && 'removeButton'" :variant="type && type" @click="confirmDialog">
            {{ $t(confirmText) }}
        </o-button>
    </div>
</template>

<script>
export default {
  props: {
    confirmText: String,
    cancelText: String,
    message: String,
    type: String,
  },

  methods: {
    confirmDialog() {
      this.$emit('onConfirm');
    },

    cancelDialog() {
      this.$emit('onCancel');
    },
  },
};
</script>

<style lang="css">
.action-buttons {
    padding: 3%;
    float: right;
}

.removeButton {
    background-color: #ff3860;
    border-color: transparent;
    font-weight: bold;
}

.cancelButton {
    border-color: #dbdbdb;
    background-color: transparent;
    font-weight: bold;
}
</style>
