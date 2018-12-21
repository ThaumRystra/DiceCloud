<template>
	<div>
    <v-toolbar app color="primary" dark>
      <v-btn v-if="showMenuButton" flat icon @click="toggleDrawer">
        <v-icon>menu</v-icon>
      </v-btn>
			<span>{{character.name}}</span>
    </v-toolbar>
    <v-content v-if="$subReady.singleCharacter">
			{{character}}
    </v-content>
		<v-content v-else>
			<v-progress-circular indeterminate />
		</v-content>
  </div>
</template>

<script>
	import Creatures from '/imports/api/creature/Creatures.js';
	import { mapMutations } from "vuex";

	export default {
		props: {
			showMenuButton: Boolean,
			charId: String,
		},
		methods: {
      ...mapMutations([
        "toggleDrawer",
      ]),
    },
		meteor: {
			$subscribe: {
	      'singleCharacter': [this.charId],
			},
			character(){
				return Creatures.findOne(this.charId);
			},
		},
	}
</script>

<style scoped>

</style>
