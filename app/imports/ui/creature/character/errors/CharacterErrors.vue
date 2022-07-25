<template>
  <div
    v-if="creature && creature.computeErrors"
    class="character-sheet-errors"
  >
    <template v-for="(error, index) in creature.computeErrors">
      <dependency-loop-error
        v-if="error.type === 'dependencyLoop'"
        :key="index + 'dependencyLoopError'"
        :model="error"
      />
      <v-alert
        v-else
        :key="index + 'otherError'"
        outlined
        dense
        type="error"
      >
        {{ error.type }}
      </v-alert>
    </template>
  </div>
</template>

<script lang="js">
import Creatures from '/imports/api/creature/creatures/Creatures.js';
import DependencyLoopError from '/imports/ui/creature/character/errors/DependencyLoopError.vue';

export default {
  components: {
    DependencyLoopError,
  },
  props: {
    creatureId: {
      type: String,
      default: undefined,
    }
  },
  meteor: {
    creature() {
      if (!this.creatureId) return;
      return Creatures.findOne(this.creatureId, {fields: {computeErrors: 1}});
    }
  },
  computed: {
    errors() {
      if (!this.creature || !this.creature.computeErrors) return;
      return this.creature.computeErrors.map(error => {
        error.text = error.type;
        if (error.type === 'dependencyLoop') {
          error.text = 'Dependency Loop Detected';
        }
      });
    }
  },
}
</script>

<style>
</style>
