<template lang="html">
  <div>
    <property-name :value="model.name" />
    <div v-if="model.damageTypes.length">
      {{ operation }} to {{ model.damageTypes.join(', ') }} damage
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
				case 0: return 'Immunity';
				case 0.5: return 'Resistance';
				case 2: return 'Vulnerability';
			}
		},
	},
}
</script>

<style lang="css" scoped>
</style>
