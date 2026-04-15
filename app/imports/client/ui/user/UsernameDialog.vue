<script setup lang="ts">
import { ref } from 'vue';
import { useStore } from 'vuex';
import { autorun } from 'vue-meteor-tracker';
import DialogBase from '/imports/client/ui/dialogStack/DialogBase.vue';
import { key } from '/imports/client/ui/vuexStore';
import { canPickUsername, setUsername } from '/imports/api/users/Users';
import errorToString from '/imports/api/utility/errorToString';

const store = useStore(key);

const valid = ref(true);
const newUsername = ref<string | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);

const { result: username } = autorun(() => {
  const user = Meteor.user();
  return user && user.username;
});

async function change(username: string, ack: (error?: unknown) => void) {
  loading.value = true;
  try {
    const result = await canPickUsername.callAsync({ username });
    loading.value = false;
    if (result) {
      valid.value = false;
      ack('Username is already taken');
    } else {
      valid.value = true;
      newUsername.value = username;
      ack();
    }
  } catch (e) {
    loading.value = false;
    valid.value = false;
    ack(e);
  }
}

async function updateUsername() {
  if (!newUsername.value) return;
  loading.value = true;
  try {
    await setUsername.callAsync({ username: newUsername.value });
    loading.value = false;
    await store.dispatch('popDialogStack');
  } catch (e) {
    loading.value = false;
    error.value = errorToString(e);
  }
}
</script>

<template lang="html">
  <dialog-base>
    <text-field
      label="Username"
      :value="newUsername || username"
      @change="change"
    />
    <div
      v-if="error"
      class="bg-error"
    >
      {{ error }}
    </div>
    <template #actions>
      <v-spacer />
      <v-btn
        variant="text"
        :disabled="!valid"
        :loading="loading"
        @click="updateUsername"
      >
        Update
      </v-btn>
    </template>
  </dialog-base>
</template>

<style lang="css" scoped></style>
