<template>
  <div class="status">
    <dl>
      <dt>{{ $t('request.request_status') }}</dt>
      <dd>
        <tag :text="$t(`status.${status}`)" :variant="$t(`status.class.${status}`)" :rounded="true" size="large"/>
      </dd>
      <dt>{{ $t('profile.name') }}</dt>
      <dd>{{ profile.firstName }} {{ profile.lastName }}</dd>
      <dt>{{ $t('profile.email') }}</dt>
      <dd>{{ profile.email }}</dd>
      <dt>{{ $t('profile.orcid') }}</dt>
      <dd>{{ sanitizeOrcId(profile.orcId) || '-' }}</dd>
    </dl>
  </div>
</template>

<script>
import { sanitizeOrcId } from '@/modules/core/utils/helpers';
import Tag from '@/modules/core/components/ui/Tag.vue';

export default {
  props: {
    formData: Object,
  },

  components: {
    Tag,
  },

  computed: {
    status() {
      return this.formData.status;
    },

    profile() {
      return this.formData.creatorData;
    },
  },

  methods: {
    sanitizeOrcId(id) {
      return sanitizeOrcId(id);
    },
  },
};
</script>

<style lang="scss" scoped>
.status {
  font-size: 13px;
  background: $grey-xlight;
  padding: 1em;
  margin-bottom: 1em;
  display: flex;
  flex-flow: column wrap;
  flex: 1;

  .tag {
    align-self: center;
    min-width: 80%;
    height: 2em;
  }
  dl {
    align-items: center;
    dt,
    dd {
      padding: 5px;
    }
    dt {
      flex: 0 1 30%;
      word-wrap: normal;
    }
    dd {
      margin-left: auto;
      padding-left: 1em;
      flex: 1 1 60%;
    }
  }
}
</style>
