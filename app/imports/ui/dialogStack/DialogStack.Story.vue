<template lang="html">
	<v-card-text>
		<v-layout align-center justify-center>
			<v-btn @click="openDialog(_uid + 'btn')" :id="_uid + 'btn'"/>
		</v-layout>
	</v-card-text>
</template>

<script>
	import DialogBaseStory from '/imports/ui/dialogStack/DialogBase.Story.vue';
  import store from "/imports/ui/vuexStore.js";
	export default {
		methods: {
			openDialog(elementId){
				store.commit("pushDialogStack", {
					component: DialogBaseStory,
					elementId,
				});
			}
		},
	}
</script>
