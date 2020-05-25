<template lang="html">
  <v-textarea
    v-bind="$attrs"
    :loading="loading"
    :error-messages="errors"
    :value="safeValue"
    :disabled="isDisabled"
    :auto-grow="autoGrow"
    box
    @input="input"
    @focus="focused = true"
    @blur="focused = false"
  />
</template>

<script>
	import SmartInput from '/imports/ui/components/global/SmartInputMixin.js';

	export default {
		mixins: [SmartInput],
		props: {
			autoGrow: {
				type: Boolean,
				default: false,
			},
		},
	};
</script>
