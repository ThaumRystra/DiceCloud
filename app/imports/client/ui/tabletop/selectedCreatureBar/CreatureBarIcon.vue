<template lang="html">
  <v-btn
    icon
    :plain="!selected"
    large
    tile
    :outlined="selected"
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

<script lang="js">
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties';
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
    },
    selected: Boolean,
  },
  meteor: {
    prop() {
      if (!this.propId) return;
      return CreatureProperties.findOne(this.propId);
    },
  },
}
</script>
