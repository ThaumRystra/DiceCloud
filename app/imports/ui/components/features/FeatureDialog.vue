<template lang="html">
	<dialog-base>
    <div slot="toolbar" :color="color">
      {{name}}
    </div>
		<div>
			{{description}}
			<child-lists
				:effects="effects"
				:proficiencies="proficiencies"
				:actions="actions"
				:attacks="attacks"
			/>
		</div>
		<div slot="edit">
			<feature-edit
				:feature="$props"
				@change="(update, ack) => $emit('change', update, ack)"
			/>
		</div>
  </dialog-base>
</template>

<script>
export default {
	props: {
		charId: String,
		name: String,
		description: String,
		uses: String,
		used: Number,
		reset: String,
		enabled: Boolean,
		alwaysEnabled: Boolean,
		order: Number,
		color: String,
		effects: Array,
		proficiencies: Array,
		actions: Array,
		attacks: Array,
	}
}
</script>

<style lang="css" scoped>
</style>
