<template lang="html">
  <single-card-layout>
    <library-and-node
      :library-id="$route.params.id"
    />
  </single-card-layout>
</template>

<script lang="js">
  import SingleCardLayout from '/imports/ui/layouts/SingleCardLayout.vue';
	import LibraryAndNode from '/imports/ui/library/LibraryAndNode.vue';
	export default {
		components: {
      SingleCardLayout,
			LibraryAndNode,
		},
	};
</script>
