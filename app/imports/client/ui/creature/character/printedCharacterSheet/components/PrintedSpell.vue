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
      {{ levelText }} {{ model.school }} {{ model.ritual ? '(ritual)' : '' }}
    </div>
    <div v-else>
      {{ model.school }} cantrip {{ model.ritual ? '(ritual)' : '' }}
    </div>
    <div
      v-if="rollBonus"
    >
      <b>To hit:</b> {{ rollBonus }}
    </div>
    <div>
      <b>Casting time:</b> {{ model.castingTime }}
    </div>
    <div>
      <b>Range:</b> {{ model.range }}
    </div>
    <div>
      <b>Components:</b> {{ spellComponents }}
    </div>
    <div class="mb-4">
      <b>Duration:</b> {{ model.duration }}
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

const levelText = [
  'cantrip', '1st-level', '2nd-level', '3rd-level', '4th-level', '5th-level',
  '6th-level', '7th-level', '8th-level', '9th-level'
];

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
      return levelText[this.model.level] || `level ${this.model.level}`;
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
