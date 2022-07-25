<template>
  <div v-if="isBeingHandled" class="submit-form">
    <h1>{{ $t('request.submit_update_title') }}</h1>
    <p>{{ $t('request.submit_update_text_va') }}</p>
    <b-button type="is-primary" size="is-large" @click.prevent="submit('updateRequest')" :loading="loading">{{
      $t('request.update_request')
    }}</b-button>
  </div>
  <div v-else class="submit-form">
    <h1>{{ $t('request.submit_title') }}</h1>
    <p>{{ $t('request.submit_text') }}</p>
    <b-button type="is-primary" size="is-large" @click.prevent="submit('submitRequest')" :loading="loading">{{
      $t('request.submit_request')
    }}</b-button>
  </div>
</template>

<script>
export default {
  props: {
    formData: {
      type: Object
    }
  },

  data() {
    return {
      loading: false
    };
  },

  computed: {
    isBeingHandled() {
      return this.formData.status === 'being_handled' || this.formData.status === 'submitted';
    }
  },
  methods: {
    submit(type) {
      this.loading = true;
      this.$emit(type);
    }
  }
};
</script>

<style lang="scss" scoped>
h1 {
  border-top: 1px solid $grey-light;
  margin-top: 1em;
}
</style>
