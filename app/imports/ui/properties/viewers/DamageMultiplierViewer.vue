<template lang="html">
  <div>
    <v-row dense>
      <property-field
        name="Operation"
        :value="operation"
      />
      <property-field
        name="Damage types"
        :value="model.damageTypes.join(', ')"
      />
    </v-row>
  </div>
</template>

<script lang="js">
import propertyViewerMixin from '/imports/ui/properties/viewers/shared/propertyViewerMixin.js'
export default {
	mixins: [propertyViewerMixin],
	computed: {
		operation(){
			switch (this.model.value){
				case 0: return 'Immunity';
				case 0.5: return 'Resistance';
				case 2: return 'Vulnerability';
        default: return '';
			}
		},
	},
}
</script>

<style lang="css" scoped>
</style>
