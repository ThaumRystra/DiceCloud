<template lang="html">
	<dialog-base @delete="$emit('delete')">
    <slot name="toolbar" slot="toolbar" :color="doc.color">
			<div>
				{{doc.name}}
			</div>
    </slot>
		<!-- Breadcrumbs go here -->
		<slot/>
		<slot name="form" slot="edit"/>
  </dialog-base>
</template>

<script>
	import DialogBase from '/imports/ui/dialogStack/DialogBase.vue';
	export default {
		components: {
			DialogBase,
		},
		props: {
			doc: Object,
		},
	}
</script>

<style lang="css" scoped>
</style>
