<template lang="html">
  <div class="mt-4">
    <v-slide-x-transition group>
      <div
        v-for="(attribute, i) in model"
        :key="attribute._id || i"
      >
        <div class="layout row align-center">
          <div style="flex-grow: 1;">
            <attribute-consumed-form
              :model="attribute"
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
	import AttributeConsumedForm from '/imports/ui/properties/forms/AttributeConsumedForm.vue';

	export default {
		components: {
			AttributeConsumedForm,
		},
		props: {
			model: {
				type: Array,
				default: () => ([]),
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
