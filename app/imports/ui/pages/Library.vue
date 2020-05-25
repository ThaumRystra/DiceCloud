<template lang="html">
  <div
    class="pa-4 layout column align-center"
    style="height: calc(100vh - 96px); display: flex;"
  >
    <v-card
      style="height: 100%; width: 100%; max-width: 1800px;"
    >
      <library-and-node />
    </v-card>
  </div>
</template>

<script>
	import LibraryAndNode from '/imports/ui/library/LibraryAndNode.vue';
	export default {
		components: {
			LibraryAndNode,
		},
	};
</script>
