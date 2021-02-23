<template lang="html">
  <div class="spell-list-viewer">
    <property-name :value="model.name" />
    <property-variable-name :value="model.variableName" />
    <property-field
      name="Maximum prepared spells"
      :value="'maxPreparedResult' in model ? model.maxPreparedResult : model.maxPrepared"
    />
    <property-field
      name="Spell Save DC"
      :value="'dcResult' in model ? model.dcResult : model.dcResult"
    />
    <property-field
      name="Attack roll bonus"
      :value="'attackRollBonusResult' in model ? model.attackRollBonusResult : model.attackRollBonus"
    />
    <property-description
      :string="model.description"
      :calculations="model.descriptionCalculations"
      :inactive="model.inactive"
    />
  </div>
</template>

<script>
import propertyViewerMixin from '/imports/ui/properties/viewers/shared/propertyViewerMixin.js'
export default {
	mixins: [propertyViewerMixin],
}
</script>
