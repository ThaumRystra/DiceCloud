<template lang="html">
  <dialog-base>
    <text-field
      label="Username"
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
      flat
      :disabled="!valid"
      :loading="loading"
      @click="setUsername"
    >
      Update
    </v-btn>
  </dialog-base>
</template>

<script>
import DialogBase from '/imports/ui/dialogStack/DialogBase.vue';

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
          ack('Username is already taken');
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
