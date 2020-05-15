<template lang="html">
  <dialog-base>
    <v-toolbar-title slot="toolbar">
      Sharing
    </v-toolbar-title>
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
      <text-field
        v-if="model.public && docRef.collection === 'libraries'"
        disabled
        label="Link"
        :value="'https://beta.dicecloud.com' + this.$router.resolve({
          name: 'singleLibrary',
          params: { id: model._id },
        }).href"
      />
      <div class="layout row">
        <text-field
          label="Username or email"
          :value="userSearched"
          :debounce-time="300"
          @change="(value, ack) => getUser({value, ack})"
        />
        <v-btn
          :disabled="userFoundState !== 'found'"
          @click="updateSharing(userId, 'reader')"
        >
          Share
        </v-btn>
      </div>
      <v-list
        two-lines
        class="sharedWith"
      >
        <v-list-tile
          v-for="user in sharedUsers"
          :key="user._id"
        >
          <v-list-tile-content>
            <v-list-tile-title>
              {{ user.username || user._id }}
            </v-list-tile-title>
            <v-list-tile-sub-title>
              {{ user.permission === 'writer' ? 'Can edit' : 'Can view' }}
            </v-list-tile-sub-title>
          </v-list-tile-content>
          <v-list-tile-action>
            <v-menu
              bottom
              left
            >
              <template #activator="{ on }">
                <v-btn
                  icon
                  v-on="on"
                >
                  <v-icon>more_vert</v-icon>
                </v-btn>
              </template>
              <v-list>
                <v-list-tile
                  v-if="user.permission === 'reader'"
                  @click="updateSharing(user._id, 'writer')"
                >
                  <v-list-tile-action>
                    <v-icon>create</v-icon>
                  </v-list-tile-action>
                  <v-list-tile-title>Can edit</v-list-tile-title>
                </v-list-tile>
                <v-list-tile
                  v-if="user.permission === 'writer'"
                  @click="updateSharing(user._id, 'reader')"
                >
                  <v-list-tile-action>
                    <v-icon>remove_red_eye</v-icon>
                  </v-list-tile-action>
                  <v-list-tile-title>View only</v-list-tile-title>
                </v-list-tile>
                <v-list-tile @click="updateSharing(user._id, 'none')">
                  <v-list-tile-action>
                    <v-icon>delete</v-icon>
                  </v-list-tile-action>
                  <v-list-tile-title>Remove</v-list-tile-title>
                </v-list-tile>
              </v-list>
            </v-menu>
          </v-list-tile-action>
        </v-list-tile>
      </v-list>
      <v-fade-transition>
        <v-progress-circular
          v-if="!$subReady.userPublicProfiles"
          indeterminate
        />
      </v-fade-transition>
    </div>
    <v-spacer slot="actions" />
    <v-btn
      slot="actions"
      flat
      @click="$store.dispatch('popDialogStack')"
    >
      Done
    </v-btn>
  </dialog-base>
</template>

<script>
import {
  setPublic,
  updateUserSharePermissions
} from '/imports/api/sharing/sharing.js';
import fetchDocByRef from '/imports/api/parenting/fetchDocByRef.js';
import DialogBase from '/imports/ui/dialogStack/DialogBase.vue';

export default {
	components: {
		DialogBase,
	},
	props: {
		docRef: {
      type: Object,
      required: true,
    },
	},
	data(){ return {
		userSearched: undefined,
		userFoundState: 'idle',
		userId: undefined,
	}},
	methods: {
		setSheetPublic({value, ack}){
			setPublic.call({
				docRef: this.docRef,
				isPublic: value === 'true',
			}, (error) => {
				ack(error && error.reason || error);
			});
		},
		getUser({value, ack}){
			this.userSearched = value;
			if (!value){
				this.userFoundState = 'idle';
				ack();
				return;
			}
			Meteor.users.findUserByUsernameOrEmail.call({
				usernameOrEmail: value
			}, (error, result) => {
				if (error) {
					ack(error && error.reason || error);
					this.userFoundState = 'failed';
				} else {
					this.userId = result;
					if (result){
						if (result === this.model.owner){
							this.userFoundState = 'failed';
							ack('User is already the owner')
						} else {
							this.userFoundState = 'found';
							ack();
						}
					} else {
						this.userFoundState = 'notFound';
						ack('User not found');
					}
				}
			});
		},
    updateSharing(userId, role){
      updateUserSharePermissions.call({
        docRef: this.docRef,
        userId,
        role,
      });
    },
	},
	meteor: {
		model(){
			if (!this.docRef || !this.docRef.id) return;
			let model = fetchDocByRef(this.docRef);
			return model;
		},
    sharedUsers(){
      let users = [];
      Meteor.users.find({_id: {$in: this.model.readers}}).forEach(user => {
        user.permission = 'reader';
        users.push(user);
      });
      Meteor.users.find({_id: {$in: this.model.writers}}).forEach(user => {
        user.permission = 'writer';
        users.push(user);
      });
      users.sort(function(a, b){
        if (a.username < b.username) return -1;
        if (a.username > b.username) return 1;
        return 0;
      });
      return users;
    },
		$subscribe: {
			'userPublicProfiles'(){
				let model = this.model;
				if (!model) return false;
				return [[model.owner, ...model.writers, ...model.readers]];
			},
		},
	},
}
</script>

<style lang="css" scoped>
</style>
