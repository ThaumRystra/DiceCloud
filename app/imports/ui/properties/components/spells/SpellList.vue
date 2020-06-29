<template lang="html">
  <v-list
    two-line
    dense
    class="spell-list"
  >
    <template v-for="level in levels">
      <v-subheader :key="`${level}-header`">
        {{ level === 0 ? 'Cantrips' : `Level ${level}` }}
      </v-subheader>
      <spell-list-tile
        v-for="spell in spellsByLevel[level]"
        :key="spell._id"
        :data-id="`spell-list-tile-${spell._id}`"
        :model="spell"
        @click="clickProperty(spell._id)"
      />
    </template>
  </v-list>
</template>

<script>
import SpellListTile from '/imports/ui/properties/components/spells/SpellListTile.vue';

export default {
  components: {
    SpellListTile,
  },
  props: {
    spells: {
      type: Array,
      default: () => [],
    },
  },
  computed: {
    levels(){
      let levels = new Set();
      this.spells.forEach(spell => levels.add(spell.level));
      return levels;
    },
    spellsByLevel(){
      let spellsByLevel = {};
      this.spells.forEach(spell => {
        if (!spellsByLevel[spell.level]){
          spellsByLevel[spell.level] = [spell];
        } else {
          spellsByLevel[spell.level].push(spell);
        }
      });
      return spellsByLevel;
    },
  },
  methods: {
		clickProperty(_id){
			this.$store.commit('pushDialogStack', {
				component: 'creature-property-dialog',
				elementId: `spell-list-tile-${_id}`,
				data: {_id},
			});
		},
	}
}
</script>

<style lang="css" scoped>
</style>
