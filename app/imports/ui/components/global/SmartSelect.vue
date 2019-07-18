<template lang="html">
  <v-select
		v-bind="$attrs"
		:loading="loading"
		:error-messages="errors"
		:value="safeValue"
		:menu-props="{auto: true, lazy: true}"
		@change="change"
		@focus="focused = true"
		@blur="focused = false"
		box
	>
		<slot name="prepend" slot="prepend"/>
	</v-select>
</template>

<script>
	import SmartInput from '/imports/ui/components/global/SmartInputMixin.js';

	export default {
		mixins: [SmartInput],
	};
</script>
