<script setup lang="ts">
import { computed } from 'vue';
import ActionViewer from './ActionViewer.vue';

const props = defineProps<{ model: Record<string, any> }>();

const levelTextOptions = [
  'cantrip', '1st-level', '2nd-level', '3rd-level', '4th-level', '5th-level',
  '6th-level', '7th-level', '8th-level', '9th-level'
];

const levelText = computed(() => levelTextOptions[props.model.level]);

const spellComponents = computed(() => {
  const components: string[] = [];
  if (props.model.ritual) components.push('Ritual');
  if (props.model.concentration) components.push('Concentration');
  if (props.model.verbal) components.push('Verbal');
  if (props.model.somatic) components.push('Somatic');
  if (props.model.material) components.push(`Material (${props.model.material})`);
  return components.join(', ');
});
</script>

<template lang="html">
  <action-viewer
    :model="model"
    class="spell-viewer"
  >
    <property-field
      name="School"
      :value="model.school"
    />
    <property-field
      name="Level"
      :value="levelText"
    />
    <property-field
      name="Casting time"
      :value="model.castingTime"
    />
    <property-field
      name="Range"
      :value="model.range"
    />
    <property-field
      name="Components"
      :value="spellComponents"
    />
    <property-field
      name="Duration"
      :value="model.duration"
    />
  </action-viewer>
</template>

<style lang="css" scoped>

</style>
