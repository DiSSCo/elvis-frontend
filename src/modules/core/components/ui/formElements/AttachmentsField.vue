<template>
  <div v-if="attachments.length">
    <div v-for="(file, index) in attachments" :key="index" class="tags">
      <div class="attached">
        <div type="is-light" ellipsis>
          <i class="feather icon-paperclip" />
          <span class="attachment" @click="openAttachment(file)">{{ file.fileName }}</span>
        </div>
        <div type="is-light">
          <small>{{ $t('file_handling.by') }}:</small>
          {{ file.owner.fullName }}
        </div>
        <div type="is-light" :closable="closable" @close="deleteAttachment(file)">{{
          setDateTime(file.addedAt)
        }}</div>
      </div>
    </div>
  </div>
  <div v-else>-</div>
</template>

<script>
import { setDateTime } from '@/modules/core/utils/helpers';
import { fetchAttachments, downloadAttachment, deleteAttachment } from '@/services/apiService';

export default {
  props: {
    fetchUrl: {
      type: String,
    },
    baseUrl: {
      type: String,
    },
    closable: {
      type: Boolean,
    },
    reload: {
      type: Number,
    },
  },

  data() {
    return {
      attachments: [],
    };
  },

  watch: {
    reload: {
      handler() {
        this.fetchAttachments();
      },
      immediate: true,
    },
  },

  methods: {
    setDateTime(date) {
      return setDateTime(date);
    },

    async fetchAttachments() {
      this.attachments = [];
      try {
        const response = await fetchAttachments(this.fetchUrl);
        this.attachments.push(...response.data.data.rows);
      } catch (error) {
        console.log(error);
      }
    },

    async openAttachment(attachment) {
      try {
        const response = await downloadAttachment(this.baseUrl, attachment.id);
        const filename = response.headers['content-disposition'].split('filename=').pop().replace(/['"]+/g, '');
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
      } catch (error) {
        console.log(error);
      }
    },

    async deleteAttachment(attachment) {
      try {
        await deleteAttachment(this.baseUrl, attachment.id);
        this.fetchAttachments();
      } catch (error) {
        console.log(error);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.attachment {
  color: $blue;
  margin-left: 3px;
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
}
</style>
