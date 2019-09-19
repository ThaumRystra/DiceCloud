<template lang="html">
  <action-form attack-form v-bind="$attrs" v-on="$listeners"/>
</template>

<script>
	import ActionForm from '/imports/ui/properties/forms/ActionForm.vue';
	export default {
		components: {
			ActionForm,
		},
	};
</script>
