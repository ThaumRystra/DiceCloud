<template lang="html">
	<v-autocomplete
		v-model="model"
		:search-input.sync="searchString"
		:items="items"
		:loading="!$subReady.searchIcons || isLoading"
		item-text="name"
		item-value="_id"
		label="Search icons"
		hide-no-data
		@input="input"
	>
		<template
			slot="item"
			slot-scope="{ item, tile }"
		>
			<v-list-tile-avatar>
				<svg class="avatar" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path :d="item.shape"/></svg>
			</v-list-tile-avatar>
			<v-list-tile-content>
				<v-list-tile-title v-text="item.name"></v-list-tile-title>
			</v-list-tile-content>
		</template>
	</v-autocomplete>
</template>

<script>
import Icons from '/imports/api/icons/Icons.js';

export default {
	data(){ return {
		model: this.value,
		searchString: null,
		serverSearchString: null,
		isLoading: false,
	}},
	props: {
		value: String,
	},
	watch: {
		searchString(string){
			this.isLoading = true;
			this.searchServer(string)
		},
		value(newValue){
			this.model = newValue;
		},
	},
	methods: {
		searchServer: _.debounce(function(string){
			this.serverSearchString = string;
		}, 200),
		input(e){
			this.$emit('input', e);
		}
	},
	meteor: {
		$subscribe: {
			searchIcons() {
				this.isLoading = false;
				return [this.serverSearchString];
			},
		},
		items(){
			return Icons.find({}, { sort: [['score', 'desc']] }).fetch();
		},
	},
}
</script>

<style lang="css" scoped>
	.avatar {
		width: 100%;
		height: 100%;
	}
	.theme--dark .avatar {
		fill: white;
	}
</style>
