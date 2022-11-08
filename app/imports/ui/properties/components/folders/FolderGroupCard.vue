<template>
  <v-card>
    <v-subheader v-if="model.name">
      {{ model.name }}
    </v-subheader>
    <component
      :is="prop.type"
      v-for="prop in properties"
      :key="prop._id"
      :model="prop"
    />
  </v-card>
</template>

<script lang="js">
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties.js';
import propComponents from '/imports/ui/properties/components/folders/propertyComponentIndex.js';

export default {
  components: {
    ...propComponents,
  },
  props: {
    model: {
      type: Object,
      required: true,
    }
  },
  meteor: {
    properties() {
      return CreatureProperties.find({
        'ancestors.id': this.model._id
      }, {
        sort: { order: 1 },
      });
    },
  },
}
</script>