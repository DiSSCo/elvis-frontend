<template>
  <div>
    <b-button
      v-if="isAllowed('manage_coordinators') && isOwnInstitution"
      type="is-primary"
      @click.stop="addUserModalActive = true"
    >
      <span> <i class="feather icon-plus" /> Add user </span>
    </b-button>

    <div v-if="tableData" class="people-view">
      <b-table
        :data="tableData"
        :row-class="(row, index) => 'row'"
        :mobile-cards="false"
        :paginated="tableData.length > 10"
        :per-page="perPage"
        :default-sort-direction="defaultSortDirection"
        :sort-icon="sortIcon"
        :sort-icon-size="sortIconSize"
        :default-sort="tableData.length ? 'firstName' : null"
      >
        <b-table-column class="profile-pic" custom-key="profilePic" width="70" v-slot="props">
          <gravatar :initials="getInitials(props.row.firstName, props.row.lastName)" />
        </b-table-column>
        <b-table-column field="firstName" label="Name" sortable v-slot="props">
          <div class="full-name">{{ props.row.firstName }} {{ props.row.lastName }}</div>
        </b-table-column>
        <b-table-column field="email" label="Email" sortable v-slot="props">
          {{ props.row.email }}
        </b-table-column>
        <b-table-column field="attributes.orcId" :label="$t('profile.orcid')" width="180" sortable v-slot="props">
          <div class="details">
            <a
              v-if="props.row.attributes && props.row.attributes.orcId"
              :href="`//orcid.org/${orcId(props.row.attributes.orcId)}`"
              target="blank"
              >{{ orcId(props.row.attributes.orcId) }}</a
            >
            <span v-else>-</span>
          </div>
        </b-table-column>
        <b-table-column field="groups" label="Assigned roles" sortable v-slot="props">
          {{ getRoles(props.row.groups) }}
        </b-table-column>
        <b-table-column
          v-if="isAllowed('manage_coordinators') && isOwnInstitution"
          field="actions"
          width="125"
          label="Actions"
          v-slot="props"
        >
          <div class="action-btns">
            <b-tooltip label="edit user roles" type="is-dark">
              <b-button class="disable-action is-small" @click.stop="editUser(props.row)">
                <i class="feather icon-edit-1" />
              </b-button>
            </b-tooltip>
            <b-tooltip
              :label="props.row.attributes.institutionId ? 'remove the assigned roles first' : 'remove user'"
              type="is-dark"
            >
              <b-button
                class="delete-action is-small"
                @click.stop="deleteUser(props.row)"
                :disabled="props.row.attributes.institutionId"
              >
                <i class="feather icon-trash-2" />
              </b-button>
            </b-tooltip>
          </div>
        </b-table-column>
        <template slot="empty">
          {{ $t('institution.no_people_found') }}
        </template>
        <template slot="bottom-left">
          <b-select v-model="perPage">
            <option value="10">10 {{ $t('per_page') }}</option>
            <option value="35">35 {{ $t('per_page') }}</option>
            <option value="50">50 {{ $t('per_page') }}</option>
          </b-select>
        </template>
      </b-table>
    </div>
    <b-modal v-model="addUserModalActive" :width="600">
      <div class="box user-modal">
        <h3 class="header">Add user</h3>
        <form @submit.prevent>
          <field-row
            field="LinkField"
            label="Search for user(s)"
            :value="[]"
            :fieldOptions="{
              isSingleLink: false,
              placeHolder: 'search and select (multiple) users',
              autoCompleteData: autoCompleteList
            }"
          />
          <div class="action-btns">
            <b-button type="is-primary" :loading="loading" @click="saveUsers">
              {{ $t('save') }}
            </b-button>
            <b-button @click="addUserModalActive = false" outlined>
              {{ $t('cancel') }}
            </b-button>
          </div>
        </form>
      </div>
    </b-modal>
    <b-modal v-model="editUserModalActive" :width="600">
      <div class="box user-modal">
        <h3 class="header">Edit user</h3>
        <dl v-if="selectedUser" class="profile">
          <dt>Name</dt>
          <dd>{{ selectedUser.firstName }} {{ selectedUser.lastName }}</dd>
          <dt>Institution</dt>
          <dd>{{ institution.name }}</dd>
          <dt>Assign Roles</dt>
          <dd>
            <checkbox-field
              v-for="(userRole, index) in userRoles"
              :key="index"
              :label="userRole.name"
              :value="userRole.value"
              @input="select($event, userRole.name)"
            />
          </dd>
        </dl>

        <div class="action-btns">
          <b-button type="is-primary" :loading="loading" @click="saveEditUsers">
            {{ $t('close') }}
          </b-button>
        </div>
      </div>
    </b-modal>
  </div>
</template>

