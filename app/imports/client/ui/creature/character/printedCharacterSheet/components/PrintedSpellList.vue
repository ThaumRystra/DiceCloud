<template>
  <div
    class="octagon-border my-1"
    style="page-break-after: avoid;"
  >
    <div class="label text-center">
      {{ model.name }}
    </div>
    <div>
      {{ $t('creature.character.printedCharacterSheet.spellList.saveDc') }}: {{ model.dc && model.dc.value }}
    </div>
    <div v-if="model.ability">
      {{ $t('creature.character.printedCharacterSheet.spellList.ability') }}: {{ model.ability }}
    </div>
    <div v-if="model.ability">
      {{ $t('creature.character.printedCharacterSheet.spellList.abilityMod') }}: {{ model.abilityMod }}
    </div>
    <div>
      {{ $t('creature.character.printedCharacterSheet.spellList.attackBonus') }}: {{ model.attackRollBonus && model.attackRollBonus.value }}
    </div>
    <div>
      {{ $t('creature.character.printedCharacterSheet.spellList.maxPrepared') }}: {{ model.maxPrepared && model.maxPrepared.value }}
    </div>
    <property-description
      text
      :model="model.description"
    />
  </div>
</template>

<script lang="js">
import PropertyDescription from '/imports/client/ui/properties/viewers/shared/PropertyDescription.vue';

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
    
  }
}
</script>