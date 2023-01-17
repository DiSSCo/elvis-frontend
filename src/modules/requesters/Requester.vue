<template>
  <div v-if="requester">
    <div class="action-bar"></div>
    <div class="section">
      <div class="container">
        <router-link :to="{ path: `/requesters`, query: $route.query }">
          <i class="feather icon-arrow-left" /> {{ $t('requester.back_to_requesters') }}
        </router-link>
        <h1 class="title-link">{{ requester.firstName }} {{ requester.lastName }}</h1>

        <div class="columns">
          <div class="column is-3 gravatar-wrapper">
            <gravatar :initials="getInitials(requester.firstName, requester.lastName)"
              :size="175"
            />
          </div>
          <div class="column is-9">
            <dl class="profile">
              <dt>{{ $t('profile.email') }}</dt>
              <dd>{{ requester.email }}</dd>
              <dt>{{ $t('profile.gender') }}</dt>
              <dd>{{ gender }}</dd>
              <dt>{{ $t('profile.first_name') }}</dt>
              <dd>{{ requester.firstName }}</dd>
              <dt>{{ $t('profile.last_name') }}</dt>
              <dd>{{ requester.lastName }}</dd>
              <dt>{{ $t('profile.orcid') }}</dt>
              <dd>
                <a
                  v-if="requester.attributes && requester.attributes.orcId"
                  :href="`//orcid.org/${orcId(requester.attributes.orcId)}`"
                  target="blank"
                  @click.stop
                  >{{ orcId(requester.attributes.orcId) }}</a
                >
                <span v-else>-</span>
              </dd>
              <dt>{{ $t('profile.employed_by') }}</dt>
              <dd>{{ relatedInstitutionName || '-' }}</dd>
              <dt>{{ $t('profile.status') }}</dt>
              <dd v-if="isAdmin">
                <o-tooltip label="user status" variant="primary">
                  <o-switch
                    :value="!requester.bannedAt"
                    variant="primary"
                    @input="toggleStatus(requester.id, $event)"
                    @click.stop
                    >{{ requester.bannedAt ? 'Disabled' : 'Enabled' }}
                  </o-switch
                  >
                </o-tooltip>
              </dd>
              <dd v-else>
                <o-tooltip :label="requester.bannedAt ? 'Disabled' : 'Enabled'" variant="primary">
                  <div :class="{ 'has-text-danger': requester.bannedAt }">
                    {{ requester.bannedAt ? 'Disabled' : 'Enabled' }}
                  </div>
                </o-tooltip>
              </dd>
            </dl>

            <!--  TODO: refactor this -->
            <dl class="roles">
              <dt></dt>
              <dd><strong>Assigned user roles</strong></dd>
              <dt>Roles for Institution</dt>
              <dd v-if="isAdmin">
                <link-field
                  :value="institutionName"
                  :autoCompleteData="institutionsList"
                  :isSingleLink="true"
                  :removeable="!institutionId && !!selectedInstitutionId"
                  @input="selectInstitution"
                  placeHolder="No institution selected"
                />
              </dd>
              <dd v-else>
                {{ institutionName || '-' }}
              </dd>
              <dt>
                <span style="margin-right: 5px">User roles</span>
                <o-tooltip v-if="isAdmin" variant="primary" multilined animated>
                  <o-icon class="is-blue" size="is-small" icon="information" />
                  <template v-slot:content>
                    <span>Assign an institution first to edit the user roles</span>
                  </template>
                </o-tooltip>
              </dt>
              <dd v-if="isAdmin">
                <checkbox-field
                  v-for="(role, index) in institutionRoles"
                  :key="index"
                  :label="role.name"
                  :value="role.value"
                  :path="[role.name]"
                  :disabled="!institutionId && !selectedInstitutionId"
                  @input="select"
                />
              </dd>
              <dd v-else>
                <div v-for="(role, index) in institutionRoles" :key="index">
                  {{ role.value ? role.name : '' }}
                </div>
              </dd>
              <dt>Roles for Country</dt>
              <dd v-if="isAdmin || isTafAdmin">
                <link-field
                  :value="countryName"
                  :autoCompleteData="countryList"
                  :isSingleLink="true"
                  :removeable="!countryCode && !!selectedCountryCode"
                  @input="selectCountry"
                  placeHolder="No country selected"
                />
              </dd>
              <dd v-else>
                {{ countryName || '-' }}
              </dd>
              <dt>
                <span style="margin-right: 5px">User roles</span>
                <o-tooltip v-if="isAdmin || isTafAdmin" type="is-dark" multilined animated>
                  <o-icon class="is-blue" size="small" icon="information" />
                  <template v-slot:content>
                    <span>Assign a country first to edit the user roles</span>
                  </template>
                </o-tooltip>
              </dt>
              <dd v-if="isAdmin || isTafAdmin">
                <checkbox-field
                  v-for="(role, index) in countryRoles"
                  :key="index"
                  :label="role.name"
                  :value="role.value"
                  :path="[role.name]"
                  :disabled="!countryCode && !selectedCountryCode"
                  @input="select"
                />
              </dd>
              <dd v-else>
                <div v-for="(role, index) in countryRoles" :key="index">
                  {{ role.value ? role.name : '' }}
                </div>
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  fetchUserById,
  fetchUserGroups,
  updateUserStatus,
  assignTaCoordinator,
  assignVaCoordinator,
  assignTaScorer,
  assignTafAdmin,
  assignModerator,
} from '@/services/usersService';
import { capitalize, sanitizeOrcId } from '@/modules/core/utils/helpers';
import { isAdmin, isTafAdmin } from '@/modules/core/utils/auth';
import { fetchInstitutions } from '@/services/institutionsService';
import Gravatar from '@/modules/core/components/ui/Gravatar.vue';
import CheckboxField from '@/modules/core/components/ui/formElements/CheckboxField.vue';
import LinkField from '@/modules/core/components/ui/formElements/LinkField.vue';
import countries from '@/modules/core/schemas/country-list.json';

