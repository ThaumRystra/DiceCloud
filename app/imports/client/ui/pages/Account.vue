<script setup lang="ts">
import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { autorun, subscribe } from 'vue-meteor-tracker';
import getEntitledCents from '/imports/api/users/patreon/getEntitledCents';
import Invites from '/imports/api/users/Invites';
import linkWithPatreon from '/imports/api/users/methods/linkWithPatreon';
import { getUserTierAsync } from '/imports/api/users/patreon/tiers';
import addEmail from '/imports/api/users/methods/addEmail';
import removeEmail from '/imports/api/users/methods/removeEmail';
import CreatureStorageStats from '/imports/client/ui/creature/creatureList/CreatureStorageStats.vue';
import FileStorageStats from '/imports/client/ui/files/FileStorageStats.vue';
import { key } from '/imports/client/ui/vuexStore';
import { setDarkMode as setUserDarkMode } from '/imports/api/users/Users';

const store = useStore(key);
const router = useRouter();

const { result: user } = autorun(() => Meteor.user());
const googleAccount = computed(() => (user.value as any)?.services?.google);
const emails = computed(() => (user.value as any)?.emails);
const darkMode = computed(() => (user.value as any)?.darkMode);

const { result: invites } = autorun(() => {
  const usernames: Record<string, string> = {};
  Meteor.users.find({}).forEach((u: any) => {
    usernames[u._id] = u.username;
  });
  return Invites.find({
    inviter: Meteor.userId(),
  }, {
    sort: { dateConfirmed: 1, invitee: -1 },
  }).map((invite: any) => {
    invite.inviteeName = usernames[invite.invitee];
    return invite;
  });
});

subscribe(() => [
  'userPublicProfiles',
  invites.value?.map((i: any) => i.invitee).filter(Boolean) ?? [],
]);

const entitledCents = computed(() => getEntitledCents(user.value));
const tier = computed(() => {
  if (!user.value) return {};
  return getUserTierAsync(user.value);
});

const showApiKey = ref(false);
const signOutBusy = ref(false);
const apiKeyGenerationError = ref<string | null>(null);
const emailVerificationError = ref<string | null>(null);
const linkGoogleError = ref('');
const linkPatreonError = ref('');
const updatePatreonError = ref('');
const updatePatreonLoading = ref(false);
const showEmailInput = ref(false);
const addEmailLoading = ref(false);
const inputEmail = ref('');
const addEmailError = ref<string | undefined>(undefined);
const removeEmailLoading = ref<string | undefined>(undefined);
const removeEmailError = ref<string | undefined>(undefined);

function changeUsername() {
  store.commit('pushDialogStack', {
    component: 'username-dialog',
    elementId: 'username',
  });
}

function clearEmailInput() {
  showEmailInput.value = false;
  addEmailError.value = undefined;
  inputEmail.value = '';
}

async function addEmailAddress() {
  addEmailLoading.value = true;
  try {
    await addEmail.callAsync({ email: inputEmail.value });
    showEmailInput.value = false;
    inputEmail.value = '';
  } catch (error: any) {
    addEmailError.value = error?.message;
  }
  addEmailLoading.value = false;
}

async function removeEmailAddress(address: string) {
  removeEmailLoading.value = address;
  try {
    await removeEmail.callAsync({ email: address });
    removeEmailError.value = undefined;
    showEmailInput.value = false;
    inputEmail.value = '';
  } catch (error: any) {
    removeEmailError.value = error?.message;
  }
  removeEmailLoading.value = undefined;
}

function signOut() {
  Meteor.logout();
  router.push('/');
}

async function setDarkMode(value: string, ack?: (err?: string) => void) {
  let dm: boolean | null;
  if (value === 'true') {
    dm = true;
  } else if (value === 'false') {
    dm = false;
  } else {
    dm = null;
  }
  try {
    await setUserDarkMode.callAsync({ darkMode: dm });
    if (ack) ack();
  } catch (error) {
    if (ack) ack(error.reason || error.message || error);
    else console.error(error);
  }
}

async function swapAbilityScoresAndModifiers(value: any, ack?: (err?: string) => void) {
  try {
    await (Meteor.users as any).setPreference.callAsync({
      preference: 'swapAbilityScoresAndModifiers',
      value: !!value,
    });
    if (ack) ack();
  } catch (error: any) {
    if (ack) ack(error.reason || error.message || error);
    else console.error(error);
  }
}

async function generateKey() {
  try {
    await (Meteor.users as any).gnerateApiKey.callAsync();
  } catch (error: any) {
    apiKeyGenerationError.value = error.reason;
  }
  showApiKey.value = true;
}

async function verifyEmail(email: string) {
  try {
    await sendVerificationEmail.callAsync({ address });
  } catch (error: any) {
    emailVerificationError.value = error.reason;
  }
}

function clickInvite(invite: any) {
  store.commit('pushDialogStack', {
    component: 'invite-dialog',
    elementId: invite._id,
    data: { inviteId: invite._id },
  });
}

function linkWithGoogleAccount() {
  linkGoogleError.value = '';
  Meteor.linkWithGoogle((error: any) => {
    if (error) linkGoogleError.value = error;
  });
}

function linkWithPatreonAccount() {
  linkPatreonError.value = '';
  linkWithPatreon(async (error: any) => {
    if (error) {
      linkPatreonError.value = error;
    } else {
      try {
        await Meteor.callAsync('updateMyPatreonDetails');
      } catch (err: any) {
        linkPatreonError.value = err;
      }
    }
  });
}

async function updatePatreon() {
  updatePatreonLoading.value = true;
  updatePatreonError.value = '';
  try {
    await Meteor.callAsync('updateMyPatreonDetails');
  } catch (error: any) {
    updatePatreonError.value = error;
  }
  updatePatreonLoading.value = false;
}

