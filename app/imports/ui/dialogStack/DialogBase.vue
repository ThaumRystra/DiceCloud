<template>
  <v-card>
		<v-layout column style="height: 100%;">
	    <v-toolbar color="primary" dark class="base-dialog-toolbar" :flat="!offsetTop">
	      <slot name="toolbar"></slot>
	    </v-toolbar>
			<div id="base-dialog-body" v-scroll:#base-dialog-body="onScroll">
				<slot></slot>
			</div>
			<v-card-actions>
				<slot name="actions"></slot>
			</v-card-actions>
		</v-layout>
  </v-card>
</template>

<script>
	export default {
		data(){ return {
			offsetTop: 0,
		}},
		methods: {
			onScroll(e){
				this.offsetTop = e.target.scrollTop
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
