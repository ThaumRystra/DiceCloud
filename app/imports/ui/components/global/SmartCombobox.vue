<template lang="html">
  <v-combobox
    v-bind="$attrs"
    :loading="loading"
    :error-messages="errors"
    :value="safeValue"
    :menu-props="{auto: true, lazy: true}"
    :search-input.sync="searchInput"
    :disabled="isDisabled"
    box
    @change="customChange"
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
    data(){ return {
      searchInput: '',
    }},
    methods: {
      customChange(val){
        this.change(val);
        this.searchInput = '';
      },
    }
	};
</script>
