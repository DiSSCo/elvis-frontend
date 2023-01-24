<template>
  <div class="image-wrapper">
    <field-row
      v-if="editable && !facility.images.length"
      field="UploadField"
      label="Upload an image"
      :fieldOptions="{
        url: `/institutions/${facility.institutionId}/facilities/${facility.id}/images`,
        tooltip: $t('tooltip.file_upload'),
        maxSize: 1000000,
        accept: 'image/*'
      }"
    />
    <div v-else class="image" :class="{ thumb: editable, 'no-image': !image }">
      <img v-if="image"
        alt="Facility image"
        :src="`data:${image.contentType.base}
        /${image.contentType.subType};base64, ${image.payload}`"
      />

      <img v-else src="~@/assets/images/no-image.svg" alt="" />
    </div>
  </div>
</template>

<script>
import { fetchImage } from '@/services/facilitiesService';
import FieldRow from '@/modules/core/components/ui/formElements/FieldRow.vue';

export default {
  components: {
    FieldRow,
  },
  props: {
    editable: {
      type: Boolean,
      default: false,
    },
    facility: {
      type: [Object, Array],
    },
  },

  data() {
    return {
      image: null,
    };
  },

  watch: {
    facility: {
      handler() {
        this.image = null;
        this.fetchImage();
      },
      deep: true,
    },
  },

  created() {
    this.emitter.on('fileUploaded', this.reload);
    this.fetchImage();
  },

  beforeUnmount() {
    this.emitter.off('fileUploaded');
  },

  methods: {
    reload() {
      this.$emit('reload', this.facility.id);
    },

    async fetchImage() {
      const image = this.facility.images[this.facility.images.length - 1];
      if (image) {
        try {
          const response = await fetchImage(this.facility.institutionId, this.facility.id, image);
          this.image = response.data.data;
        } catch (error) {
          console.log(error);
        }
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.image-wrapper {
  height: 100%;
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  margin-bottom: 2em;
}
.image {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 300px;
  height: 200px;
  &.thumb {
    width: auto;
    height: 100px;
    img {
      height: 100%;
      width: auto;
    }
  }
  &.no-image {
    opacity: 0.6;
    background: $grey;
    img {
      height: 50px;
    }
  }
}
</style>
