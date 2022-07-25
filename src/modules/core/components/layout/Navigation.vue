<template>
  <div class="nav">
    <ul class="nav-list">
      <router-link tag="li" :to="{ name: 'institutions' }">
        <i class="feather icon-shield" />
        <span>{{ $t('navigation.institutions') }}</span>
      </router-link>
      <router-link v-if="isAdmin || isTafAdmin" tag="li" :to="{ name: 'requesters' }">
        <i class="feather icon-users" />
        <span>{{ $t('navigation.requesters') }}</span>
      </router-link>
      <router-link tag="li" :to="{ name: 'collections' }">
        <i class="feather icon-database" />
        <span>{{ $t('navigation.collections') }}</span>
      </router-link>
      <router-link tag="li" :to="{ name: 'facilities' }">
        <i class="feather icon-aperture" />
        <span>{{ $t('navigation.facilities') }}</span>
      </router-link>
      <router-link tag="li" :to="{ name: 'calls' }">
        <i class="feather icon-feather" />
        <span>{{ $t('navigation.calls') }}</span>
      </router-link>
      <router-link tag="li" :to="{ name: 'requests' }">
        <i class="feather icon-inbox" />
        <span>{{ $t('navigation.requests') }}</span>
      </router-link>
    </ul>
  </div>
</template>

<script>
import { isAdmin, isTafAdmin } from '@/modules/core/utils/auth';
export default {
  computed: {
    isAdmin() {
      return isAdmin();
    },
    isTafAdmin() {
      return isTafAdmin();
    }
  }
};
</script>

<style lang="scss" scoped>
.nav {
  display: flex;
  align-items: center;
  margin: 0 2em;
  background: $blue;
  height: $header-height;

  .nav-list {
    display: flex;
    flex: 1;
    color: $white;
    height: 100%;

    li {
      cursor: pointer;
      display: flex;
      flex: 1;
      flex-flow: column nowrap;
      align-items: center;
      justify-content: center;
      height: 100%;
      padding: 1em;
      box-shadow: 1px 0 0 0 $blue-dark;
      width: 90px;
      font-size: 13px;
      border-top: 5px solid transparent;
      border-bottom: 5px solid transparent;
      border-collapse: collapse;
      &:hover {
        border-bottom-color: $yellow;
      }
      &:first-child {
        box-shadow: -1px 0 0 0 $blue-dark, 1px 0 0 0 $blue-dark;
      }
      i {
        color: $white;
        font-size: 24px;
      }
      &.router-link-active {
        background: $blue-dark;
        border-bottom-color: $yellow;
        box-shadow: none;
        pointer-events: none;
      }
      span {
        margin-top: 5px;
      }
    }
  }
}
.size-up-to-tablet {
  .nav {
    position: fixed;
    width: 100%;
    bottom: 0;
    left: 0;
    margin: 0;
    z-index: 999;
    li {
      width: auto;
      font-size: 10px;
      &:hover {
        border-top-color: $yellow;
        border-bottom-color: transparent;
      }
      &.router-link-active {
        background: $blue-dark;
        border-bottom-color: transparent;
        border-top-color: $yellow;
      }
    }
  }
}

.size-small-phone .nav li span {
  display: none;
}
</style>
