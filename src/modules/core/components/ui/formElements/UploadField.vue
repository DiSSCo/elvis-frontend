<template>
  <div class="uploader-wrapper">
    <o-field class="uploader">
      <o-upload v-model="file" :accept="accept" :drag-drop="dragDrop">
        <section v-if="dragDrop" class="section">
          <div class="content has-text-centered">
            <p>
              <o-icon icon="upload" size="large" />
            </p>
            <p>{{ $t('file_handling.drop_files') }}</p>
          </div>
        </section>
        <a v-else class="button is-secondary">
          <o-icon icon="upload"></o-icon>
          <span>{{ $t('file_handling.choose_file') }}</span>
        </a>
      </o-upload>
      <span class="file-name" v-if="file">
        <i class="feather icon-paperclip" />
        {{ file.name }}
      </span>
      <span v-if="file" class="remove-file" @click="file = null"><i class="feather icon-x" /></span>
    </o-field>

    <o-button v-if="file && showUploadButton"
      variant="primary"
      @click.prevent="uploadFile"
      :loading="loadingUpload"
    >
      {{ $t('file_handling.start_upload') }}
    </o-button>
    <div v-if="uploadErrorMessage">
      <span class="has-text-danger">{{ uploadErrorMessage }}</span>
    </div>
  </div>
</template>

<script>
import { uploadAttachment } from '@/services/apiService';

export default {
  props: {
    url: String,
    maxSize: {
      type: Number,
      default: 25000000,
    },
    accept: String,
    dragDrop: {
      type: Boolean,
      default: false,
    },
    reset: Boolean,
  },

  data() {
    return {
      file: null,
      uploadErrorMessage: '',
      showUploadButton: !!this.url,
      loading: false,
      loadingUpload: false,
    };
  },

  watch: {
    file: {
      handler(value) {
        if (!this.url && value) {
          this.emitter.emit('fileUploaded', value);
        }
        if (value && value.size > this.maxSize) {
          this.uploadErrorMessage = this.$t('file_handling.limit', { limit: this.maxSize / 1000000 });
          this.showUploadButton = false;
        } else {
          this.uploadErrorMessage = '';
          this.showUploadButton = !!this.url;
        }
      },
    },
    reset: {
      handler() {
        this.file = null;
      },
      immediate: true,
    },
  },

  methods: {
    async uploadFile() {
      this.uploadErrorMessage = '';
      this.loadingUpload = true;
      const formData = new FormData();
      formData.append('file', this.file);
      if (this.url) {
        try {
          await uploadAttachment(this.url, formData);
          setTimeout(() => {
            this.loadingUpload = false;
            this.file = null;
            this.emitter.emit('fileUploaded', this.file);
          }, 2000);
        } catch (error) {
          console.log('error: ', error);
          this.loadingUpload = false;
          this.file = null;
          this.uploadErrorMessage = this.$t('file_handling.upload_error');
        }
      } else {
        setTimeout(() => {
          this.loadingUpload = false;
          this.emitter.emit('fileUploaded', this.file);
          this.file = null;
        }, 2000);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
:deep(.control) {
  margin-bottom: 0;
}

:deep(.file-name) {
  border-radius: 0;
}

.uploader-wrapper {
  width: 100%;
}

.uploader {
  display: flex;
  align-items: center;
}

.upload-file {
  display: flex;
  flex-flow: column nowrap;
  border: 1px solid $grey;
  flex: 1;
  cursor: pointer;
}

form {
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  align-items: center;
  padding: 0.5em;

  .browse-file {
    display: flex;
    flex: 1;

    label {
      flex: 1;
      margin: 0;
      align-self: center;
      cursor: pointer;
    }

    input {
      opacity: 0;
      width: 0;
      max-width: 0;
    }
  }

  .submit-file {
    margin-left: 0.5em;
  }

  .remove-file {
    cursor: pointer;
    padding: 5px;
    border-color: #dbdbdb;
    border-style: solid;
    border-width: 1px 1px 1px 0;
    border-radius: 0 4px 4px 0;
    height: 40px;
    display: flex;
    align-items: center;
    background: $grey;

    &:hover {
      background: $grey-dark;
      color: $white;
    }
  }
}
</style>
