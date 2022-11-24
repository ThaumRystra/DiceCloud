<template lang="html">
  <div
    class="double-border"
  >
    <div
      v-if="model.name"
      class="label"
    >
      {{ model.name }}
    </div>
    <div v-if="model.level">
      {{ levelText }} {{ model.school }} {{ model.ritual ? '(ritual)' : '' }}
    </div>
    <div v-else>
      {{ model.school }} cantrip
    </div>
    <div>
      Casting Time: {{ model.castingTime }}
    </div>
    <div>
      Range: {{ model.range }}
    </div>
    <div>
      Components: {{ spellComponents }}
    </div>
    <div>
      Duration: {{ model.duration }}
    </div>
    <property-description
      text
      :model="model.summary"
    />
    <v-divider class="my-2" />
    <property-description
      text
      :model="model.description"
    />
  </div>
</template>

<script lang="js">
import PropertyDescription from '/imports/client/ui/properties/viewers/shared/PropertyDescription.vue';

const levelText = [
  'cantrip', '1st-level', '2nd-level', '3rd-level', '4th-level', '5th-level',
  '6th-level', '7th-level', '8th-level', '9th-level'
];

export default {
  components: {
    PropertyDescription,
  },
  props: {
    model: {
      type: Object,
      required: true,
    },
  },
  computed: {
    levelText() {
      return levelText[this.model.level]
    },
    spellComponents() {
      let components = [];
      if (this.model.ritual) components.push('Ritual');
      if (this.model.concentration) components.push('Concentration');
      if (this.model.verbal) components.push('Verbal');
      if (this.model.somatic) components.push('Somatic');
      if (this.model.material) components.push(`Material (${this.model.material})`);
      return components.join(', ');
    },
  }
}
</script>

<style lang="css" scoped>
.label {
  font-size: 14pt;
  font-variant: all-small-caps;
  font-weight: 600;
}
</style>
