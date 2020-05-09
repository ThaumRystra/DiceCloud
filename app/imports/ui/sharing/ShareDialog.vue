<template lang="html">
  <dialog-base>
    <div slot="toolbar">
      Sharing
    </div>
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
      <div class="layout row">
        <text-field
          label="Username or email"
          :value="userSearched"
          :debounce-time="300"
          @change="(value, ack) => getUser({value, ack})"
        />
        <v-btn :disabled="userFoundState !== 'found'">
          Share
        </v-btn>
      </div>
      <div class="sharedWith">
        <h3 v-if="writers.length">
          Can Edit
        </h3>
        <div
          v-for="user in writers"
          :key="user._id"
        >
          {{ user }}
          <v-btn
            flat
            icon
          >
            <v-icon>delete</v-icon>
          </v-btn>
        </div>
        <h3 v-if="readers.length">
          Can View
        </h3>
        <div
          v-for="user in readers"
          :key="user._id"
        >
          {{ user }}
          <v-btn
            flat
            icon
          >
            <v-icon>delete</v-icon>
          </v-btn>
        </div>
      </div>
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
import { setPublic } from '/imports/api/sharing/sharing.js';
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
				public: value === 'true',
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
	},
	meteor: {
		model(){
			if (!this.docRef || !this.docRef.id) return;
			let model = fetchDocByRef(this.docRef);
			return model;
		},
		readers(){
			if (this.model){
				return Meteor.users.find({_id: {$in: this.model.readers}})
			}
		},
		writers(){
			if (this.model){
				return Meteor.users.find({_id: {$in: this.model.writers}})
			}
		},
		$subscribe: {
			'userPublicProfiles'(){
				let model = this.model;
				if (!model) return false;
				return [model.owner, ...model.writers, ...model.readers];
			},
		},
	},
}
</script>

<style lang="css" scoped>
</style>
