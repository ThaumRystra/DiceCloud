<template>
  <div class="choice-input">
    <v-card-title>
      {{ target === 'singleTarget' ? 'Target' : 'Targets' }}
    </v-card-title>
    <v-list-item
      v-for="creature in creatures"
      :key="creature._id"
      :class="{
        'text-primary v-list-item--active': value.includes(creature._id),
      }"
      density="compact"
      @click="selectCreature(creature._id)"
    >
      <template #prepend>
        <v-avatar
          :color="value.includes(creature._id) ? 'red darken-1' : creature.color || 'grey'"
          class="text-white"
          style="transition: background 0.3s;"
        >
          <v-fade-transition leave-absolute>
            <v-icon v-if="value.includes(creature._id)">
              mdi-check
            </v-icon>
            <img
              v-else-if="creature.avatarPicture"
              :src="creature.avatarPicture"
              :alt="creature.name"
            >
            <template v-else>
              <span>
                {{ creature.name?.[0] ?? '?' }}
              </span>
            </template>
          </v-fade-transition>
        </v-avatar>
      </template>
      <v-list-item-title>
        {{ creature.name }}
      </v-list-item-title>
    </v-list-item>
    <v-btn
      size="large"
      variant="text"
      color="accent"
      class="mt-4"
      style="width: 100%"
      @click="$emit('continue');"
    >
      {{ !value.length ? 'No target' : 'Continue' }}
    </v-btn>
  </div>
</template>

<script setup lang="ts">
import { autorun } from 'vue-meteor-tracker';
import Creatures from '/imports/api/creature/creatures/Creatures';

const props = withDefaults(defineProps<{
  value: string[];
  target?: string;
  tabletopId: string;
}>(), {
  target: 'multipleTargets',
});

const emit = defineEmits(['input', 'continue']);

const { result: creatures } = autorun(() =>
  Creatures.find({
    tabletopId: props.tabletopId,
  }, {
    sort: { name: 1 },
  }).fetch()
);

function selectCreature(id: string) {
  let newValue: string[];
  if (props.value.includes(id)) {
    newValue = props.value.filter((creatureId) => creatureId !== id);
  } else if (props.target === 'singleTarget') {
    newValue = [id];
  } else {
    newValue = [...props.value, id];
  }
  emit('input', newValue);
  if (props.target === 'singleTarget') {
    emit('continue');
  }
}
</script>
