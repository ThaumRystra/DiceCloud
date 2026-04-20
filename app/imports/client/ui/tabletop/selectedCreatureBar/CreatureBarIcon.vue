<script setup lang="ts">
import { autorun } from 'vue-meteor-tracker';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties';
import PropertyIcon from '/imports/client/ui/properties/shared/PropertyIcon.vue';

const props = defineProps<{
  propId?: string;
  icon?: string;
  selected?: boolean;
}>();

const { result: prop } = autorun(() => {
  if (!props.propId) return;
  return CreatureProperties.findOne(props.propId);
});
</script>

<template lang="html">
  <v-btn
    icon
    size="large"
    rounded="0"
    :variant="selected ? 'outlined' : 'plain'"
    :color="prop && prop.color"
    @click.prevent="$emit('click', $event)"
    @mouseenter="$emit('mouseenter', $event)"
    @mouseleave="$emit('mouseleave', $event)"
  >
    <property-icon
      v-if="prop"
      :model="prop"
      :color="prop.color"
    />
    <v-icon v-else-if="icon">
      {{ icon }}
    </v-icon>
    <v-icon v-else>
      mdi-help
    </v-icon>
  </v-btn>
</template>
