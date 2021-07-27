<template lang="html">
  <div class="spell-viewer">
    <property-name :value="model.name" />
    <p class="text-caption">
      {{ levelAndSchool }}
    </p>
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
    <property-description
      :string="model.description"
      :calculations="model.descriptionCalculations"
      :inactive="model.inactive"
    />
  </div>
</template>

<script lang="js">
import propertyViewerMixin from '/imports/ui/properties/viewers/shared/propertyViewerMixin.js';

const levelText = [
  'cantrip', '1st-level', '2nd-level', '3rd-level', '4th-level', '5th-level',
  '6th-level', '7th-level', '8th-level', '9th-level'
];

export default {
	mixins: [propertyViewerMixin],
  computed:{
    levelAndSchool(){
      if (this.model.level == 0){
        return `${this.model.school} ${levelText[0]}`
      } else {
        return `${levelText[this.model.level]} ${this.model.school}`
      }
    },
    spellComponents(){
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
