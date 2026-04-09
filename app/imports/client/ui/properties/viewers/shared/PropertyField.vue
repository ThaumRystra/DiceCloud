<template lang="html">
  <v-col
    v-if="value !== undefined ||
      calculation !== undefined ||
      ($slots.default && $slots.default.length)"
    v-bind="cols"
    class="mb-3"
  >
    <fieldset
      :class="theme.isDark? 'v-theme--dark' :'v-theme--light'"
      class="rounded v-sheet--outlined pa-2 layout column align-start fill-height"
      @click="$emit('click', $event)"
    >
      <legend
        v-if="name"
        class="text-caption px-1 name"
        style="line-height: 0;"
      >
        {{ name }}
      </legend>
      <div
        class="flex-grow-1 d-flex align-center flex-wrap"
        style="width: 100%;"
      >
        <div
          class="d-flex align-center"
          :class="{
            'text-body-1': !isLarge,
            'text-h4': isLarge,
            'justify-center': isCenter,
            'justify-end': end,
            'flex-wrap': wrap,
            'mono': isMono,
            'flex-grow-0': hasEffectsOrProficiencies,
            'flex-grow-1': !hasEffectsOrProficiencies, 
            'ma-3': hasEffectsOrProficiencies,
            ...$attrs.class,
          }"
          style="overflow-x: auto;"
          v-bind="$attrs"
        >
          <slot>
            <template v-if="value !== undefined">
              {{ valueText }}
            </template>
            <template v-else-if="calculation !== undefined">
              {{ calculationText }}
            </template>
          </slot>
        </div>
        <div
          v-if="hasEffectsOrProficiencies"
          class="flex-grow-1"
          style="max-width: 100%;"
        >
          <inline-effect
            v-for="effectId in calculation.effectIds"
            :key="effectId"
            :data-id="effectId"
            :effect-id="effectId"
            @click="clickEffect(effectId)"
          />
          <inline-proficiency
            v-for="proficiencyId in calculation.proficiencyIds"
            :key="proficiencyId"
            :data-id="proficiencyId"
            :proficiency-id="proficiencyId"
            @click="clickEffect(proficiencyId)"
          />
        </div>
        <div
          v-if="hasEffectsOrProficiencies"
          class="d-flex justify-end border-t-sm pt-2"
          style="width: 100%; opacity: 0.5"
        >
          {{ calculation.value }}
        </div>
      </div>
    </fieldset>
  </v-col>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue';
import { useStore } from 'vuex';
import numberToSignedString from '/imports/api/utility/numberToSignedString';
import InlineEffect from '/imports/client/ui/properties/components/effects/InlineEffect.vue';
import InlineProficiency from '/imports/client/ui/properties/components/proficiencies/InlineProficiency.vue';

const store = useStore();
const theme = inject<{ isDark: boolean }>('theme', { isDark: false });

const props = withDefaults(defineProps<{
  name?: string;
  value?: string | number | boolean;
  calculation?: Record<string, any>;
  center?: boolean;
  end?: boolean;
  large?: boolean;
  mono?: boolean;
  signed?: boolean;
  wrap?: boolean;
  cols?: Record<string, number>;
}>(), {
  name: undefined,
  value: undefined,
  calculation: undefined,
  center: false,
  end: false,
  large: false,
  mono: false,
  signed: false,
  wrap: false,
  cols: () => ({ cols: 12, sm: 6, md: 4 }),
});

const showCalculationInsteadOfValue = computed(() => {
  if (!props.calculation) return undefined;
  return props.calculation.value === undefined;
});

const valueNotReduced = computed(() => {
  if (!props.calculation) return undefined;
  return typeof props.calculation.value === 'string';
});

const valueText = computed(() => {
  if (props.signed) {
    return numberToSignedString(props.value);
  } else {
    return props.value;
  }
});

const calculationText = computed(() => {
  const calculation = props.calculation;
  if (!calculation) return undefined;
  if (calculation.value === undefined) return calculation.calculation;
  if (props.signed) return numberToSignedString(calculation.value);
  if (hasEffectsOrProficiencies.value) return calculation.unaffected;
  return calculation.value;
});

// large and center are only applied to calculations if we are showing their
// value, if we are showing the calculation itself, large and center are
// turned off
const isLarge = computed(() => {
  if (showCalculationInsteadOfValue.value) return false;
  if (valueNotReduced.value) return false;
  return props.large;
});

const isCenter = computed(() => {
  if (showCalculationInsteadOfValue.value) return false;
  if (valueNotReduced.value) return false;
  return props.center;
});

const isMono = computed(() => {
  if (showCalculationInsteadOfValue.value) return true;
  if (valueNotReduced.value) return true;
  return props.mono;
});

const hasEffects = computed(() => props.calculation?.effectIds?.length > 0);
const hasProficiencies = computed(() => props.calculation?.proficiencyIds?.length > 0);
const hasEffectsOrProficiencies = computed(() => hasEffects.value || hasProficiencies.value);

function clickEffect(id: string) {
  store.commit('pushDialogStack', {
    component: 'creature-property-dialog',
    elementId: `${id}`,
    data: { _id: id },
  });
}
</script>

<style lang="css" scoped>
.name {
  color: rgba(0,0,0,.6);
}
.v-theme--dark .name {
  color: rgba(255,255,255,.6);
}
.mono {
  font-family: monospace !important;
}
</style>
