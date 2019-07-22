<template lang="html">
	<form-sections v-if="standalone">
		<v-expansion-panel-content>
			<div slot="header" class="subheading">
				{{name}}
			</div>
			<v-card-text>
				<slot/>
			</v-card-text>
		</v-expansion-panel-content>
	</form-sections>
	<v-expansion-panel-content v-else>
		<div slot="header" class="subheading">
			{{name}}
		</div>
		<v-card-text>
			<slot/>
		</v-card-text>
	</v-expansion-panel-content>
</template>

<script>
import FormSections from '/imports/ui/forms/components/FormSections.vue';
export default {
	components: {
		FormSections,
	},
	props: {
		name: String,
		standalone: Boolean,
	},
}
export { FormSections };
</script>
