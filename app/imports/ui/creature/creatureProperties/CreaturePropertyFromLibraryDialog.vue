<template lang="html">
  <dialog-base>
    <v-toolbar-title slot="toolbar">
      Add from library
    </v-toolbar-title>
    <library-and-node
      slot="unwrapped-content"
      style="height: 100%;"
      selection
      @selected="val => node = val"
    />
    <template slot="actions">
      <v-spacer />
      <v-btn
        flat
        color="primary"
        @click="$store.dispatch('popDialogStack', node)"
      >
        Insert
      </v-btn>
    </template>
  </dialog-base>
</template>

<script>
	import DialogBase from '/imports/ui/dialogStack/DialogBase.vue';
	import LibraryAndNode from '/imports/ui/library/LibraryAndNode.vue';
	export default {
		components: {
			DialogBase,
			LibraryAndNode,
		},
		data(){return {
			node: undefined,
		};},
	};
</script>

<style lang="css" scoped>
</style>
