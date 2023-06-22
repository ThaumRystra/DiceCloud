<template>
  <v-card data-id="spell-slot-card">
    <v-list
      v-if="spellSlots.length"
      two-line
      subheader
    >
      <v-subheader>Spell Slots</v-subheader>
      <spell-slot-list-tile
        v-for="spellSlot in spellSlots"
        :key="spellSlot._id"
        :model="spellSlot"
        :data-id="`spell-slot-card-${spellSlot._id}`"
        @click="clickProperty({_id: spellSlot._id})"
      />
    </v-list>
    <div
      v-if="hasSpells"
      class="d-flex justify-end"
    >
      <v-btn
        color="accent"
        style="width: 100%;"
        outlined
        @click="castSpell"
      >
        Cast a spell
      </v-btn>
    </div>
  </v-card>
</template>

<script lang="js">
import SpellSlotListTile from '/imports/client/ui/properties/components/attributes/SpellSlotListTile.vue';
import doCastSpell from '/imports/api/engine/actions/doCastSpell.js';
import { snackbar } from '/imports/client/ui/components/snackbars/SnackbarQueue.js';

export default {
  components: {
    SpellSlotListTile,
  },
  props: {
    creatureId: {
      type: String,
      required: true,
    },
    hasSpells: Boolean,
    spellSlots: {
      type: Array,
      default: () => [],
    },
  },
  methods: {
    castSpell() {
      this.$store.commit('pushDialogStack', {
        component: 'cast-spell-with-slot-dialog',
        elementId: 'spell-slot-card',
        data: {
          creatureId: this.creatureId,
        },
        callback({ spellId, slotId, advantage, ritual } = {}) {
          if (!spellId) return;
          doCastSpell.call({
            spellId,
            slotId,
            ritual,
            scope: {
              '~attackAdvantage': { value: advantage },
            },
          }, error => {
            if (!error) return;
            snackbar({ text: error.reason || error.message || error.toString() });
            console.error(error);
          });
        },
      });
    },
    clickProperty({ _id }) {
      this.$store.commit('pushDialogStack', {
        component: 'creature-property-dialog',
        elementId: `spell-slot-card-${_id}`,
        data: { _id },
      });
    },
  }
}
</script>