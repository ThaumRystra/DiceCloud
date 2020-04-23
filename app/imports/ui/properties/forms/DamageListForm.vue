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
  </div>
</template>

<script>
	import DamageForm from '/imports/ui/properties/forms/DamageForm.vue';

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
	}
</script>
