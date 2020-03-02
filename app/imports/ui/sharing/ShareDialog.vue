<template lang="html">
  <dialog-base>
  	<div slot="toolbar">
  		Sharing {{name}}
  	</div>
		<div>
			<smart-select
				label="Who can view"
				:items="[
					{text: 'Only people I share with', value: false},
					{text: 'Anyone with link', value: true}
				]"
				:value="model.public"
				:error-messages="errors.public"
				@change="(value, ack) => setSheetPublic({value, ack}))"
			/>
			<div class="layout row">
				<text-field
				label="Username or email"
				@change="(value, ack) => getUser({value, ack})"
				:debounceTime="300"
				/>
				<v-btn :disabled="userFoundState !== found">
					Share
				</v-btn>
			</div>
			<div class="sharedWith">
				<h3>Can Edit</h3>
					<div v-for="userId in model.writers">
						{{username(userId)}}
						<v-btn flat icon>
							<v-icon>delete</v-icon>
						</v-btn>
					</div>
				<h3>Can View</h3>
					<div v-for="userId in model.readers">
						{{username(userId)}}
						<v-btn flat icon>
							<v-icon>delete</v-icon>
						</v-btn>
					</div>
			</div>
		</div>
  </dialog-base>
</template>

<script>
import fetchDocByRef from '/imports/api/parenting/fetchDocByRef.js';
import DialogBase from '/imports/ui/dialogStack/DialogBase.vue';
export default {
	components: {
		DialogBase,
	},
	data(){
		userFoundState: 'idle',
		userId: undefined,
	},
	props: {
		ref: Object,
	},
	methods: {
		getUser({value, ack}){
			Meteor.users.findUserByUsernameOrEmail.call({
				usernameOrEmail: value
			}, (error, result) => {
				if (error) {
					ack(error && error.reason || error);
					this.userFoundState = 'failed';
				} else {
					this.userId = result;
					if (result){
						this.userFoundState = 'found';
						ack();
					} else {
						this.userFoundState = 'notFound';
						ack('User not found');
					}
				}
			});
		},
	},
	meteor: {
		model: {
			return fetchDocByRef(this.ref);
		},
		username(userId){
			let user = Meteor.users.findOne(userId);
			return user && user.username;
		},
		$subscribe: {
			'userPublicProfiles'(){
				return [...this.model.writers, ...this.model.readers];
			},
		},
	},
}
</script>

<style lang="css" scoped>
</style>
