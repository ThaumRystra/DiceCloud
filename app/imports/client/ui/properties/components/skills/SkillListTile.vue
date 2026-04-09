<template lang="html">
  <v-list-item
    class="skill-list-tile pl-0"
    style="min-height: 36px;"
    v-on="hasClickListener ? {click} : {}"
  >
    <v-list-item-title class="d-flex align-center">
        <v-btn
          v-if="!hideModifier"
          variant="text"
          rounded="0"
          :loading="checkLoading"
          :disabled="!context.editPermission"
          :data-id="`check-btn-${model._id}`"
          class="pl-3 pr-2 prof-mod mr-1 flex-shrink-0"
          @click.stop="check"
        >
          <proficiency-icon
            :value="model.proficiency"
            class="prof-icon"
          />
          <div class="prof-mod">
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
        </v-btn>
        <proficiency-icon
          v-else
          :value="model.proficiency"
          class="prof-icon ml-3 mr-2"
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
      </v-list-item-title>
  </v-list-item>
</template>

<script setup lang="ts">
import { ref, computed, useAttrs, inject } from 'vue';
import { useStore } from 'vuex';
import ProficiencyIcon from '/imports/client/ui/properties/shared/ProficiencyIcon.vue';
import numberToSignedString from '/imports/api/utility/numberToSignedString';
import doAction from '/imports/client/ui/creature/actions/doAction';
import { snackbar } from '/imports/client/ui/components/snackbars/SnackbarQueue';

const props = withDefaults(defineProps<{
  model: Record<string, any>;
  hideModifier?: boolean;
}>(), {
  hideModifier: false,
});

const emit = defineEmits(['click']);
const store = useStore();
const context = inject('context', {} as any);
const attrs = useAttrs();

const checkLoading = ref(false);

const displayedModifier = computed(() => {
  const mod = props.model.value;
  if (props.model.fail) {
    return 'fail';
  } else {
    return numberToSignedString(mod);
  }
});

const hasClickListener = computed(() => !!attrs.onClick);
const passiveScore = computed(() => 10 + props.model.value + props.model.passiveBonus);

function click(e: Event) {
  emit('click', e);
}

async function check() {
  checkLoading.value = true;
  try {
    await doAction({
      creatureId: props.model.root.id,
      $store: store,
      elementId: `check-btn-${props.model._id}`,
      task: {
        subtaskFn: 'check',
        targetIds: [props.model.root.id],
        advantage: props.model.advantage,
        skillVariableName: props.model.variableName,
        abilityVariableName: props.model.ability,
        dc: null,
      },
    });
  } catch (error: any) {
    snackbar({ text: error.reason || error.message || error.toString() });
    console.error(error);
  } finally {
    checkLoading.value = false;
  }
}
</script>

<style lang="css" scoped>
.prof-icon {
  min-width: 30px;
}

.prof-mod {
  min-width: 32px;
}

.v-icon.v-theme--light {
  color: rgba(0, 0, 0, 0.54) !important;
}
</style>
