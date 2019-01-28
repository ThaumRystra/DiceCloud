<template lang="html">
	<toolbar-layout>
    <div slot="toolbar">
      DiceCloud
    </div>
    <div class="content">
			<v-card class="ma-4">
				<v-card-text>
					<v-layout column align-center>
						<upload-btn
						:fileChangedCallback="fileChanged"
						/>
						<v-text-field
	            label="Search"
							@click:append="updateSearchString"
							@keydown.enter="updateSearchString"
							ref="iconSearchField"
							append-icon="search"
	          />
						<v-container grid-list-md fill-height>
							<v-layout row wrap>
								<v-flex xs3 md2 xl1 v-for="icon in icons" :key="icon._id._str || icon._id">
									<v-card>
										<v-card-title class="title">{{icon.name}}</v-card-title>
										<v-card-text>
											<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="#000" :d="icon.shape"/></svg>
										</v-card-text>
									</v-card>
								</v-flex>
							</v-layout>
						</v-container>
					</v-layout>
				</v-card-text>
			</v-card>
		</div>
	</toolbar-layout>
</template>

<script>
	import UploadButton from 'vuetify-upload-button';
	import ToolbarLayout from "/imports/ui/layouts/ToolbarLayout.vue";
	import importIcons from '/imports/ui/icons/importIcons.js';
	import Icons from '/imports/api/icons/Icons.js';
	import { _ } from 'meteor/underscore';

	export default {
		data(){ return {
			searchString: '',
		}},
		methods: {
      fileChanged (file) {
				importIcons(file);
      },
			updateSearchString(){
				this.searchString = this.$refs.iconSearchField.internalValue;
			},
    },
		components: {
      ToolbarLayout,
      'upload-btn': UploadButton
    },
		meteor: {
			$subscribe: {
				searchIcons() {
					return [this.searchString];
				},
			},
			icons(){
				return Icons.find({}, { sort: [["score", "desc"]] });
			},
		},
	};
</script>

<style lang="css" scoped>
  svg {
  	height: 64px;
		width: 64px;
  }
	.v-card {
		height: 100%;
	}
</style>
