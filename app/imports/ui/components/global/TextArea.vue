<template lang="html">
  <v-textarea
		v-bind="$attrs"
		:loading="loading"
		:error-messages="errors"
		:value="safeValue"
		@input="input"
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