function deleteAccount() {
  store.commit('pushDialogStack', {
    component: 'delete-user-account-dialog',
    elementId: 'delete-account-btn',
  });
}
</script>

<template>
  <div
    class="d-flex justify-center card-background"
    style="height: 100%;"
  >
    <v-card
      class="ma-4 pa-2"
      style="flex-basis: 900px"
    >
      <v-list>
        <v-list-subheader>
          File storage used
        </v-list-subheader>
        <file-storage-stats />
        <v-list-subheader>
          Character storage used
        </v-list-subheader>
        <v-list-item>
          <v-list-item-title>
            <creature-storage-stats />
          </v-list-item-title>
        </v-list-item>
        <v-list-subheader class="mb-4">
          Preferences
        </v-list-subheader>
        <v-list-item>
          <smart-toggle
            label="Theme"
            :value="darkMode === true ? 'true' : darkMode === false ? 'false' : darkMode === null ? 'unset' : undefined"
            :options="[
              { name: 'Dark', value: 'true', icon: 'mdi-brightness-5' },
              { name: 'Match device theme', value: 'unset' },
              { name: 'Light', value: 'false', icon: 'mdi-brightness-7' },
            ]"
            @change="setDarkMode"
          />
        </v-list-item>
        <v-list-item>
          <smart-switch
            label="Swap ability scores and modifiers"
            :value="user &&
              user.preferences &&
              user.preferences.swapAbilityScoresAndModifiers
            "
            @change="swapAbilityScoresAndModifiers"
          />
        </v-list-item>

        <v-list-subheader>
          Username
        </v-list-subheader>
        <v-list-item data-id="username">
          <template #prepend>
            <v-tooltip location="end">
              <template #activator="{ props }">
                <v-btn
                  icon
                  v-bind="props"
                  @click="changeUsername"
                >
                  <v-icon>mdi-pencil</v-icon>
                </v-btn>
              </template>
              <span>Change Username</span>
            </v-tooltip>
          </template>
          <v-list-item-title>
            {{ user && user.username }}
          </v-list-item-title>
        </v-list-item>

        <v-list-subheader>
          Email
        </v-list-subheader>
        <v-list-item
          v-for="email in emails"
          :key="email.address"
        >
          <template
            v-if="emails.length > 1"
            #prepend
          >
            <v-btn
              icon
              size="small"
              @click="removeEmailAddress(email.address)"
            >
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </template>
          <v-list-item-title>
            {{ email.address }}
          </v-list-item-title>
        </v-list-item>
        <v-expand-transition>
          <v-alert
            v-if="removeEmailError"
            type="error"
          >
            {{ removeEmailError }}
          </v-alert>
        </v-expand-transition>
        <v-slide-x-transition hide-on-leave>
          <v-text-field
            v-if="showEmailInput"
            v-model="inputEmail"
            label="Add Email Address"
            :error-messages="addEmailError"
            variant="outlined"
          >
            <template #prepend>
              <v-btn
                icon
                @click="clearEmailInput"
              >
                <v-icon>mdi-close</v-icon>
              </v-btn>
            </template>
            <template #append>
              <v-btn
                icon
                @click="addEmailAddress"
              >
                <v-icon>mdi-send</v-icon>
              </v-btn>
            </template>
          </v-text-field>
          <v-btn
            v-else-if="!emails || emails.length < 2"
            icon
            @click="showEmailInput = true"
          >
            <v-icon>mdi-plus</v-icon>
          </v-btn>
        </v-slide-x-transition>
        <v-list-subheader>
          Patreon
        </v-list-subheader>
        <v-list-item>
          <template #prepend>
            <v-tooltip location="end">
              <template #activator="{ props }">
                <v-btn
                  icon
                  :loading="updatePatreonLoading"
                  v-bind="props"
                  @click="updatePatreon"
                >
                  <v-icon>mdi-refresh</v-icon>
                </v-btn>
              </template>
              <span>Refresh Patreon status</span>
            </v-tooltip>
          </template>
          <v-list-item-title>
            Tier: {{ tier.name }}
          </v-list-item-title>
        </v-list-item>
        <v-list-item v-if="!user.services.google">
          <v-btn
            color="primary"
            @click="linkWithGoogleAccount"
          >
            Link Google Account
          </v-btn>
        </v-list-item>
        <v-list-item v-if="!user.services.patreon">
          <v-btn
            color="primary"
            @click="linkWithPatreonAccount"
          >
            Link Patreon Account
          </v-btn>
        </v-list-item>
      </v-list>
      <div class="d-flex justify-end">
        <v-btn
          color="accent"
          @click="signOut"
        >
          Sign Out
        </v-btn>
      </div>
      <template v-if="invites.length">
        <v-divider class="mt-3 mb-3" />
        <v-list-subheader>
          <h1>
            Invites
          </h1>
        </v-list-subheader>
        <v-list>
          <template
            v-for="(invite, index) in invites"
            :key="invite._id"
          >
            <v-list-item
              :data-id="invite._id"
              @click="clickInvite(invite)"
            >
              <v-list-item-title>
                {{ invite.inviteeName || invite.invitee || 'Available' }}
              </v-list-item-title>
              <template #append>
                <v-icon>mdi-email-outline</v-icon>
              </template>
            </v-list-item>
            <v-divider />
          </template>
        </v-list>
      </template>
      <div class="d-flex justify-end mt-3">
        <v-btn
          color="error"
          data-id="delete-account-btn"
          @click="deleteAccount"
        >
          Delete Account
        </v-btn>
      </div>
    </v-card>
  </div>
</template>
