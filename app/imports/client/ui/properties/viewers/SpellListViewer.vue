<template lang="html">
  <div class="spell-list-viewer">
    <v-row dense>
      <property-field
        :name="$t('AttributeViewer.MNk7FUYtABwXmOJJeujzZ')"
        mono
        :value="model.variableName"
      />

      <property-field
        :name="$t('SpellListForm.-S8t64gUIlS_M6wcwTYi2')"
        large
        center
        :calculation="model.maxPrepared"
      />
      <property-field
        :name="$t('SpellListForm.sJVB7VP-LJqBWgObeUqHZ')"
        mono
        :value="model.ability"
      />
      <property-field
        :name="$t('SpellListViewer.5pFNrYOrJL0RyPPLWDKWE')"
        large
        center
        signed
        :value="model.abilityMod"
      />
      <property-field
        :name="$t('SpellListViewer.VfPi5M154nr9qT3z0QD21')"
        large
        center
        :calculation="model.dc"
      />
      <property-field
        :name="$t('SpellListForm.KQA6DzSentAneUoHFTGBB')"
        large
        center
        signed
        :calculation="model.attackRollBonus"
      />
      <property-description
        :name="$t('TabletopForm.nOLcz4YcyQNTwJKSAWI0K')"
        :model="model.description"
      />
    </v-row>
  </div>
</template>

<script lang="js">
import propertyViewerMixin from '/imports/client/ui/properties/viewers/shared/propertyViewerMixin'
export default {
  mixins: [propertyViewerMixin],
}
</script>
