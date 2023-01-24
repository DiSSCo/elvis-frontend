<template>
  <div class="header">
    <nav class="navigation">
      <div v-if="!isHomePage" class="logo">
        <router-link title="Elvis" :to="'/'">
          <img v-if="sizes.includes('size-up-to-desktop')"
            :src="require('@/assets/images/logo/logo-elvis-white-compact.svg')" alt="Elvis logo" />
          <img v-else :src="require('@/assets/images/logo/logo-elvis-white.svg')" alt="Elvis logo" />
        </router-link>
      </div>

      <navigation v-if="isAuthenticated" />
    </nav>

    <div v-if="isAuthenticated" class="profile">
      <o-tooltip variant="primary" label="Questions and Feedback" position="bottom" animated>
        <router-link to="/help">
          <o-button class="button is-secondary help">
            <span>?</span>
          </o-button>
        </router-link>
      </o-tooltip>

      <o-dropdown aria-role="list" position="bottom-left">
        <template #trigger>
          <o-button class="button is-secondary profile" slot="trigger">
            <i class="settings icon icon-user" />
          </o-button>
        </template>

        <o-dropdown-item aria-role="listitem" @click="openProfile">
          {{ $t('profile.my_profile') }}
        </o-dropdown-item>
        <o-dropdown-item aria-role="listitem" @click="logout" data-cy="logout">
          {{ $t('logout') }}
        </o-dropdown-item>
        <o-dropdown-item v-if="isAdmin" aria-role="listitem" @click="openSettings">
          <span><i class="feather icon-settings" /> {{ $t('admin.settings') }}</span>
        </o-dropdown-item>
      </o-dropdown>

      <span slot="trigger" class="profile-text">{{ fullName }}</span>
    </div>

    <o-button v-else class="primaryButton login-btn" @click="login" data-cy="login-btn">
      {{ $t('login') }}
    </o-button>
  </div>
</template>

<script>
import {
  getProfile, kcLogin, kcLogout, isAdmin,
} from '@/modules/core/utils/auth';
import { getScreenSizes } from '@/modules/core/utils/devices';
import Dialog from '@/modules/core/components/ui/Dialog.vue';
import Navigation from './Navigation.vue';

export default {
  components: {
    Navigation,
  },

  props: {
    authenticated: Boolean,
  },

  computed: {
    isAuthenticated() {
      return this.authenticated;
    },

    isHomePage() {
      return this.$route.name === 'welcome';
    },

    isAdmin() {
      return isAdmin();
    },

    sizes() {
      return getScreenSizes();
    },

    profile() {
      return getProfile();
    },

    fullName() {
      return `${this.profile.firstName} ${this.profile.lastName}`;
    },
  },

  methods: {
    login() {
      kcLogin();
    },

    logout() {
      kcLogout();
    },

    openProfile() {
      if (this.$route.path !== '/profile') {
        this.$router.push({
          name: 'profile',
        });
      }
    },

    openSettings() {
      this.$router.push({
        name: 'settings',
      });
    },

    showErrorMessage() {
      this.$oruga.modal.open({
        component: Dialog,
        props: {
          cancelText: String(this.$t('return')),
          message: "You currently don't have permission to proceed.",
        },
        trapFocus: true,
        events: {
          onCancel: () => {
            this.$oruga.modal.closeAll();
          },
        },
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.header {
  height: $header-height;
  background: $primary;
  display: flex;
  align-items: center;
  justify-content: flex-end;

  padding: 0 2em;

  .prev-nav {
    display: none;

    i {
      font-size: 26px;
    }
  }

  .navigation {
    display: flex;
    align-items: center;
    flex: 1;
  }

  .logo,
  .logo a {
    display: flex;
    width: 100%;
  }

  .logo {
    width: 150px;
    max-height: 50px;

    .size-up-to-desktop & {
      max-width: 200px;
      min-width: 0;
    }

    .size-desktop & {
      width: 250px;
      min-width: 0;
    }

    img {
      width: 100%;
    }
  }
}

.profile {
  position: relative;
  display: flex;
  height: 100%;
  justify-content: center;
  align-items: center;
  padding-bottom: 0.5em;

  .settings {
    .size-up-to-desktop & {
      margin-left: 0 !important;
      margin-right: 0 !important;
    }
  }

  .arrow {
    display: none;

    .size-desktop & {
      display: flex;
    }
  }

  button {
    padding-top: 0;
    border-radius: 50%;
    border: 2px solid rgba(255, 255, 255, 0.4);
    display: flex;
    align-items: center;
    width: 40px;
    height: 40px;
    padding: 0;

    &:hover {
      border: 2px solid $white;
      background-color: transparent;
    }

    &.help {
      margin-top: 0;

      span {
        font-weight: 700;
        font-size: 24px;
        margin-top: 0;
      }
    }

    &.profile {
      margin-left: 24px;
    }
  }

  .profile-text {
    font-size: 8px;
    color: $white;
    position: absolute;
    right: 0;
    bottom: 4px;
    white-space: nowrap;
  }
}
</style>

<style>
.o-drop__item--active {
  color: #868696;
  background-color: white;
}

.o-drop__item--active:hover {
  color: #333333;
}

</style>
