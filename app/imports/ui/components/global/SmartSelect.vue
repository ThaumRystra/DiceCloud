<template lang="html">
  <v-select
		v-bind="$attrs"
		:loading="loading"
		:error-messages="errorMessages"
		:value="safeValue"
		:menu-props="{auto: true, lazy: true}"
		@change="change"
		@focus="focused = true"
		@blur="focused = false"
	/>
</template>

<script>
	import SmartInput from '/imports/ui/components/global/SmartInput.js';

	export default {
		mixins: [SmartInput],
	};
</script>
