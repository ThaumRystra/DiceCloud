<template lang="html">
  <component v-if="type" :is="type" class="library-node-form"/>
</template>

<script>
import propertyFormIndex from '/imports/ui/creature/properties/propertyFormIndex.js';
export default {
	props: {
		type: String,
	},
	components: propertyFormIndex,
}
</script>

<style lang="css" scoped>
</style>
