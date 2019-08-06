<template lang="html">
	<div>
		<property-name :value="model.name"/>
		<div>
			{{model.damageType}} {{operation}}
		</div>
	</div>
</template>

<script>
import propertyViewerMixin from '/imports/ui/properties/viewers/shared/propertyViewerMixin.js'
export default {
	mixins: [propertyViewerMixin],
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
