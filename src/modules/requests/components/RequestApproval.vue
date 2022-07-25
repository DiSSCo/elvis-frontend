<template>
  <div>
    <div v-if="editable && status === 'submitted'" class="approval-btn" @click="approve">
      <b-button type="is-success" :loading="loading">
        <span> <i class="feather icon-check" /> {{ $t('approve') }} </span>
      </b-button>
    </div>

    <div v-if="editable && status === 'approved'" class="approval-btn" @click="undoApproval">
      <b-button type="is-warning" :loading="loading">
        <span> <i class="feather icon-x" /> {{ $t('undo_approval') }} </span>
      </b-button>
    </div>
    <div v-if="errorMessage" class="has-text-danger">{{ errorMessage }}</div>
  </div>
</template>

<script>
import { approveRequest, unapproveRequest } from '@/services/requestsService';
export default {
  props: {
    editable: {
      type: Boolean
    },
    status: {
      type: String
    },
    requestId: {
      type: String
    }
  },

  data() {
    return {
      loading: false,
      errorMessage: ''
    };
  },

  methods: {
    approve() {
      this.loading = true;
      this.errorMessage = '';
      this.$buefy.dialog.confirm({
        confirmText: String(this.$t('approve')),
        cancelText: String(this.$t('cancel')),
        message: String(this.$t('request.request_approve_question')),
        type: 'is-success',
        onConfirm: async () => {
          try {
            const response = await approveRequest(this.requestId);
            if (response.status === 200) {
              setTimeout(() => {
                this.$root.$emit('reload', { id: this.requestId, isCoordinator: true });
                this.loading = false;
                this.isOpen = -1;
              }, 2000);
            }
          } catch (error) {
            console.log(error);
            this.loading = false;
            this.errorMessage = `Something went wrong: ${error}`;
          }
        },
        onCancel: () => {
          this.loading = false;
        }
      });
    },

    undoApproval() {
      this.loading = true;
      this.errorMessage = '';
      this.$buefy.dialog.confirm({
        confirmText: String(this.$t('undo_approval')),
        cancelText: String(this.$t('cancel')),
        message: String(this.$t('request.request_unapprove_question')),
        type: 'is-warning',
        onConfirm: async () => {
          try {
            const response = await unapproveRequest(this.requestId);
            if (response.status === 200) {
              setTimeout(() => {
                this.$root.$emit('reload', { id: this.requestId, isCoordinator: true });
                this.loading = false;
                this.isOpen = -1;
              }, 2000);
            }
          } catch (error) {
            console.log(error);
            this.loading = false;
            this.errorMessage = `Something went wrong: ${error}`;
          }
        },
        onCancel: () => {
          this.loading = false;
        }
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.approval-btn {
  display: flex;
  justify-content: flex-end;
  background: $grey-xlight;
  padding: 0.5em;
}
</style>
