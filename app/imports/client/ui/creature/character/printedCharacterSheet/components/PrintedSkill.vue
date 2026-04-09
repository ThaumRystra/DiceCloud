<template lang="html">
  <div
    class="printed-skill pl-0 d-flex align-center"
  >
    <div class="d-flex align-center">
      <div
        v-if="!hideModifier"
        class="d-flex align-center"
      >
        <proficiency-icon
          :value="model.proficiency"
          class="prof-icon"
        />
        <div class="prof-mod mr-3 text-right">
          {{ displayedModifier }}
        </div>
        <v-icon
          v-if="model.advantage > 0"
          size="20px"
        >
          mdi-chevron-double-up
        </v-icon>
        <v-icon
          v-if="model.advantage < 0"
          size="20px"
        >
          mdi-chevron-double-down
        </v-icon>
      </div>
      <proficiency-icon
        v-else
        :value="model.proficiency"
        class="prof-icon mr-2"
      />
      <div class="text-truncate">
        {{ model.name }}
        <template v-if="model.conditionalBenefits && model.conditionalBenefits.length">
          *
        </template>
        <template v-if="'passiveBonus' in model">
          ({{ passiveScore }})
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue';
import numberToSignedString from '../../../../../../api/utility/numberToSignedString';
import ProficiencyIcon from '/imports/client/ui/properties/shared/ProficiencyIcon.vue';

const props = defineProps<{
  model: Record<string, any>;
  hideModifier?: boolean;
}>();

const context = inject('context', {} as any);

const displayedModifier = computed(() => {
  if (props.model.fail) return 'fail';
  return numberToSignedString(props.model.value);
});

const passiveScore = computed(() =>
  10 + props.model.value + props.model.passiveBonus
);
</script>

<style lang="css" scoped>
.printed-skill{
  min-height: 0;
}

.prof-icon {
  min-width: 30px;
}

.prof-mod {
  min-width: 24px;
}

.v-icon.v-theme--light {
  color: rgba(0, 0, 0, 0.7) !important;
}
</style>
