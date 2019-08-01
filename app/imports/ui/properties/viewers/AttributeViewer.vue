<template lang="html">
	<div class="attribute-viewer">
		<div class="title">
			{{model.name}}
		</div>
		<div class="caption">
			({{model.variableName}})
		</div>
		
	</div>
</template>

<script>
import numberToSignedString from '/imports/ui/utility/numberToSignedString.js';

	export default {
		props: {
			model: Object,
		},
		methods: {
			numberToSignedString,
		},
	}
</script>

<style lang="css" scoped>
	.ability-value {
		font-weight: 600;
		font-size: 24px !important;
		color: rgba(0, 0, 0, 0.54);
	}
	.mod, .ability-value {
		text-align: center;
		width: 100%;
	}
	.attribute-value {
		text-align: center;
	}
</style>
