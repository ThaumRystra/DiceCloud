<template lang="html">
  <v-btn
    icon
    plain
    large
    @click="$emit('click')"
    @mouseover="$emit('hover', $event)"
  >
    <property-icon
      v-if="prop"
      :model="prop"
    />
    <v-icon v-else-if="icon">
      {{ icon }}
    </v-icon>
    <v-icon v-else>
      mdi-help
    </v-icon>
  </v-btn>
</template>

<script lang="js">
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties.js';
import PropertyIcon from '/imports/client/ui/properties/shared/PropertyIcon.vue';

export default {
  components: {
    PropertyIcon,
  },
  props: {
    propId: {
      type: String,
      default: undefined,
    },
    icon: {
      type: String,
      default: undefined,
    }
  },
  meteor: {
    prop() {
      if (!this.propId) return;
      return CreatureProperties.findOne(this.propId);
    },
  },
}
</script>
