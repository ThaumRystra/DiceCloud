<template lang="html">
  <single-card-layout>
    <library-and-node />
  </single-card-layout>
</template>

<script>
  import SingleCardLayout from '/imports/ui/layouts/SingleCardLayout.vue';
	import LibraryAndNode from '/imports/ui/library/LibraryAndNode.vue';
	export default {
		components: {
      SingleCardLayout,
			LibraryAndNode,
		},
	};
</script>
