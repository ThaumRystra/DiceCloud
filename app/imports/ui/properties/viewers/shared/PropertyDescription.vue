<template lang="html">
	<p v-if="value" class="mt-3">
		{{value}}
	</p>
</template>

<script>
export default {
	props: {
		value: String,
	},
}
</script>
