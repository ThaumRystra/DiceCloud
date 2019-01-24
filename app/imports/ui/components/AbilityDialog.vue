<template lang="html">
	<dialog-base>
    <div slot="toolbar">
      {{name}}
    </div>
    <v-layout align-center>
			<div class="display-1 modifier">
				{{numberToSignedString(modifier)}}
			</div>
			<div class="title score">
				{{score}}
			</div>
		</v-layout>
  </dialog-base>
</template>

<script>
	import store from "/imports/ui/vuexStore.js";
	import DialogBase from "/imports/ui/dialogStack/DialogBase.vue";
	import numberToSignedString from '/imports/ui/utility/numberToSignedString.js';

	export default {
		props: {
			name: String,
			score: Number,
			modifier: Number,
		},
		methods: {
			numberToSignedString,
		},
		components: {
			DialogBase,
		},
	}
</script>

<style lang="css" scoped>
	.score {
		font-weight: 600;
		font-size: 24px !important;
		color: rgba(0, 0, 0, 0.54);
	}
	.modifier, .score {
		text-align: center;
		width: 100%;
	}
</style>
