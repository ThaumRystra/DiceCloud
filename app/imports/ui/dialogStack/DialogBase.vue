<template>
	<v-layout column style="height: 100%;">
    <v-toolbar :color="color || 'secondary'" dark class="base-dialog-toolbar" :flat="!offsetTop">
			<v-btn icon flat @click="close">
				<v-icon>arrow_back</v-icon>
			</v-btn>
      <slot name="toolbar"></slot>
			<template v-if="$slots.edit">
				<v-spacer/>
				<v-btn icon flat @click="() => $emit('delete')" v-if="isEditing">
					<v-icon>delete</v-icon>
				</v-btn>
				<v-btn icon flat @click="isEditing = !isEditing">
					<v-icon>{{isEditing ? 'check' : 'create'}}</v-icon>
				</v-btn>
			</template>
    </v-toolbar>
		<v-card-text id="base-dialog-body" v-scroll:#base-dialog-body="onScroll">
			<v-tabs-items :value="isEditing ? 1 : 0" touchless>
				<v-tab-item>
					<slot/>
				</v-tab-item>
				<v-tab-item lazy>
					<slot name="edit"/>
				</v-tab-item>
			</v-tabs-items>
		</v-card-text>
		<v-card-actions>
			<slot name="actions"></slot>
		</v-card-actions>
	</v-layout>
</template>

<script>
	import store from "/imports/ui/vuexStore.js";

	export default {
		props: {
			color: String,
		},
		data(){ return {
			offsetTop: 0,
			isEditing: false,
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
