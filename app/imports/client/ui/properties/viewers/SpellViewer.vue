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

<script lang="js">
import propertyViewerMixin from '/imports/client/ui/properties/viewers/shared/propertyViewerMixin';
import ActionViewer from './ActionViewer.vue';

const levelText = [
  'cantrip', '1st-level', '2nd-level', '3rd-level', '4th-level', '5th-level',
  '6th-level', '7th-level', '8th-level', '9th-level'
];

export default {
  components: {
    ActionViewer,
  },
  mixins: [propertyViewerMixin],
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

</style>
