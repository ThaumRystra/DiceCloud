<template>
  <div v-if="creature && errors && errors.length">
    <v-btn
      fab
      small
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

<script lang="js">
import Creatures from '/imports/api/creature/creatures/Creatures';
import DependencyLoopError from '/imports/client/ui/creature/character/errors/DependencyLoopError.vue';
import updateCreature from '/imports/api/creature/creatures/methods/updateCreature';

export default {
  components: {
    DependencyLoopError,
  },
  inject: {
    context: { default: {} },
    theme: {
      default: {
        isDark: false,
      },
    },
  },
  props: {
    creatureId: {
      type: String,
      default: undefined,
    }
  },
  data() { return {
    expanded: false,
  }},
  meteor: {
    creature() {
      if (!this.creatureId) return;
      return Creatures.findOne(this.creatureId, {fields: {computeErrors: 1, settings: 1}});
    }
  },
  computed: {
    errors() {
      if (!this.creature || !this.creature.computeErrors) return [];
      return this.creature.computeErrors;
    },
  },
  watch: {
    expanded(value) {
      if (this.context.editPermission === false) return;
      updateCreature.call({
        _id: this.creatureId,
        path: ['settings', 'hideCalculationErrors'],
        value: !value || null,
      }, (error) => {
        if (error){
          console.error(error);
        }
      });
    },
  },
  mounted() {
    this.expanded = !this.creature.settings.hideCalculationErrors;
  },
}
</script>

<style>
</style>
