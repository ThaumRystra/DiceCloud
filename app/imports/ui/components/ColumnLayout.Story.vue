<template lang="html">
  <column-layout>
		<div v-for="(height, n) in cardHeights" :key="n">
			<v-card :height="height"/>
		</div >
  </column-layout>
</template>

<script>
	import ColumnLayout from "/imports/ui/components/ColumnLayout.vue";
	import { _ } from "meteor/underscore";
	export default {
		dontWrap: true,
		data(){return{
			cardHeights: _.times(12, n => `${_.random(100, 500)}px`),
		}},
		components: {
			ColumnLayout,
		},
	};
</script>

<style lang="css" scoped>
</style>
