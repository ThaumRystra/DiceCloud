<template>
  <div
    class="octagon-border my-1"
    style="page-break-after: avoid;"
  >
    <div class="label text-center">
      {{ model.name }}
    </div>
    <div>
      {{ $t('PrintedSpellList.rWBpTd-TcsU92Nie_i2G7', [model.dc && model.dc.value]) }}
    </div>
    <div v-if="model.ability">
      {{ $t('PrintedSpellList.XTB6WZwo91aavGzwnt5J7', [model.ability]) }}
    </div>
    <div v-if="model.ability">
      {{ $t('PrintedSpellList.u0S47qyExcVB5rY9sEGk-', [model.abilityMod]) }}
    </div>
    <div>
      {{ $t('PrintedSpellList.PE9H9_BfnSavYtCbs3TqA', [model.attackRollBonus && model.attackRollBonus.value]) }}
    </div>
    <div>
      {{ $t('PrintedSpellList.uL7BSeWd2J4DB_nDSh7vW', [model.maxPrepared && model.maxPrepared.value]) }}
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