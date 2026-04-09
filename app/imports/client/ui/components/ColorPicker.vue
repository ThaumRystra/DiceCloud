<template lang="html">
  <v-menu
    v-model="opened"
    :close-on-content-click="false"
    transition="slide-y-transition"
    left
  >
    <template #activator="{ props }">
      <v-btn
        :icon="!label"
        :tile="!label"
        :min-width="label && 108"
        :height="height"
        :width="width"
        :disabled="context.editPermission === false"
        v-bind="props"
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
        <div class="d-flex flex-wrap">
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
        </div>
        <v-fade-transition>
          <div
            v-show="color"
            class="d-flex flex-wrap mt-2"
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
          </div>
        </v-fade-transition>
      </v-card-text>
      <v-card-actions>
        <v-btn
          variant="text"
          @click="$emit('input')"
        >
          Clear
        </v-btn>
        <v-spacer />
        <v-btn
          variant="text"
          @click="opened = false"
        >
          Done
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { ref, computed, inject } from 'vue';
import isDarkColor from '/imports/client/ui/utility/isDarkColor';
import vuetifyColors from 'vuetify/lib/util/colors.js';
import { kebabToCamelCase, camelToKebabCase } from '/imports/client/ui/utility/swapCase';

const context = inject<{ editPermission?: boolean }>('context', {});

function colorToHex(color: string | undefined, shade = 'base'): string | undefined {
  if (!color) return;
  const c = kebabToCamelCase(color) as string;
  const s = kebabToCamelCase(shade) as string;
  return (vuetifyColors as Record<string, Record<string, string>>)[c]?.[s];
}

// Create an index of hex colors and what color/shade combination makes them
const colorIndex: Record<string, { color: string; shade: string }> = {};
for (const colorKey in vuetifyColors) {
  const c = kebabToCamelCase(colorKey) as string;
  const colorShades = (vuetifyColors as Record<string, Record<string, string>>)[c];
  for (const shadeKey in colorShades) {
    const s = kebabToCamelCase(shadeKey) as string;
    colorIndex[colorShades[shadeKey]] = { color: c, shade: s };
  }
}

function hexToColor(hex: string | undefined): { color: string; shade: string } | undefined {
  if (!hex) return undefined;
  return colorIndex[hex.toLowerCase()];
}

const props = defineProps<{
  value?: string;
  label?: string;
  height?: number;
  width?: number;
  noColorChange?: boolean;
}>();

const emit = defineEmits<{
  input: [value: string | undefined];
}>();

const colors = [
  'red', 'pink', 'purple', 'deep-purple', 'indigo', 'blue', 'light-blue',
  'cyan', 'teal', 'green', 'light-green', 'lime', 'yellow', 'amber',
  'orange', 'deep-orange', 'brown', 'grey',
];
const shades = [
  'lighten-4', 'lighten-3', 'lighten-2', 'lighten-1', 'base',
  'darken-1', 'darken-2', 'darken-3', 'darken-4',
];

const opened = ref(false);

const combination = computed(() => {
  if (!props.value) return undefined;
  return hexToColor(props.value) || {};
});

const color = computed({
  get() {
    return combination.value?.color;
  },
  set(newColor: string | undefined) {
    emit('input', colorToHex(newColor, shade.value));
  },
});

const shade = computed({
  get() {
    return combination.value?.shade;
  },
  set(newShade: string | undefined) {
    emit('input', colorToHex(color.value, newShade));
  },
});

const kebabColor = computed(() => camelToKebabCase(color.value) as string);
const kebabShade = computed(() => camelToKebabCase(shade.value) as string);

function isDark(kebabColorVal: string, kebabShadeVal: string): boolean {
  const hex = colorToHex(kebabColorVal, kebabShadeVal);
  return isDarkColor(hex);
}
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
