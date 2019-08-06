<template lang="html">
	<toolbar-layout>
    <div slot="toolbar">
      Not yet implemented
    </div>
		<v-alert
			:value="true"
			type="info"
		>
			This page is not available in this version of the alpha.
		</v-alert>
  </toolbar-layout>
</template>

<script>
import ToolbarLayout from '/imports/ui/layouts/ToolbarLayout.vue';
export default {
	components: {
		ToolbarLayout,
	},
};
</script>
