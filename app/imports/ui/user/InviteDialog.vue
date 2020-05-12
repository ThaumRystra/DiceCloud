<template lang="html">
  <dialog-base>
    <template slot="toolbar">
      <v-toolbar-title>
        Invite
      </v-toolbar-title>
    </template>
    <div
      v-if="invite.invitee"
      class="layout column align-center"
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
      class="layout column align-center"
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

<script>
import DialogBase from '/imports/ui/dialogStack/DialogBase.vue';
import Invites, { getInviteToken, revokeInvite } from '/imports/api/users/Invites.js';

export default {
	components: {
		DialogBase,
	},
  props: {
    inviteId: {
      type: String,
      required: true,
    },
  },
  data(){return  {
    inviteToken: '',
    error: '',
    loading: false,
  }},
  meteor: {
    invite(){
      return Invites.findOne(this.inviteId);
    },
    username(){
      if (!this.invite) return;
      let user = Meteor.users.findOne(this.invite.invitee);
      return user && user.username;
    }
  },
  computed: {
    inviteLink(){
      let token = this.inviteToken;
      return token && `https://beta.dicecloud.com/invite/${token}`;
    },
  },
  methods: {
    getInviteLink(){
      this.loading = true;
      getInviteToken.call({inviteId: this.inviteId}, (error, result) => {
        this.loading = false;
        if (error){
          this.error = error.message || error;
        } else {
          this.error = '',
          this.inviteToken = result;
        }
      });
    },
    revokeInvite(){
      revokeInvite.call({inviteId: this.inviteId});
    },
  },
}
</script>

<style lang="css" scoped>
</style>
