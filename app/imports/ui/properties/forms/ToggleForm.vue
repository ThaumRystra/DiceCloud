<template lang="html">
  <div class="feature-form">
    <text-field
      label="Name"
      :value="model.name"
      :error-messages="errors.name"
      :debounce-time="debounceTime"
      @change="(value, ack) => $emit('change', {path: ['name'], value, ack})"
    />
    <v-layout
      column
      align-center
    >
      <v-radio-group
        :value="radioSelection"
        @change="radioChange"
      >
        <v-radio
          value="enabled"
          label="Enabled"
        />
        <v-radio
          value="disabled"
          label="Disabled"
        />
        <v-radio
          value="calculated"
          label="Calculated"
        />
      </v-radio-group>
    </v-layout>
    <v-fade-transition>
      <text-field
        v-show="radioSelection === 'calculated'"
        label="Condition"
        :value="model.condition"
        :error-messages="errors.condition"
        :debounce-time="debounceTime"
        @change="(value, ack) => $emit('change', {path: ['condition'], value, ack})"
      />
    </v-fade-transition>
  </div>
</template>

<script>
	export default {
		props: {
			model: {
				type: Object,
				default: () => ({}),
			},
			errors: {
				type: Object,
				default: () => ({}),
			},
      debounceTime: {
        type: Number,
        default: undefined,
      },
		},
    computed: {
      radioSelection(){
        if (this.model.disabled){
          return 'disabled';
        } else if (this.model.enabled){
          return 'enabled'
        } else {
          return 'calculated';
        }
      }
    },
    methods: {
      radioChange(value){
        if (value === 'enabled'){
          this.$emit('change', {path: ['enabled'], value: true});
          this.$emit('change', {path: ['disabled'], value: false});
        } else if (value === 'disabled'){
          this.$emit('change', {path: ['disabled'], value: true});
          this.$emit('change', {path: ['enabled'], value: false});
        } else if (value === 'calculated'){
          this.$emit('change', {path: ['disabled'], value: false});
          this.$emit('change', {path: ['enabled'], value: false});
        }
      }
    }
	};
</script>

<style lang="css" scoped>
</style>
