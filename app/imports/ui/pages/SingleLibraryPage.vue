<template lang="html">
  <div>
    <v-card class="ma-4">
      <single-library />
    </v-card>
  </div>
</template>

<script>
	import SingleLibrary from '/imports/ui/library/SingleLibrary.vue';
	export default {
		components: {
			SingleLibrary,
		},
	};
</script>
