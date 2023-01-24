<template>
  <div class="comments-container">
    <p>{{ $t('request.comments') }}</p>
    <p>
      <small v-if="requestStatus === 'approved'">
        ({{ $t('request.comments_section_closed') }})
      </small>
    </p>
    <form @submit.prevent class="form">
      <field-row
        v-if="requestStatus !== 'approved'"
        field="TextField"
        :value="null"
        :showLabel="false"
        :fieldOptions="{ maxlength: 500, rows: 4, reset }"
      />

      <div class="action-btns" :class="{ 'status-approved': requestStatus === 'approved' }">
        <o-tooltip size="large"
          variant="primary"
          label="Download all comments for this request."
          animated multilined
        >
          <o-button class="secondaryButton"
            v-if="comments.messages && comments.messages.length"
            @click.prevent="downLoadComments"
            ><i class="feather icon-download"
          /></o-button>
        </o-tooltip>
        <o-button v-if="requestStatus !== 'approved'"
          variant="primary" @click="submit"
          :loading="loading"
        >{{
          $t('request.add_comment')
        }}</o-button>
      </div>
    </form>

    <div v-if="comments.messages && comments.messages.length" class="comments">
      <div class="comment" v-for="(comment, index) in comments.messages" :key="index">
        <p class="comment-message is-italic is-marginless">{{ comment.payload.data }}</p>
        <small>{{ comment.author.fullName }} - {{ setDateTime(comment.createdAt) }}</small>
      </div>
    </div>
  </div>
</template>

<script>
import { setDateTime } from '@/modules/core/utils/helpers';
import { fetchComments, downLoadAllComments, postComments } from '@/services/requestsService';
import FieldRow from '@/modules/core/components/ui/formElements/FieldRow.vue';

export default {
  components: {
    FieldRow,
  },

  props: {
    requestId: String,
    requestStatus: String,
  },

  data() {
    return {
      comment: '',
      comments: [],
      loading: false,
      reset: false,
    };
  },

  created() {
    this.emitter.on('updateField', this.handleFormField);
    this.getComments(this.requestId);
  },

  unmounted() {
    this.emitter.off('updateField');
  },

  methods: {
    setDateTime(date) {
      return setDateTime(date);
    },

    async getComments(id) {
      try {
        const response = await fetchComments(id);
        if (response.status === 200) {
          this.comments = response.data.data;
        }
      } catch (error) {
        console.log(error);
      }
    },

    async downLoadComments() {
      try {
        const response = await downLoadAllComments(this.requestId);
        const filename = response.headers['content-disposition'].split('filename=').pop().replace(/['"]+/g, '');
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `request_${filename}`);
        document.body.appendChild(link);
        link.click();
      } catch (error) {
        console.log(error);
      }
    },

    handleFormField(payload) {
      this.comment = payload.value.value;
    },

    async submit() {
      if (!this.comment.length) return;
      this.loading = true;
      const payload = {
        body: this.comment,
      };
      try {
        await postComments(this.requestId, payload);
        setTimeout(() => {
          this.loading = false;
          this.comment = '';
          this.reset = !this.reset;
          this.getComments(this.requestId);
        }, 500);
      } catch (error) {
        console.log(error);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.form {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.action-btns {
  display: flex;
  justify-content: space-between;
  width: 100%;
  &.status-approved {
    width: auto;
  }
}
.comments-container {
  background: $grey-xlight;
  padding: 1em;
  font-size: 13px;
  display: flex;
  flex-flow: column nowrap;
  flex: 1;
  height: 70%;
  small {
    font-size: 13px;
  }
}
.comments {
  border-top: 1px solid $grey;
  margin-top: 1em;
  padding-top: 1em;

  overflow-y: auto;
  .comment {
    margin-bottom: 1.5em;
  }
  .comment-message {
    font-weight: 600;
    white-space: pre-wrap;
  }
}
</style>
