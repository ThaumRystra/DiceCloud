<template>
  <div class="choice-input">
    <v-card-title>
      {{ target === 'singleTarget' ? 'Target' : 'Targets' }}
    </v-card-title>
    <v-list-item
      v-for="creature in creatures"
      :key="creature._id"
      :class="{
        'primary--text v-list-item--active': value.includes(creature._id),
      }"
      dense
      @click="selectCreature(creature._id)"
    >
      <v-list-item-avatar
        :color="value.includes(creature._id) ? 'red darken-1' : creature.color || 'grey'"
        class="white--text"
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
              {{ creature.initial }}
            </span>
          </template>
        </v-fade-transition>
      </v-list-item-avatar>
      <v-list-item-content>
        <v-list-item-title>
          {{ creature.name }}
        </v-list-item-title>
      </v-list-item-content>
    </v-list-item>
    <v-btn
      large
      text
      color="accent"
      class="mt-4"
      style="width: 100%"
      @click="$emit('continue');"
    >
      {{ !value.length ? 'No target' : 'Continue' }}
    </v-btn>
  </div>
</template>

<script lang="js">
import Creatures from '/imports/api/creature/creatures/Creatures';

export default {
  props: {
    value: {
      type: Array,
      required: true,
    },
    target: {
      type: String,
      default: 'multipleTargets',
    },
    tabletopId: {
      type: String,
      required: true
    },
  },
  methods: {
    selectCreature(id) {
      let newValue;
      if (this.value.includes(id)) {
        newValue = this.value.filter((creatureId) => creatureId !== id);
      } else if (this.target === 'singleTarget') {
        newValue = [id];
      } else {
        newValue = [...this.value, id];
      }
      this.$emit('input', newValue);
      // If we are selecting a single creature, we are done
      if (this.target === 'singleTarget') {
        this.$emit('continue');
      }
    },
  },
  meteor: {
    creatures() {
      return Creatures.find({
        tabletopId: this.tabletopId,
      }, {
        sort: {
          name: 1,
        },
      }).fetch();
    }
  }
};
</script>
