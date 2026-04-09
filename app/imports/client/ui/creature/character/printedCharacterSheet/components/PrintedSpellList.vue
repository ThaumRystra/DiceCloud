<template>
  <div
    class="octagon-border my-1"
    style="page-break-after: avoid;"
  >
    <div class="label text-center">
      {{ model.name }}
    </div>
    <div>
      Spell Save DC: {{ model.dc && model.dc.value }}
    </div>
    <div v-if="model.ability">
      Spell casting ability: {{ model.ability }}
    </div>
    <div v-if="model.ability">
      Spell casting ability modifier: {{ model.abilityMod }}
    </div>
    <div>
      Spell Attack Bonus: {{ model.attackRollBonus && model.attackRollBonus.value }}
    </div>
    <div>
      Maximum prepared spells: {{ model.maxPrepared && model.maxPrepared.value }}
    </div>
    <property-description
      text
      :model="model.description"
    />
  </div>
</template>

<script setup lang="ts">
import PropertyDescription from '/imports/client/ui/properties/viewers/shared/PropertyDescription.vue';

const props = defineProps<{ model: Record<string, any> }>();
</script>
