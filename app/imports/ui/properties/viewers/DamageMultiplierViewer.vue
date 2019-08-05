<template lang="html">
	<div>
		<h1 class="display-1">
			{{model.name}}
		</h1>
		<div>
			{{model.damageType}} {{operation}}
		</div>
	</div>
</template>

<script>
export default {
	props: {
		model: {
			type: Object,
			required: true,
		}
	},
	computed: {
		operation(){
			switch (this.model.value){
				case 0: return "immunity";
				case 0.5: return "resistance";
				case 2: return "vulnerability";
			}
		},
	},
}
</script>

<style lang="css" scoped>
</style>
