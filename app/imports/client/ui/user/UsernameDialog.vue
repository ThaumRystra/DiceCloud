<template lang="html">
  <dialog-base>
    <text-field
      :label="$t('Account.xdRICWNnL1zKFqlLV1YVe')"
      :value="newUsername || username"
      @change="change"
    />
    <div
      v-if="error"
      class="error"
    >
      {{ error }}
    </div>
    <v-spacer slot="actions" />
    <v-btn
      slot="actions"
      text
      :disabled="!valid"
      :loading="loading"
      @click="setUsername"
    >
      {{ $t('UsernameDialog.qTiHg5L8sTSGffTVEsQRA') }}
    </v-btn>
  </dialog-base>
</template>

<script lang="js">
import DialogBase from '/imports/client/ui/dialogStack/DialogBase.vue';

export default {
  components: {
    DialogBase,
  },
  data(){return {
    valid: true,
    newUsername: null,
    updatingUsername: false,
    error: null,
    loading: false,
  };},
  meteor:{
    username(){
      let user = Meteor.user();
      return user && user.username;
    },
  },
  methods: {
    change(username, ack){
      this.loading = true;
      Meteor.users.canPickUsername.call({username}, (error, result) => {
        this.loading = false;
        if (error){
          this.valid = false;
          ack(error.message || error);
        } else if (result){
          this.valid = false;
          ack(this.$t('UsernameDialog.e4NTr9gj8vs5TyzUzxsP0'));
        } else {
          this.valid = true;
          this.newUsername = username;
          ack();
        }
      });
    },
    setUsername(){
      this.loading = true;
      Meteor.users.setUsername.call({username: this.newUsername}, error => {
        this.loading = false;
        if (error){
          this.error = error.message || error;
        } else {
          this.$store.dispatch('popDialogStack')
        }
      });
    }
  }
}
</script>

<style lang="css" scoped>
</style>
