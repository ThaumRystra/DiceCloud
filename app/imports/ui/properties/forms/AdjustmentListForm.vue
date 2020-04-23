<template lang="html">
  <div>
    <v-slide-x-transition group>
      <div
        v-for="(adjustment, i) in model"
        :key="adjustment._id || i"
      >
        <v-divider v-if="i !== 0" />
        <div class="layout row align-center">
          <div style="flex-grow: 1;">
            <adjustment-form
              class="mt-4"
              :model="adjustment"
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
  </div>
</template>

<script>
	import AdjustmentForm from '/imports/ui/properties/forms/AdjustmentForm.vue';

	export default {
		components: {
			AdjustmentForm,
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
	}
</script>

<style lang="css" scoped>
</style>
