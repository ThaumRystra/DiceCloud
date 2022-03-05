<template lang="html">
  <v-combobox
    v-bind="$attrs"
    :loading="loading"
    :error-messages="errors"
    :value="safeValue"
    :menu-props="{auto: true, lazy: true}"
    :search-input.sync="searchInput"
    :disabled="isDisabled"
    :multiple="multiple"
    outlined
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

<script lang="js">
	import SmartInput from '/imports/ui/components/global/SmartInputMixin.js';

	export default {
		mixins: [SmartInput],
    props: {
      multiple: Boolean,
    },
    data(){ return {
      searchInput: '',
    }},
    computed: {
      // This component gets a longer default debounce time because it's all
      // clicking no typing
      debounceTime() {
        if (Number.isFinite(this.debounce)){
          return this.debounce;
        } else if (Number.isFinite(this.context.debounceTime)){
          return this.context.debounceTime;
        } else {
          return 1000;
        }
      },
    },
    methods: {
      customChange(val){
        if (this.multiple){
          this.input(val);
        } else {
          this.change(val);
        }
        this.searchInput = '';
      },
    }
	};
</script>
