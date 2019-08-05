<template lang="html">
	<div class="class-level-viewer">
		<h1 class="display-1">
			{{model.name}}
			<span
				class="display-2"
				v-if="model.level"
			>
				{{model.level}}
			</span>
		</h1>
		<p class="my-2">
			<code>{{model.variableName}}</code>
		</p>
		<p class="my-2" v-if="model.baseClass">
			Base class: <code>{{model.baseClass}}</code>
		</p>
	</div>
</template>

<script>
export default {
	props: {
		model: {
			type: Object,
			required: true,
		},
	}
}
</script>

<style lang="css" scoped>
</style>
