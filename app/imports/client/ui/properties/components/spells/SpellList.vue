<template lang="html">
  <v-list
    two-line
    dense
    class="spell-list"
  >
    <template v-for="spell in computedSpells">
      <v-subheader
        v-if="spell.isSubheader"
        :key="`${spell.level}-header`"
        class="item"
      >
        {{ spell.level === 0 ? 'Cantrips' : `Level ${spell.level}` }}
      </v-subheader>
      <spell-list-tile
        v-else
        :key="spell._id"
        class="item"
        :disabled="context.editPermission === false"
        :data-id="`spell-list-tile-${spell._id}`"
        :model="spell"
        :preparing-spells="preparingSpells"
        @click="clickProperty(spell._id)"
      />
    </template>
  </v-list>
</template>

<script lang="js">
import SpellListTile from '/imports/client/ui/properties/components/spells/SpellListTile.vue';
import spellsWithSubheaders from '/imports/client/ui/properties/components/spells/spellsWithSubheaders';

export default {
  components: {
    SpellListTile,
  },
  inject: {
    context: { default: {} }
  },
  props: {
    spells: {
      type: Array,
      default: () => [],
    },
    preparingSpells: Boolean,
  },
  computed: {
    levels() {
      let levels = new Set();
      this.spells.forEach(spell => levels.add(spell.level));
      return levels;
    },
    computedSpells() {
      return spellsWithSubheaders(this.spells);
    },
  },
  methods: {
    clickProperty(_id) {
      this.$store.commit('pushDialogStack', {
        component: 'creature-property-dialog',
        elementId: `spell-list-tile-${_id}`,
        data: { _id },
      });
    },
  }
}
</script>
