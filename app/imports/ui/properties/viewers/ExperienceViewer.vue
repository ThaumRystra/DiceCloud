<template lang="html">
	<div class="experience-viewer">
		<div class="display-1" v-if="model.value">
			{{model.value}} XP
		</div>
		<div class="headline layout row mb-3">
			<property-name :value="model.name"/>
			<v-spacer/>
			<div>
				{{model.worldDate}}
			</div>
		</div>
		<p>
			{{model.date}}
		</p>
		<p v-if="model.description">
			{{model.description}}
		</p>
	</div>
</template>

<script>
import propertyViewerMixin from '/imports/ui/properties/viewers/shared/propertyViewerMixin.js'
export default {
	mixins: [propertyViewerMixin],
}
</script>

<style lang="css" scoped>
</style>
