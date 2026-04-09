<template lang="html">
  <v-list-item
    class="inline-proficiency layout align-center"
    :class="{'text-disabled': model.overridden}"
    density="compact"
    @click="click"
  >
    <div class="effect-icon">
      <proficiency-icon
        :value="model.proficiency"
        class="prof-icon"
      />
    </div>
    <v-list-item-title>
      <span
        class="effect-value mr-2"
      >
        {{ displayedValue }}
      </span>
      {{ displayedText }}
    </v-list-item-title>
  </v-list-item>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { autorun } from 'vue-meteor-tracker';
import ProficiencyIcon from '/imports/client/ui/properties/shared/ProficiencyIcon.vue';
import numberToSignedString from '/imports/api/utility/numberToSignedString';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties';

const props = defineProps<{
  proficiencyId: string;
}>();

const emit = defineEmits(['click']);

const { result: model } = autorun(() =>
  CreatureProperties.findOne(props.proficiencyId)
);

const displayedText = computed(() =>
  model.value?.name || (model.value?.type === 'proficiency' ? 'Proficiency' : 'Skill')
);

const displayedValue = computed(() => numberToSignedString(model.value?.value));

function click(e: Event) {
  emit('click', e);
}
</script>

<style lang="css" scoped>
  .icon, .effect-icon {
    min-width: 20px;
  }
  .icon {
    color: inherit !important;
  }
  .net-effect {
    flex-grow: 0;
    flex-shrink: 0;
  }
  .effect-value {
    min-width: 30px;
    text-align: center;
  }
  .prof-icon {
    width: 24px;
    margin: 0 8px;
  }
</style>
