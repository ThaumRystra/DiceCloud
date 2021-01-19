<template lang="html">
  <dialog-base>
    <template slot="toolbar">
      <v-toolbar-title>
        Cast a Spell
      </v-toolbar-title>
      <v-spacer />
      <v-input icon="search" />
    </template>
    <split-list-layout>
      <template slot="left">
        <div
          key="slot-title"
          class="title my-3"
        >
          Slot
        </div>
        <v-list-tile
          v-if="!(selectedSpell && selectedSpell.level > 0)"
          key="cantrip-dummy-slot"
          class="spell-slot-list-tile"
          :class="{ 'primary--text': selectedSlotId === undefined}"
          @click="selectedSlotId = undefined"
        >
          <v-list-tile-content>
            <v-list-tile-title class="title">
              Cantrip
            </v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
        <spell-slot-list-tile
          v-for="spellSlot in spellSlots"
          :key="spellSlot._id"
          :model="spellSlot"
          :class="{ 'primary--text': selectedSlotId === spellSlot._id }"
          hide-cast-button
          @click="selectedSlotId = spellSlot._id"
        />
      </template>
      <template slot="right">
        <div
          key="spell-title"
          class="title my-3"
        >
          Spell
        </div>
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
            hide-handle
            :class="{ 'primary--text': selectedSpellId === spell._id}"
            :model="spell"
            @click="selectedSpellId = spell._id"
          />
        </template>
      </template>
    </split-list-layout>
    <template slot="actions">
      <v-spacer />
      <v-btn
        flat
        @click="$store.dispatch('popDialogStack')"
      >
        Cancel
      </v-btn>
      <v-btn
        flat
        :disabled="!canCast"
        class="primary--text"
        @click="$store.dispatch('popDialogStack', {
          spellId: selectedSpellId,
          slotId: selectedSlotId,
        })"
      >
        Cast
      </v-btn>
    </template>
  </dialog-base>
</template>

<script>
import DialogBase from '/imports/ui/dialogStack/DialogBase.vue';
import SplitListLayout from '/imports/ui/properties/components/attributes/SplitListLayout.vue';
import CreatureProperties from '/imports/api/creature/CreatureProperties.js';
import spellsWithSubheaders from '/imports/ui/properties/components/spells/spellsWithSubheaders.js';
import SpellSlotListTile from '/imports/ui/properties/components/attributes/SpellSlotListTile.vue';
import SpellListTile from '/imports/ui/properties/components/spells/SpellListTile.vue';

export default {
  components: {
    DialogBase,
    SplitListLayout,
    SpellSlotListTile,
    SpellListTile,
  },
  props: {
    creatureId: {
      type: String,
      required: true,
    },
    slotId: {
      type: String,
      default: undefined,
    },
    spellId: {
      type: String,
      default: undefined,
    },
  },
  data(){ return {
    searchString: undefined,
    selectedSlotId: this.slotId,
    selectedSpellId: this.spellId,
  }},
  computed: {
    computedSpells(){
      return spellsWithSubheaders(this.spells);
    },
    canCast(){
      let spell = this.selectedSpell;
      let slot = this.selectedSlot;
      if (!spell) return false;
      if (spell.level === 0){
        return this.selectedSlotId === undefined;
      } else if (!slot) {
        return false
      } else {
        return slot.spellSlotLevelValue >= spell.level;
      }
    }
  },
  watch: {
    selectedSpell(spell){
      if (!spell) return;
      if(spell.level === 0){
        this.selectedSlotId = undefined;
      }
    },
    selectedSlot(slot){
      if (!slot) return;
      if (!this.selectedSpell) return;
      if(slot.spellSlotLevelValue > 0 && this.selectedSpell.level === 0){
        this.selectedSpellId = undefined;
      }
    },
  },
  meteor: {
    spells(){
      let slotLevel = this.selectedSlot && this.selectedSlot.spellSlotLevelValue || 0;
      return CreatureProperties.find({
        'ancestors.id': this.creatureId,
        removed: {$ne: true},
        inactive: {$ne: true},
        prepared: true,
        level: {$lte: slotLevel},
      }, {
        sort: {order: 1}
      });
    },
    spellSlots(){
      let filter = {
        'ancestors.id': this.creatureId,
        type: 'attribute',
        attributeType: 'spellSlot',
        removed: {$ne: true},
        inactive: {$ne: true},
        currentValue: {$gte: 1},
      };
      if (this.selectedSpell){
        filter.spellSlotLevelValue = {$gte: this.selectedSpell.level};
      }
      return CreatureProperties.find(filter, {
        sort: {order: 1},
      });
    },
    selectedSlot(){
      return CreatureProperties.findOne(this.selectedSlotId);
    },
    selectedSpell(){
      return CreatureProperties.findOne(this.selectedSpellId);
    }
  },
}
</script>

<style lang="css" scoped>
  .v-list {
    flex-basis: 200px;
  }
  .v-list.spells {
    flex-grow: 1;
  }
</style>
