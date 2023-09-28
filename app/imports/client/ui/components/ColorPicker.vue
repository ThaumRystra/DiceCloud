<template lang="html">
  <v-menu
    v-model="opened"
    :close-on-content-click="false"
    transition="slide-y-transition"
    left
  >
    <template #activator="{ on }">
      <v-btn
        :icon="!label"
        :tile="!label"
        :min-width="label && 108"
        :height="height"
        :width="width"
        :disabled="context.editPermission === false"
        v-on="on"
      >
        {{ label }}
        <v-icon
          :right="!!label"
          :color="noColorChange ? undefined : value"
        >
          mdi-format-paint
        </v-icon>
      </v-btn>
    </template>
    <v-card class="overflow-hidden">
      <v-card-text>
        <v-layout
          wrap
        >
          <div
            v-for="colorOption in colors"
            :key="colorOption"
            :class="[colorOption, shade]"
            class="color-swatch d-flex align-center"
            @click="color = colorOption"
          >
            <v-scroll-y-transition>
              <v-icon
                v-if="kebabColor === colorOption"
                :class="{dark: isDark(colorOption, shade)}"
              >
                mdi-check
              </v-icon>
            </v-scroll-y-transition>
          </div>
          <div
            v-for="i in 8"
            :key="i"
            class="spacer"
          />
        </v-layout>
        <v-fade-transition>
          <v-layout
            v-show="color"
            wrap
            class="mt-2"
          >
            <div
              v-for="shadeOption in shades"
              :key="shadeOption"
              :class="[kebabColor, shadeOption]"
              class="shade-swatch d-flex align-center"
              @click="shade = shadeOption"
            >
              <v-scroll-y-transition>
                <v-icon
                  v-if="kebabShade === shadeOption"
                  :class="isDark(color, shade) ? 'dark' : 'light'"
                >
                  mdi-check
                </v-icon>
              </v-scroll-y-transition>
            </div>
            <div
              v-for="i in 8"
              :key="i"
              class="spacer"
            />
          </v-layout>
        </v-fade-transition>
      </v-card-text>
      <v-card-actions>
        <v-btn
          text
          @click="$emit('input')"
        >
          Clear
        </v-btn>
        <v-spacer />
        <v-btn
          text
          @click="opened = false"
        >
          Done
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-menu>
</template>

<script lang="js">
  import isDarkColor from '/imports/client/ui/utility/isDarkColor';
  import vuetifyColors from 'vuetify/es5/util/colors';
  import { kebabToCamelCase, camelToKebabCase } from '/imports/client/ui/utility/swapCase';

  function colorToHex(color, shade = 'base'){
    if (!color) return;
    color = kebabToCamelCase(color);
    shade = kebabToCamelCase(shade);
    return vuetifyColors[color] && vuetifyColors[color][shade];
  }

  // Create an index of hex colors and what color/shade combination makes them
  let colorIndex = {};
  for (let color in vuetifyColors){
    color = kebabToCamelCase(color);
    for (let shade in vuetifyColors[color]){
      shade = kebabToCamelCase(shade);
      colorIndex[vuetifyColors[color][shade]] = {color, shade};
    }
  }
  function hexToColor(hex){
    if (!hex) return undefined;
    return colorIndex[hex.toLowerCase()];
  }

  export default {
    inject: {
      context: { default: {} }
    },
    props: {
     //hex string
      value: {
        type: String,
        default: undefined,
      },
      label: {
        type: String,
        default: undefined,
      },
      height: {
        type: Number,
        default: undefined,
      },
      width: {
        type: Number,
        default: undefined,
      },
      noColorChange: Boolean,
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
    computed: {
      combination (){
        if (!this.value) return;
        return hexToColor(this.value) || {};
      },
      color: {
        get(){
          return this.combination && this.combination.color;
        },
        set(newColor){
          this.$emit('input', colorToHex(newColor, this.shade));
        },
      },
      shade: {
        get(){
          return this.combination && this.combination.shade;
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
    methods: {
      isDark(kebabColor, kebabShade){
        let color = colorToHex(kebabColor, kebabShade);
        return isDarkColor(color);
      },
      kebabToCamelCase,
    },
  };
</script>

<style lang="css" scoped>
  .color-swatch, .shade-swatch {
    height: 30px;
    width: 30px;
    flex-grow: 1;
    cursor: pointer;
    transition: all 0.2s linear;
  }
  .color-swatch:hover{
    z-index: 1;
    transform: scale(1.1);
    box-shadow: 0px 2px 1px -1px rgba(0,0,0,0.2),
      0px 1px 1px 0px rgba(0,0,0,0.14),
      0px 1px 3px 0px rgba(0,0,0,0.12);
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
