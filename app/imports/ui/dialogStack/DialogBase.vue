<template>
	<v-layout column style="height: 100%;">
    <v-toolbar color="primary" dark class="base-dialog-toolbar" :flat="!offsetTop">
			<v-btn icon flat @click="close">
				<v-icon>
					arrow_back
				</v-icon>
			</v-btn>
      <slot name="toolbar"></slot>
    </v-toolbar>
		<v-card-text id="base-dialog-body" v-scroll:#base-dialog-body="onScroll">
			<slot></slot>
		</v-card-text>
		<v-card-actions>
			<slot name="actions"></slot>
		</v-card-actions>
	</v-layout>
</template>

<script>
	import store from "/imports/ui/vuexStore.js";

	export default {
		data(){ return {
			offsetTop: 0,
		}},
		methods: {
			onScroll(e){
				this.offsetTop = e.target.scrollTop
			},
			close(){
        store.dispatch("popDialogStack");
      },
		},
	}
</script>

<style scoped>
	.base-dialog-toolbar {
		z-index: 1;
		border-radius: 2px 2px 0 0;
	}
	#base-dialog-body {
		flex-grow: 1;
		overflow: auto;
	}
</style>
