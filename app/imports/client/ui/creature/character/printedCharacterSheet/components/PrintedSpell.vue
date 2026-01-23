<template lang="html">
  <div
    class="double-border"
  >
    <div class="d-flex align-center mb-2">
      <div class="spell-level">
        <div
          v-if="model.level"
          class="spell-level-number"
        >
          {{ romanLevel }}
        </div>
      </div>
      <div class="spell-title text-center flex-grow-1">
        {{ model.name || propertyName }}
      </div>
      <div class="avatar">
        <property-icon
          :model="model"
          color="rgba(0,0,0,0.7)"
        />
      </div>
    </div>
    <div v-if="model.level">
      {{ levelText }} {{ model.school }} {{ model.ritual ? $t('creature.character.printedCharacterSheet.spell.ritual') : '' }}
    </div>
    <div v-else>
      {{ model.school }} {{ $t('creature.character.printedCharacterSheet.spell.level.cantrip') }} {{ model.ritual ? $t('creature.character.printedCharacterSheet.spell.ritual') : '' }}
    </div>
    <div
      v-if="rollBonus"
    >
      <b>{{ $t('creature.character.printedCharacterSheet.spell.toHit') }}:</b> {{ rollBonus }}
    </div>
    <div>
      <b>{{ $t('creature.character.printedCharacterSheet.spell.castingTime') }}:</b> {{ model.castingTime }}
    </div>
    <div>
      <b>{{ $t('creature.character.printedCharacterSheet.spell.range') }}:</b> {{ model.range }}
    </div>
    <div>
      <b>{{ $t('creature.character.printedCharacterSheet.spell.components') }}:</b> {{ spellComponents }}
    </div>
    <div class="mb-4">
      <b>{{ $t('creature.character.printedCharacterSheet.spell.duration') }}:</b> {{ model.duration }}
    </div>
    <property-description
      text
      :model="model.summary"
    />
    <property-description
      text
      :model="model.description"
    />
  </div>
</template>

<script lang="js">
import PropertyIcon from '/imports/client/ui/properties/shared/PropertyIcon.vue';
import PropertyDescription from '/imports/client/ui/properties/viewers/shared/PropertyDescription.vue';
import numberToSignedString from '/imports/api/utility/numberToSignedString';
import romanize from '/imports/client/ui/utility/romanize';



export default {
  components: {
    PropertyIcon,
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
      // return levelText[this.model.level] || `level ${this.model.level}`;
      const lvl = this.model.level;
      if (lvl >= 1 && lvl <= 9) return this.$t(`creature.character.printedCharacterSheet.spell.level.${lvl}`);
      return this.$t('creature.character.printedCharacterSheet.spell.level.generic', { level: lvl });
    },
    romanLevel() {
      return romanize(this.model.level) || this.model.level;
    },
    rollBonus() {
      if (!this.model.attackRoll) return;
      return numberToSignedString(this.model.attackRoll.value);
    },
    spellComponents() {
      let components = [];
      if (this.model.concentration) components.push('C');
      if (this.model.verbal) components.push('V');
      if (this.model.somatic) components.push('S');
      if (this.model.material) components.push(`M (${this.model.material})`);
      return components.join(', ');
    },
  }
}
</script>

<style lang="css" scoped>
.spell-level {
  width: 24px;
}
.spell-level-number {
  font-size: 18pt;
}
.avatar {
  min-width: 24px;
  min-height: 24px;
  line-height: 24px;
}
.spell-title {
  font-size: 14pt;
  font-weight: 600;
  min-height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-variant: all-small-caps;
}
</style>
