<template>
  <div v-if="creature && errors && errors.length">
    <v-btn
      size="small"
      absolute
      right
      color="warning"
      class="mr-4"
      style="margin-top: -20px;"
      @click="expanded = !expanded"
    >
      <v-icon
        v-if="expanded"
        style="color: rgba(0,0,0,0.8);"
      >
        mdi-close
      </v-icon>
      <v-icon
        v-else
        style="color: rgba(0,0,0,0.8);"
      >
        mdi-alert-circle-outline
      </v-icon>
    </v-btn>
    <v-slide-y-transition>
      <div
        v-if="expanded"
        class="character-sheet-errors"
      >
        <template v-for="(error, index) in errors">
          <dependency-loop-error
            v-if="error.type === 'dependencyLoop'"
            :key="index + 'dependencyLoopError'"
            :model="error"
          />
          <v-alert
            v-else-if="error.type === 'warning'"
            :key="index + 'otherError'"
            border="bottom"
            colored-border
            elevation="2"
            type="warning"
          >
            {{ error.details.error }}
          </v-alert>
          <v-alert
            v-else
            :key="index + 'otherError'"
            border="bottom"
            colored-border
            elevation="2"
            type="error"
          >
            {{ error.type }}
          </v-alert>
        </template>
      </div>
    </v-slide-y-transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, inject, onMounted } from 'vue';
import { autorun } from 'vue-meteor-tracker';
import Creatures from '/imports/api/creature/creatures/Creatures';
import DependencyLoopError from '/imports/client/ui/creature/character/errors/DependencyLoopError.vue';
import updateCreature from '/imports/api/creature/creatures/methods/updateCreature';

const props = withDefaults(defineProps<{
  creatureId?: string;
}>(), {
  creatureId: undefined,
});

const context = inject('context', {} as any);

const expanded = ref(false);

const { result: creature } = autorun(() => {
  if (!props.creatureId) return undefined;
  return Creatures.findOne(props.creatureId, { fields: { computeErrors: 1, settings: 1 } });
});

const errors = computed(() => {
  if (!creature.value || !creature.value.computeErrors) return [];
  return creature.value.computeErrors;
});

watch(expanded, async (value) => {
  if (context.editPermission === false) return;
  try {
    await updateCreature.callAsync({
      _id: props.creatureId,
      path: ['settings', 'hideCalculationErrors'],
      value: !value || null,
    });
  } catch (error) {
    console.error(error);
  }
});

onMounted(() => {
  expanded.value = !creature.value?.settings?.hideCalculationErrors;
});
</script>

<style>
</style>
