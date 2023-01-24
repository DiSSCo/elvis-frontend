<template>
  <div class="nav">
    <ul class="nav-list">
      <router-link :to="{ name: 'institutions' }" v-slot="{ isExactActive, href }">
        <li :class="[href === pathName && 'router-link-active', isExactActive && 'router-link-exact-active']">
          <i class="feather icon-shield" />
          <span>{{ $t('navigation.institutions') }}</span>
        </li>
      </router-link>
      <router-link v-if="isAdmin || isTafAdmin" :to="{ name: 'requesters' }" v-slot="{ isExactActive, href }">
        <li :class="[href === pathName && 'router-link-active', isExactActive && 'router-link-exact-active']">
          <i class="feather icon-users" />
          <span>{{ $t('navigation.requesters') }}</span>
        </li>
      </router-link>
      <router-link :to="{ name: 'collections' }" v-slot="{ isExactActive, href }">
        <li :class="[href === pathName && 'router-link-active', isExactActive && 'router-link-exact-active']">
          <i class="feather icon-database" />
          <span>{{ $t('navigation.collections') }}</span>
        </li>
      </router-link>
      <router-link :to="{ name: 'facilities' }" v-slot="{ isExactActive, href }">
        <li :class="[href === pathName && 'router-link-active', isExactActive && 'router-link-exact-active']">
          <i class="feather icon-aperture" />
          <span>{{ $t('navigation.facilities') }}</span>
        </li>
      </router-link>
      <router-link :to="{ name: 'calls' }" v-slot="{ isExactActive, href }">
        <li :class="[href === pathName && 'router-link-active', isExactActive && 'router-link-exact-active']">
          <i class="feather icon-feather" />
          <span>{{ $t('navigation.calls') }}</span>
        </li>
      </router-link>
      <router-link :to="{ name: 'requests' }" v-slot="{ isExactActive, href }">
        <li :class="[href === pathName && 'router-link-active', isExactActive && 'router-link-exact-active']">
          <i class="feather icon-inbox" />
          <span>{{ $t('navigation.requests') }}</span>
        </li>
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
    },
    pathName() {
      let activeRoute;

      if (this.$route) {
        activeRoute = `/${this.$route.path.split('/')[1]}`;
      } else {
        activeRoute = `/${window.location.pathname.split('/')[1]}`;
      }

      return activeRoute;
    },
  },
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

    a {
      color: $white;
      text-decoration: none;

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
