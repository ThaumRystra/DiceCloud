<template lang="html">
  <dialog-base>
    <template slot="toolbar">
      <v-toolbar-title>
        New Library
      </v-toolbar-title>
    </template>
    <template>
      <text-field
        label="name"
        :value="library.name"
        :debounce-time="0"
        @change="nameChanged"
      />
    </template>
    <template slot="actions">
      <v-spacer />
      <v-btn
        flat
        :disabled="!valid"
        @click="$store.dispatch('popDialogStack', library)"
      >
        Insert Library
      </v-btn>
    </template>
  </dialog-base>
</template>

<script>
	import DialogBase from '/imports/ui/dialogStack/DialogBase.vue';

	export default {
		components: {
			DialogBase,
		},
		data(){ return {
			library: {
				name: 'New Library',
			},
			valid: true,
		}},
		methods: {
			nameChanged(val, ack){
				if (val){
					this.library.name = val;
					this.valid = true,
					ack();
				} else {
					this.valid = false;
					ack('Name is required')
				}
			},
		},
	};
</script>

<style lang="css" scoped>
</style>
