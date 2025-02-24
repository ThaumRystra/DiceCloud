<template lang="html">
  <action-viewer
    :model="model"
    class="spell-viewer"
  >
    <property-field
      :name="$t('SpellForm.piPx3pA-W5h-qH0Z94ZsE')"
      :value="model.school"
    />
    <property-field
      :name="$t('CharacterCreationDialog.ALoCn8fXt0dv34QiFx1jx')"
      :value="levelText"
    />
    <property-field
      :name="$t('SpellViewer.Gdc3WTq0-wImt_U4ceL2V')"
      :value="model.castingTime"
    />
    <property-field
      :name="$t('SpellForm.GTo5F3pHuu3BbIYKib0wi')"
      :value="model.range"
    />
    <property-field
      :name="$t('SpellViewer.V-Z3NnFr9mXSirqS9aMnZ')"
      :value="spellComponents"
    />
    <property-field
      :name="$t('SpellForm.O5ypCXsK7hCS6k9_GsGa6')"
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
      if (this.model.ritual) components.push(this.$t('CastSpellWithSlotDialog.pKKtVPJFsDi6EMWOmVbkP'));
      if (this.model.concentration) components.push(this.$t('CastSpellWithSlotDialog.JhkgAy7hkeEm0nlKxRUKb'));
      if (this.model.verbal) components.push(this.$t('CastSpellWithSlotDialog.ZJalW18LEJvZmvjZ7rbUG'));
      if (this.model.somatic) components.push(this.$t('CastSpellWithSlotDialog._1NJvagH4wHdqwixdE6nU'));
      if (this.model.material) components.push(this.$t('SpellViewer.eS5_P_7EZ3OVlsvLNNttN', [this.model.material]));
      return components.join(', ');
    },
  }
}
</script>

<style lang="css" scoped>

</style>
