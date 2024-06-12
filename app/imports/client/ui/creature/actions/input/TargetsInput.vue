<template>
  <div class="choice-input">
    <creature-list-tile
      v-for="creature in creatures"
      :key="creature._id"
      :model="creature"
      selection
      :selected="value.includes(creature._id)"
      @click="selectCreature(creature._id)"
    />
    <v-btn
      @click="$emit('continue');"
    >
      Done
    </v-btn>
  </div>
</template>

<script lang="js">
import CreatureListTile from '/imports/client/ui/creature/creatureList/CreatureListTile.vue';
import Creatures from '/imports/api/creature/creatures/Creatures';

export default {
  components: {
    CreatureListTile
  },
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