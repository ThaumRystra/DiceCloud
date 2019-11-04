<template>
	<v-layout column style="height: 100%;">
    <v-toolbar :color="color || 'secondary'" dark class="base-dialog-toolbar" :flat="!offsetTop">
			<v-btn icon flat @click="back">
				<v-icon>arrow_back</v-icon>
			</v-btn>
      <slot name="toolbar"/>
			<template v-if="$slots.edit">
				<v-spacer/>
				<v-btn icon flat @click="$emit('remove')" v-if="isEditing">
					<v-icon>delete</v-icon>
				</v-btn>
				<v-btn icon flat @click="isEditing = !isEditing">
					<v-icon>{{isEditing ? 'check' : 'create'}}</v-icon>
				</v-btn>
			</template>
    </v-toolbar>
		<template v-if="breadcrumbs">
			<v-card-text>
				example > bread > crumb
			</v-card-text>
		</template>
		<div
			v-if="$slots['unwrapped-content']"
			class="unwrapped-content"
		>
			<slot name="unwrapped-content"/>
		</div>
		<v-card-text
			v-if="!$slots['unwrapped-content']"
			id="base-dialog-body"
			v-scroll:#base-dialog-body="onScroll"
		>
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
			<slot name="actions"/>
		</v-card-actions>
	</v-layout>
</template>

<script>
	import store from "/imports/ui/vuexStore.js";

	export default {
		props: {
			color: String,
			breadcrumbs: Object,
			overrideBackButton: Function,
		},
		data(){ return {
			offsetTop: 0,
			isEditing: false,
		}},
		methods: {
			onScroll(e){
				this.offsetTop = e.target.scrollTop
			},
			back(){
				if (this.overrideBackButton){
					this.overrideBackButton();
				} else {
					this.close();
				}
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
	#base-dialog-body, .unwrapped-content {
		flex-grow: 1;
		overflow: auto;
	}
</style>
