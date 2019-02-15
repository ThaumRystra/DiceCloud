<template lang="html">
	<v-menu
		:close-on-content-click="false"
    transition="slide-y-transition"
		lazy
		v-model="opened"
	>
		<v-btn
		  slot="activator"
			icon
		>
		  <v-icon>format_paint</v-icon>
		</v-btn>
		<v-card class="overflow-hidden">
			<v-card-text>
				<v-item-group v-model="color" mandatory>
		      <v-layout row wrap>
	          <v-item
							v-for="kebabColorOption in colors"
		          :key="kebabColorOption"
							:value="kebabToCamelCase(kebabColorOption)"
						>
	            <div
	              slot-scope="{ active, toggle }"
	              :class="[kebabColorOption, kebabShade]"
								class="color-swatch d-flex align-center"
	              @click="toggle"
	            >
	              <v-scroll-y-transition>
	                <v-icon
	                  v-if="active"
										:class="{dark: isDark(kebabColorOption, kebabShade)}"
	                >
	                  check
	                </v-icon>
	              </v-scroll-y-transition>
	            </div>
	          </v-item>
						<div class="spacer" v-for="i in 8"/>
		      </v-layout>
			  </v-item-group>
				<v-item-group class="mt-2" v-model="shade" mandatory>
		      <v-layout wrap>
	          <v-item
							v-for="kebabShadeOption in shades"
							:key="kebabShadeOption"
							:value="kebabToCamelCase(kebabShadeOption)"
						>
	            <div
	              slot-scope="{ active, toggle }"
	              :class="[kebabColor, kebabShadeOption]"
								class="shade-swatch d-flex align-center"
	              @click="toggle"
	            >
	              <v-scroll-y-transition>
	                <v-icon
	                  v-if="active"
										:class="{dark: isDark(kebabColor, kebabShadeOption)}"
	                >
	                  check
	                </v-icon>
	              </v-scroll-y-transition>
	            </div>
	          </v-item>
						<div class="spacer" v-for="i in 8"/>
		      </v-layout>
			  </v-item-group>
			</v-card-text>
			<v-card-actions>
				<v-spacer/>
				<v-btn flat @click="opened = false">Done</v-btn>
			</v-card-actions>
		</v-card>
  </v-menu>
</template>

<script>
	import isDarkColor from '/imports/ui/utility/isDarkColor.js';
	import vuetifyColors from 'vuetify/es5/util/colors';
	import { kebabToCamelCase, camelToKebabCase } from '/imports/ui/utility/swapCase.js';

	function colorToHex(color, shade = 'base'){
		color = kebabToCamelCase(color);
		shade = kebabToCamelCase(shade);
		return vuetifyColors[color][shade];
	};

	// Create an index of hex colors and what color/shade combination makes them
	let colorIndex = {};
	for (let color in vuetifyColors){
		for (let shade in vuetifyColors[color]){
			colorIndex[vuetifyColors[color][shade]] = {color, shade};
		}
	}
	function hexToColor(hex){
		return colorIndex[hex.toLowerCase()];
	};

	export default {
		props: {
			value: String, //hex string
		},
		data(){ return {
			colors: [
				'red',
				'pink',
				'purple',
				'deep-purple',
				'indigo',
				'blue',
				'light-blue',
				'cyan',
				'teal',
				'green',
				'light-green',
				'lime',
				'yellow',
				'amber',
				'orange',
				'deep-orange',
				'brown',
				'grey',
			],
			shades: [
				'lighten-4',
				'lighten-3',
				'lighten-2',
				'lighten-1',
				'base',
				'darken-1',
				'darken-2',
				'darken-3',
				'darken-4',
			],
			opened: false,
		}},
		methods: {
			isDark(kebabColor, kebabShade){
				color = colorToHex(kebabColor, kebabShade);
				return isDarkColor(color);
			},
			kebabToCamelCase,
		},
		computed: {
			combination (){
				return hexToColor(this.value) || {};
			},
			color: {
				get(){
					return this.combination.color;
				},
				set(newColor){
					this.$emit('input', colorToHex(newColor, this.shade));
				},
			},
			shade: {
				get(){
					return this.combination.shade;
				},
				set(newShade){
					this.$emit('input', colorToHex(this.color, newShade));
				},
			},
			kebabColor(){
				return camelToKebabCase(this.color);
			},
			kebabShade(){
				return camelToKebabCase(this.shade);
			},
		},
	};
</script>

<style lang="css" scoped>
	.color-swatch, .shade-swatch {
		height: 30px;
		width: 30px;
		flex-grow: 1;
	}
	.v-icon {
		height: 30px;
	}
	.v-icon {
		color: black;
	}
	.dark.v-icon {
		color: white;
	}
	.layout {
		max-width: 270px;
	}
	.spacer {
		width: 30px;
		height: 0;
		flex-grow: 1;
	}
</style>
