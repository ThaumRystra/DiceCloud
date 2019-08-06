<template lang="html">
	<div class="class-level-viewer">
		<div>
			<span class="name headline">
				{{model.name}}
			</span>
			<span
				class="display-2"
				v-if="model.level"
			>
				{{model.level}}
			</span>
		</div>
		<p class="my-2">
			<code>{{model.variableName}}</code>
		</p>
		<p class="my-2" v-if="model.baseClass">
			Base class: <code>{{model.baseClass}}</code>
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
