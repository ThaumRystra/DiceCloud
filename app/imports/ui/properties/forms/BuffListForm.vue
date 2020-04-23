<template lang="html">
  <div>
    <v-slide-x-transition group>
      <div
        v-for="(buff, i) in model"
        :key="buff._id || i"
      >
        <v-divider v-if="i !== 0" />
        <div class="layout row align-center">
          <div style="flex-grow: 1;">
            <buff-form
              class="mt-4"
              :model="buff"
              :parent-target="parentTarget"
              :stored="true"
              @change="({path, value, ack}) => $emit('change', {path: [i, ...path], value, ack})"
              @push="({path, value, ack}) => $emit('push', {path: [i, ...path], value, ack})"
              @pull="({path, ack}) => $emit('pull', {path: [i, ...path], ack})"
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
	import BuffForm from '/imports/ui/properties/forms/BuffForm.vue';
	import { StoredBuffWithIdSchema } from '/imports/api/properties/Buffs.js';

	export default {
		components: {
			BuffForm,
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
