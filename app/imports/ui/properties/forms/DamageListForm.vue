<template lang="html">
  <div>
    <v-slide-x-transition group>
      <div
        v-for="(damage, i) in model"
        :key="damage._id || i"
      >
        <v-divider v-if="i !== 0" />
        <div class="layout row align-center">
          <div style="flex-grow: 1;">
            <damage-form
              class="mt-4"
              :model="damage"
              :parent-target="parentTarget"
              @change="({path, value, ack}) => $emit('change', {path: [i, ...path], value, ack})"
            />
          </div>
          <v-btn
            outline
            icon
            large
            class="ma-3"
            @click="$emit('pull', {path: [i]})"
          >
            <v-icon>delete</v-icon>
          </v-btn>
        </div>
      </div>
    </v-slide-x-transition>
    <div class="layout row justify-center">
      <v-btn
        :loading="addDamageLoading"
        :disabled="addDamageLoading"
        outline
        icon
        @click="addDamage"
      >
        <v-icon>add</v-icon>
      </v-btn>
    </div>
  </div>
</template>

<script>
	import DamageForm from '/imports/ui/properties/forms/DamageForm.vue';
	import DamageSchema from '/imports/api/properties/subSchemas/DamageSchema.js';

	export default {
		components: {
			DamageForm,
		},
		props: {
			model: {
				type: Array,
				default: () => ([]),
			},
			parentTarget: {
				type: String,
        default: undefined,
			},
      debounceTime: {
        type: Number,
        default: undefined,
      },
		},
		data(){return {
			addDamageLoading: false,
		}},
		methods: {
			acknowledgeAddDamage(){
				this.addDamageLoading = false;
			},
			addDamage(){
				this.addDamageLoading = true;
				this.$emit('push', {
					path: [],
					value: DamageSchema.clean({}),
					ack: this.acknowledgeAddDamage,
				});
			},
		},
	}
</script>

<style lang="css" scoped>
</style>
