<template lang="html">
  <dialog-base>
    <template #toolbar>
      <v-toolbar-title>
        Invite
      </v-toolbar-title>
    </template>
    <div
      v-if="invite.invitee"
      class="d-flex flex-column align-center"
    >
      {{ username || invite.invitee }}
      <div>
        <v-btn
          color="primary"
          @click="revokeInvite"
        >
          Revoke Invite
        </v-btn>
      </div>
    </div>
    <div
      v-else
      class="d-flex flex-column align-center"
    >
      <p>This invite is available</p>
      <v-fade-transition mode="out-in">
        <v-btn
          v-if="!inviteLink"
          color="primary"
          :loading="loading"
          :disabled="loading"
          @click="getInviteLink"
        >
          Get Invite Link
        </v-btn>
        <h3 v-else>
          {{ inviteLink }}
        </h3>
      </v-fade-transition>
    </div>
  </dialog-base>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { autorun } from 'vue-meteor-tracker';
import DialogBase from '/imports/client/ui/dialogStack/DialogBase.vue';
import Invites, { getInviteToken, revokeInvite } from '/imports/api/users/Invites';

const props = defineProps<{
  inviteId: string;
}>();

const inviteToken = ref('');
const error = ref('');
const loading = ref(false);

const { result: invite } = autorun(() => Invites.findOne(props.inviteId));
const { result: username } = autorun(() => {
  if (!invite.value) return undefined;
  const user = Meteor.users.findOne((invite.value as any).invitee);
  return user && user.username;
});

const inviteLink = computed(() => {
  const token = inviteToken.value;
  return token && `https://dicecloud.com/invite/${token}`;
});

async function getInviteLink() {
  loading.value = true;
  try {
    const result = await getInviteToken.callAsync({ inviteId: props.inviteId });
    loading.value = false;
    error.value = '';
    inviteToken.value = result;
  } catch (e: any) {
    loading.value = false;
    error.value = e.message || e;
  }
}

function revokeInviteFn() {
  revokeInvite.callAsync({ inviteId: props.inviteId });
}
</script>

<style lang="css" scoped>

</style>
