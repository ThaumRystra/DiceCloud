<template lang="html">
	<v-container grid-list-lg>
		<v-layout row wrap align-center>

			<v-flex xs6>
				<text-field
					:value="value1"
					@change="value1Change"
				/>
			</v-flex>
			<v-flex xs6>
				<div class="flex">
					{{value1}}
				</div>
			</v-flex>

			<v-flex xs6>
				<text-field
					:value="changingValue"
					@change="(val, ack) => {changingValue = val; ack()}"
				/>
			</v-flex>
			<v-flex xs6>
				{{changingValue}}
			</v-flex>

			<v-flex xs6>
				<text-area
					:value="value2"
					@change="value2Change"
					label="text-area"
				/>
			</v-flex>
			<v-flex xs6>
				{{value2}}
			</v-flex>

			<v-flex xs6>
				<smart-select
					:value="value3"
					:items="['meep', 'moop', 'maap']"
					label="select"
					@change="(val, ack) => {setTimeout(() => {value3 = val; ack()}, 700)}"
				/>
			</v-flex>
			<v-flex xs6>
				{{value3}}
			</v-flex>

		</v-layout>
	</v-container>
</template>

<script>
	export default {
		data(){ return {
			value1: 'Five letters minimum, always trimmed',
			value2: 'Takes 2s to write',
			value3: 'meep',
			changingValue: `Changes every 3s ${Math.random().toFixed(4)}`,
		}},
		methods: {
			value1Change(val, ack){
				let error;
				val = val.trim();
				if (!val || val.length < 5){
					error = "Too short";
				} else {
					this.value1 = val;
				}
				ack(error);
			},
			value2Change(val, ack){
				setTimeout(() => {
					this.value2 = val;
					ack();
				}, 2000);
			},
		},
		mounted() {
	    setInterval(() => {
	      this.changingValue = `Changes every 3s ${Math.random().toFixed(4)}`;
	    }, 3000);
	  },
	};
</script>

<style lang="css" scoped>
	.layout {
		margin: 20px 0;
	}
</style>
