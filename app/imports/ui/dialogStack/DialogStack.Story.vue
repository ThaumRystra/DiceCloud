<template lang="html">
	<v-card-text>
		<v-layout align-center justify-center>
			<v-btn @click="openDialog('btn')" data-id="btn">
				Open Dialog
			</v-btn>
		</v-layout>
	</v-card-text>
</template>

<script>
	import DialogBaseStory from '/imports/ui/dialogStack/DialogBase.Story.vue';
	export default {
		methods: {
			openDialog(elementId){
				this.$store.commit("pushDialogStack", {
					// DO NOT store your component in the store like this outside the storybook
					// You should register the dialog component in DialogComponentIndex.js
					// and commit it to the store as a string: "dialog-base-story"
					component: DialogBaseStory,
					elementId,
				});
			}
		},
	}
</script>
