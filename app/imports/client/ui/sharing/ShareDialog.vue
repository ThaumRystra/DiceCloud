<template lang="html">
  <dialog-base>
    <template #toolbar>
      <v-toolbar-title>
        Sharing
      </v-toolbar-title>
    </template>
    <div v-if="model">
      <smart-select
        label="Who can view"
        :items="[
          {text: 'Only people I share with', value: 'false'},
          {text: 'Anyone with link', value: 'true'}
        ]"
        :value="!!model.public + ''"
        @change="(value, ack) => setSheetPublic({value, ack})"
      />
      <smart-select
        v-if="docRef.collection === 'libraries'"
        label="Who can copy from this library"
        :items="[
          {text: 'Only people with edit permission', value: 'false'},
          {text: 'Anyone with read permission', value: 'true'}
        ]"
        :value="!!model.readersCanCopy + ''"
        @change="(value, ack) => setReadersCanCopy({value, ack})"
      />
      <text-field
        v-if="model.public && docRef.collection === 'libraries'"
        readonly
        label="Link"
        :value="window.location.origin + $router.resolve({
          name: 'singleLibrary',
          params: { id: model._id },
        }).href"
      />
      <div class="layout">
        <text-field
          label="Username or email"
          :value="userSearched"
          :debounce-time="300"
          @change="(value, ack) => getUser({value, ack})"
        />
        <v-btn
          class="ml-2 mt-2"
          :disabled="userFoundState !== 'found'"
          @click="updateSharing(userId, 'reader')"
        >
          Share
        </v-btn>
      </div>
      <v-list
        class="sharedWith"
      >
        <v-list-item
          v-for="user in sharedUsers"
          :key="user._id"
        >
          <v-list-item-title>
            {{ user.username || user._id }}
          </v-list-item-title>
          <v-list-item-subtitle>
            {{ user.permission === 'writer' ? 'Can edit' : 'Can view' }}
          </v-list-item-subtitle>
          <template #append>
            <v-menu
              bottom
              left
              :data-id="'menu-' + user._id"
            >
              <template #activator="{ props }">
                <v-btn
                  icon
                  v-bind="props"
                >
                  <v-icon>mdi-dots-vertical</v-icon>
                </v-btn>
              </template>
              <v-list>
                <v-list-item
                  v-if="user.permission === 'reader'"
                  @click="updateSharing(user._id, 'writer')"
                >
                  <template #prepend>
                    <v-icon>mdi-pencil</v-icon>
                  </template>
                  <v-list-item-title>Can edit</v-list-item-title>
                </v-list-item>
                <v-list-item
                  v-if="user.permission === 'writer'"
                  @click="updateSharing(user._id, 'reader')"
                >
                  <template #prepend>
                    <v-icon>mdi-eye</v-icon>
                  </template>
                  <v-list-item-title>View only</v-list-item-title>
                </v-list-item>
                <v-list-item
                  v-if="user.permission === 'writer'"
                  @click="makeOwner(user)"
                >
                  <template #prepend>
                    <v-icon>mdi-signature</v-icon>
                  </template>
                  <v-list-item-title>Transfer Ownership</v-list-item-title>
                </v-list-item>
                <v-list-item @click="updateSharing(user._id, 'none')">
                  <template #prepend>
                    <v-icon>mdi-delete</v-icon>
                  </template>
                  <v-list-item-title>Remove</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </template>
        </v-list-item>
      </v-list>
      <v-fade-transition>
        <v-progress-circular
          v-if="!$subReady.userPublicProfiles"
          indeterminate
        />
      </v-fade-transition>
    </div>
    <template #actions>
      <v-spacer />
      <v-btn
        variant="text"
        @click="$store.dispatch('popDialogStack')"
      >
        Done
      </v-btn>
    </template>
  </dialog-base>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useStore } from 'vuex';
import { autorun } from 'vue-meteor-tracker';
import {
  setPublic,
  setReadersCanCopy,
  updateUserSharePermissions,
} from '/imports/api/sharing/sharing';
import { fetchDocByRef } from '/imports/api/parenting/parentingFunctions';
import DialogBase from '/imports/client/ui/dialogStack/DialogBase.vue';

const props = defineProps<{
  docRef: any;
}>();

const store = useStore();
const userSearched = ref<string | undefined>(undefined);
const userFoundState = ref<'idle' | 'found' | 'notFound' | 'failed'>('idle');
const userId = ref<string | undefined>(undefined);

const { result: model } = autorun(() => {
  if (!props.docRef || !props.docRef.id) return undefined;
  return fetchDocByRef(props.docRef);
});

autorun(() => {
  if (!model.value) return;
  const m = model.value as any;
  Meteor.subscribe('userPublicProfiles', [m.owner, ...m.writers, ...m.readers]);
});

const { result: sharedUsers } = autorun(() => {
  if (!model.value) return [];
  const m = model.value as any;
  const users: any[] = [];
  Meteor.users.find({ _id: { $in: m.readers } }).forEach((user: any) => {
    user.permission = 'reader';
    users.push(user);
  });
  Meteor.users.find({ _id: { $in: m.writers } }).forEach((user: any) => {
    user.permission = 'writer';
    users.push(user);
  });
  users.sort((a, b) => {
    if (a.username < b.username) return -1;
    if (a.username > b.username) return 1;
    return 0;
  });
  return users;
});

async function setSheetPublic({ value, ack }: { value: string; ack: Function }) {
  try {
    await setPublic.callAsync({
      docRef: props.docRef,
      isPublic: value === 'true',
    });
    ack();
  } catch (error: any) {
    ack(error.reason || error);
  }
}

async function setReadersCanCopyFn({ value, ack }: { value: string; ack: Function }) {
  try {
    await setReadersCanCopy.callAsync({
      docRef: props.docRef,
      readersCanCopy: value === 'true',
    });
    ack();
  } catch (error: any) {
    ack(error.reason || error);
  }
}

async function getUser({ value, ack }: { value: string; ack: Function }) {
  userSearched.value = value;
  if (!value) {
    userFoundState.value = 'idle';
    ack();
    return;
  }
  try {
    const result = await Meteor.users.findUserByUsernameOrEmail.callAsync({
      usernameOrEmail: value,
    });
    userId.value = result;
    if (result) {
      if (result === (model.value as any)?.owner) {
        userFoundState.value = 'failed';
        ack('User is already the owner');
      } else {
        userFoundState.value = 'found';
        ack();
      }
    } else {
      userFoundState.value = 'notFound';
      ack('User not found');
    }
  } catch (error: any) {
    ack(error.reason || error);
    userFoundState.value = 'failed';
  }
}

function updateSharing(uid: string, role: string) {
  updateUserSharePermissions.callAsync({
    docRef: props.docRef,
    userId: uid,
    role,
  });
}

function makeOwner(user: any) {
  store.commit('pushDialogStack', {
    component: 'transfer-ownership-dialog',
    elementId: 'menu-' + user._id,
    data: {
      docRef: props.docRef,
      user,
    },
  });
}
</script>

<style lang="css" scoped>

</style>