<script>
import { isAllowed, isOwnInstitution } from '@/modules/core/utils/auth';
import { sanitizeOrcId } from '@/modules/core/utils/helpers';
import { assignTaCoordinator, assignVaCoordinator, assignModerator } from '@/services/usersService';
import { addUserToInstitution, removeUserFromInstitution } from '@/services/institutionsService';
import Gravatar from '@/modules/core/components/ui/Gravatar';
import FieldRow from '@/modules/core/components/ui/formElements/FieldRow';
import CheckboxField from '@/modules/core/components/ui/formElements/CheckboxField';

export default {
  components: {
    Gravatar,
    FieldRow,
    CheckboxField
  },

  props: {
    institution: Object,
    people: Array
  },

  computed: {
    isOwnInstitution() {
      const { instId } = this.$route.params;
      return isOwnInstitution(instId);
    }
  },

  data() {
    return {
      tableData: null,
      defaultSortDirection: 'asc',
      sortIcon: 'arrow-up',
      sortIconSize: 'is-small',
      currentPage: 1,
      perPage: 10,
      addUserModalActive: false,
      editUserModalActive: false,
      newUsers: null,
      autoCompleteList: null,
      loading: false,
      selectedUser: null,
      userRoles: null
    };
  },

  watch: {
    people: {
      handler(value, oldVal) {
        if (value && value !== oldVal) {
          this.setTableData(value);
        }
      },
      deep: true,
      immediate: true
    }
  },

  async created() {
    this.$root.$on('updateField', this.handleFormField);
  },

  beforeDestroy() {
    this.$root.$off('updateField');
  },

  methods: {
    isAllowed(permission) {
      return isAllowed(permission);
    },

    getInitials(firstName, lastName) {
      const firstChar = firstName.charAt(0);
      const lastChar = lastName.split(' ').pop().charAt(0);
      return `${firstChar}${lastChar}`;
    },

    getRoles(roles) {
      return roles?.length
        ? roles.filter(role => role !== 'administrator' && role !== 'requester' && role !== 'ta scorer').join(', ')
        : null;
    },

    setTableData(data) {
      this.tableData = data.filter(
        person =>
          person.attributes?.relatedInstitutionId === this.institution.id ||
          person.attributes?.homeInstitutionId === this.institution.id ||
          person.attributes?.institutionId === this.institution.id
      );

      this.autoCompleteList = this.people
        .filter(person => !this.tableData.some(p => p.id === person.id))
        .map(p => `${p.firstName} ${p.lastName}`)
        .sort();
    },

    handleFormField(event) {
      this.newUsers = event.value.value;
    },

    saveUsers() {
      this.loading = true;
      this.newUsers.map(async user => {
        const foundUser = this.people.find(p => `${p.firstName} ${p.lastName}` === user);
        if (foundUser) {
          try {
            await addUserToInstitution(this.institution.id, foundUser.id);
          } catch (error) {
            console.log(error);
            this.loading = false;
          }
        }
      });

      setTimeout(() => {
        this.loading = false;
        this.addUserModalActive = false;
        this.$emit('reload');
      }, 300);
    },

    saveEditUsers() {
      this.loading = true;
      setTimeout(() => {
        this.loading = false;
        this.editUserModalActive = false;
        this.$emit('reload');
      }, 100);
    },

    editUser(user) {
      this.selectedUser = user;
      this.getUserRoles();
      this.editUserModalActive = true;
    },

    async deleteUser(user) {
      this.loading = true;
      this.$buefy.dialog.confirm({
        confirmText: String(this.$t('remove')),
        cancelText: String(this.$t('cancel')),
        message: 'Are you sure you want to remove this person from the list?',
        type: 'is-danger',
        onConfirm: async () => {
          try {
            await removeUserFromInstitution(this.institution.id, user.id);
            this.$emit('reload');
            this.loading = false;
          } catch (error) {
            console.log(error);
            this.loading = false;
          }
        },
        onCancel: () => {
          this.loading = false;
        }
      });
    },

    async getUserRoles() {
      try {
        const roles = ['ta coordinator', 'va coordinator', 'institution moderator'];
        this.userRoles = roles.map(name => {
          const value = !!this.selectedUser.groups.includes(name);
          return { name, value };
        });
      } catch (error) {
        console.log(error);
      }
    },

    async select(event, id) {
      if (id === 'institution moderator') {
        await assignModerator(this.institution.id, this.selectedUser.id, event.value);
      }
      if (id === 'ta coordinator') {
        await assignTaCoordinator(this.institution.id, this.selectedUser.id, event.value);
      }
      if (id === 'va coordinator') {
        await assignVaCoordinator(this.institution.id, this.selectedUser.id, event.value);
      }
    },

    orcId(id) {
      return sanitizeOrcId(id);
    }
  }
};
</script>

<style lang="scss" scoped>
.people-view {
  margin-top: 1em;
}
.user-modal {
  min-height: 400px;
  .header {
    border-bottom: 1px solid $grey;
    margin-bottom: 2em;
    padding-bottom: 1em;
  }
  .action-btns {
    border-top: 1px solid $grey;
    margin-top: 2em;
    padding-top: 1em;
  }
}
</style>
