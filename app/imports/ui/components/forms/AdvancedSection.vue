<template lang="html">
	<v-expansion-panel popout>
		<v-expansion-panel-content>
			<div slot="header" class="subheading">
				Advanced
			</div>
			<v-card-text>
				<slot/>
			</v-card-text>
		</v-expansion-panel-content>
	</v-expansion-panel>
</template>

<script>
export default {
}
</script>

<style lang="css" scoped>
</style>