export default {
  components: {
    Gravatar,
    CheckboxField,
    LinkField,
  },

  computed: {
    gender() {
      return this.requester.gender ? capitalize(this.requester.gender) : '-';
    },

    relatedInstitutionName() {
      const { relatedInstitutionId } = this.requester.attributes;
      const [found] = this.institutions.filter((i) => i.id === relatedInstitutionId);
      return found ? found.name : null;
    },

    institutionId() {
      const { institutionId } = this.requester.attributes;
      return institutionId;
    },

    institutionName() {
      const [found] = this.institutions.filter((i) => i.id === this.institutionId);
      return found ? found.name : null;
    },

    institutionsList() {
      return this.institutions.map((institution) => institution.name).sort();
    },

    countryCode() {
      const { countryCode } = this.requester.attributes;
      return countryCode;
    },

    countryName() {
      const [found] = countries.filter((c) => c.code === this.countryCode);
      return found ? found.name : null;
    },

    countryList() {
      return countries.map((country) => country.name).sort();
    },

    isAdmin() {
      return isAdmin();
    },

    isTafAdmin() {
      return isTafAdmin();
    },
  },

  data() {
    return {
      requesters: null,
      userGroups: null,
      requester: null,
      institutions: null,
      instId: null,
      institutionRoles: null,
      countryRoles: null,
      assignedUserGroups: null,
      selectedInstitutionId: null,
      selectedCountryCode: null,
    };
  },

  async created() {
    await this.getInstitutions();
    await this.getRequester();
    this.institutionRoles = await this.getUserGroups(['institution moderator', 'ta coordinator', 'va coordinator']);
    if (this.isTafAdmin) {
      this.countryRoles = await this.getUserGroups(['ta scorer']);
    } else {
      this.countryRoles = await this.getUserGroups(['taf admin', 'ta scorer']);
    }
  },

  methods: {
    async selectInstitution(event) {
      [this.selectedInstitutionId] = this.institutions
        .filter((institution) => event.value.includes(institution.name))
        .map((i) => i.id);
    },

    async selectCountry(event) {
      [this.selectedCountryCode] = countries.filter(
        (country) => event.value.includes(country.name),
      ).map((c) => c.code);
    },

    getInitials(firstName, lastName) {
      const firstChar = firstName.charAt(0);
      const lastChar = lastName.split(' ').pop().charAt(0);
      return `${firstChar}${lastChar}`;
    },

    async getRequester() {
      const { id } = this.$route.params;
      try {
        const response = await fetchUserById(id);
        [this.requester] = response.data.data.rows;
      } catch (error) {
        console.log(error);
      }
    },

    async getUserGroups(roles) {
      if (!roles) return;
      try {
        if (!this.userGroups) {
          const response = await fetchUserGroups();
          this.userGroups = response.data.available_groups;
        }
        return this.userGroups
          .filter((group) => roles.includes(group))
          .map((name) => {
            const value = !!this.requester.groups.includes(name);
            return { name, value };
          });
      } catch (error) {
        console.log(error);
      }
    },

    async getInstitutions() {
      try {
        const response = await fetchInstitutions();
        this.institutions = response.data.data.rows;
      } catch (error) {
        console.log(error);
      }
    },

    async select(event) {
      const [id] = event.path;
      const instId = this.institutionId || this.selectedInstitutionId;
      const cCode = this.countryCode || this.selectedCountryCode;
      if (id === 'ta coordinator') {
        await assignTaCoordinator(instId, this.requester.id, event.value);
      }
      if (id === 'va coordinator') {
        await assignVaCoordinator(instId, this.requester.id, event.value);
      }
      if (id === 'institution moderator') {
        await assignModerator(instId, this.requester.id, event.value);
      }
      if (id === 'ta scorer') {
        await assignTaScorer(cCode, this.requester.id, event.value);
      }
      if (id === 'taf admin') {
        await assignTafAdmin(cCode, this.requester.id, event.value);
      }
      this.getRequester();
    },

    async toggleStatus(id, event) {
      this.requester.enabled = event;
      updateUserStatus(id, event);
    },

    orcId(id) {
      return sanitizeOrcId(id);
    },
  },
};
</script>

<style lang="scss" scoped>
.gravatar-wrapper {
  display: flex;
  align-items: flex-start;
  justify-content: center;
}
.profile {
  align-items: center;
  dt,
  dd {
    padding: 0.8em 1em;
  }
}
.roles {
  border-top: 1px solid $grey;
  padding-top: 1em;
}
:deep(.is-blue) {
  color: $blue;
}
</style>
