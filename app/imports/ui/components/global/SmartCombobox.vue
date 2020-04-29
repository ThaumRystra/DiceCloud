<template lang="html">
  <v-combobox
    v-bind="$attrs"
    :loading="loading"
    :error-messages="errors"
    :value="safeValue"
    :menu-props="{auto: true, lazy: true}"
    box
    @change="change"
    @focus="focused = true"
    @blur="focused = false"
  >
    <slot
      slot="prepend"
      name="prepend"
    />
  </v-combobox>
</template>

<script>
	import SmartInput from '/imports/ui/components/global/SmartInputMixin.js';

	export default {
		mixins: [SmartInput],
	};
</script>
