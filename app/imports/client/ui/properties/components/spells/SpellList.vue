<template lang="html">
  <v-list
    two-line
    dense
    class="spell-list"
  >
    <draggable
      v-model="computedSpells"
      style="min-height: 24px;"
      :group="`spell-list`"
      ghost-class="ghost"
      draggable=".item"
      handle=".handle"
      :animation="200"
      @change="change"
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
    </draggable>
  </v-list>
</template>

<script lang="js">
import draggable from 'vuedraggable';
import SpellListTile from '/imports/client/ui/properties/components/spells/SpellListTile.vue';
import { organizeDoc } from '/imports/api/parenting/organizeMethods';
import spellsWithSubheaders from '/imports/client/ui/properties/components/spells/spellsWithSubheaders';

export default {
  components: {
    draggable,
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
    parentRef: {
      type: Object,
      required: true,
    },
    preparingSpells: Boolean,
  },
  data() {
    return {
      dataSpells: [],
    }
  },
  computed: {
    levels() {
      let levels = new Set();
      this.spells.forEach(spell => levels.add(spell.level));
      return levels;
    },
    computedSpells: {
      get() {
        return spellsWithSubheaders(this.dataSpells);
      },
      set(value) {
        this.dataSpells = value;
      },
    }
  },
  watch: {
    spells(value) {
      this.dataSpells = spellsWithSubheaders(value);
    }
  },
  mounted() {
    this.dataSpells = spellsWithSubheaders(this.spells);
  },
  methods: {
    clickProperty(_id) {
      this.$store.commit('pushDialogStack', {
        component: 'creature-property-dialog',
        elementId: `spell-list-tile-${_id}`,
        data: { _id },
      });
    },
    change({ added, moved }) {
      let event = added || moved;
      if (event) {
        // If this spell is now adjacent to another, set the order accordingly
        let order;
        let before = this.dataSpells[event.newIndex - 1];
        let after = this.dataSpells[event.newIndex + 1];
        if (before && before._id) {
          order = before.order + 0.5;
        } else if (after && after._id) {
          order = after.order - 0.5;
        } else {
          order = -0.5;
        }
        let doc = event.element;
        organizeDoc.callAsync({
          docRef: {
            id: doc._id,
            collection: 'creatureProperties',
          },
          parentRef: this.parentRef,
          order,
        });
      }
    },
  }
}
</script>

<style lang="css" scoped>

</style>
