<template lang="html">
  <dialog-base>
    <template slot="toolbar">
      <v-toolbar-title>
        Cast a Spell
      </v-toolbar-title>
      <v-spacer />
      <text-field
        ref="focusFirst"
        label="Name"
        prepend-inner-icon="mdi-magnify"
        regular
        hide-details
        :value="searchValue"
        :error-messages="searchError"
        :debounce="200"
        @change="searchChanged"
      />
      <v-menu
        v-model="filterMenuOpen"
        left
        :close-on-content-click="false"
      >
        <template #activator="{ on }">
          <v-btn
            icon
            :class="{'primary--text': filtersApplied}"
            v-on="on"
          >
            <v-icon>mdi-filter</v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-list-item
            v-for="filter in activeBooleanFilters"
            :key="filter.name"
            style="height: 52px;"
          >
            <v-checkbox
              v-model="filter.enabled"
              style="flex-grow: 0; margin-right: 8px;"
            />
            <v-switch
              v-model="filter.value"
              :disabled="!filter.enabled"
              :label="filter.name"
            />
          </v-list-item>
          <div class="layout">
            <v-btn
              text
              @click="clearBooleanFilters"
            >
              Clear
            </v-btn>
            <v-spacer />
            <v-btn
              text
              class="primary--text"
              @click="filterMenuOpen = false"
            >
              Done
            </v-btn>
          </div>
        </v-list>
      </v-menu>
    </template>
    <split-list-layout>
      <template slot="left">
        <div
          key="slot-title"
          class="text-h6 my-3"
        >
          Slot
        </div>
        <v-list-item
          v-if="!(selectedSpell && selectedSpell.level > 0) && !castRitual"
          key="cantrip-dummy-slot"
          class="spell-slot-list-tile"
          :class="{ 'primary--text': selectedSlotId === undefined}"
          @click="selectedSlotId = undefined"
        >
          <v-list-item-content>
            <v-list-item-title class="text-h6">
              Cantrip
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <spell-slot-list-tile
          v-for="spellSlot in spellSlots"
          :key="spellSlot._id"
          :model="spellSlot"
          :class="{ 'primary--text': selectedSlotId === spellSlot._id }"
          hide-cast-button
          @click="selectedSlotId = spellSlot._id"
        />
        <v-list-item key="ritual-dummy-slot">
          <v-checkbox
            v-model="castRitual"
            label="Cast as a ritual"
          ></v-checkbox>
        </v-list-item>
      </template>
      <template slot="right">
        <div
          key="spell-title"
          class="text-h6 my-3"
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
            show-info-button
            :class="{ 'primary--text': selectedSpellId === spell._id}"
            :model="spell"
            @click="selectedSpellId = spell._id"
            @show-info="spellDialog(spell._id)"
          />
        </template>
      </template>
    </split-list-layout>
    <template slot="actions">
      <v-spacer />
      <v-btn
        text
        @click="$store.dispatch('popDialogStack')"
      >
        Cancel
      </v-btn>
      <v-btn
        text
        :disabled="!canCast"
        class="primary--text"
        @click="$store.dispatch('popDialogStack', {
          spellId: selectedSpellId,
          slotId: selectedSlotId,
          castRitual: castRitual
        })"
      >
        Cast
      </v-btn>
    </template>
  </dialog-base>
</template>

<script lang="js">
import DialogBase from '/imports/ui/dialogStack/DialogBase.vue';
import SplitListLayout from '/imports/ui/properties/components/attributes/SplitListLayout.vue';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties.js';
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
    searchValue: undefined,
    searchError: undefined,
    filterMenuOpen: false,
    booleanFilters: {
      verbal: {name: 'Verbal', enabled: false, value: false},
      somatic: {name: 'Somatic', enabled: false, value: false},
      material: {name: 'Material', enabled: false, value: false},
      concentration: {name: 'Concentration', enabled: false, value: false},
      ritual: {name: 'Ritual', enabled: false, value: false},
    },
    castRitual: false
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
    },
    filtersApplied(){
      for (let key in this.booleanFilters){
        if (this.booleanFilters[key].enabled){
          return true;
        }
      }
      return false;
    },
    activeBooleanFilters() {
      let that = this;
      return Object.keys(this.booleanFilters).reduce(function (filtered, key) {
        if (key !== 'ritual' || !that.castRitual)
          filtered[key] = that.booleanFilters[key];
        return filtered;
      }, {});
    },
  },
  watch: {
    selectedSpell(spell){
      if (!spell) return;
      if(spell.level === 0){
        this.selectedSlotId = undefined;
      }
      if(this.castRitual) {
        for(let sp in this.spellSlots) {
          if(spell.level === this.spellSlots[sp].spellSlotLevelValue)
            this.selectedSlotId = this.spellSlots[sp]._id;
        }
      }
    },
    selectedSlot(slot){
      if (!slot) return;
      if (!this.selectedSpell) return;
      if(slot.spellSlotLevelValue > 0 && this.selectedSpell.level === 0){
        this.selectedSpellId = undefined;
      }
      if(this.castRitual && slot.spellSlotLevelValue !== this.selectedSpell.level) {
        this.selectedSpellId = undefined;
      }
    }
  },
  methods: {
    clearBooleanFilters(){
      for (let key in this.booleanFilters){
        this.booleanFilters[key].enabled = false;
      }
    },
    spellDialog(_id){
      this.$store.commit('pushDialogStack', {
				component: 'creature-property-dialog',
				elementId: `spell-info-btn-${_id}`,
				data: {_id},
			});
    },
    searchChanged(val, ack){
      this.searchValue = val;
      setTimeout(ack, 200);
    },
  },
  meteor: {
    spellSlots(){
      let filter = {
        'ancestors.id': this.creatureId,
        type: 'attribute',
        attributeType: 'spellSlot',
        removed: {$ne: true},
        inactive: {$ne: true},
      };
      if(!this.castRitual) {
        filter.currentValue = {$gte: 1};
      }
      if (this.selectedSpell && !this.castRitual){
        filter.spellSlotLevelValue = {$gte: this.selectedSpell.level};
      }
      return CreatureProperties.find(filter, {
        sort: {order: 1},
      });
    },
    spells(){
      let slotLevel = this.selectedSlot && this.selectedSlot.spellSlotLevelValue || 0;

      // Any spell of any valid slot can be cast as a ritual
      if(this.castRitual) {
        let maximumSlot = CreatureProperties.findOne({
          'ancestors.id': this.creatureId,
          type: 'attribute',
          attributeType: 'spellSlot',
          removed: {$ne: true},
          inactive: {$ne: true},
        }, {
          sort: {spellSlotLevelValue: -1}
        });
        if(maximumSlot !== undefined)
          slotLevel = maximumSlot.spellSlotLevelValue;
        else
          slotLevel = 0;
      }

      let filter = {
        'ancestors.id': this.creatureId,
        removed: {$ne: true},
        inactive: {$ne: true},
        level: {$lte: slotLevel},
      };

      // Apply the filters from the filter menu
      for (let key in this.booleanFilters){
        if (this.booleanFilters[key].enabled){
          let value = this.booleanFilters[key].value;
          if (key === 'material'){
            filter[key] = {$exists: this.booleanFilters[key].value};
          } else {
            filter[key] = value ? true: {$ne: true};
          }
        }
      }

      //If we cast a ritual, we need ritual spells; if not, we need prepared ones
      if(this.castRitual)
        filter.ritual = true;
      else {
        filter.$or = [
          {prepared: true},
          {alwaysPrepared: true},
        ];
      }

      // Apply the search string to the name field
      if (this.searchValue){
        filter.name = {
          $regex: this.searchValue.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'),
          $options: 'i'
        };
      }
      return CreatureProperties.find(filter, {
        sort: {order: 1}
      });
    },
    selectedSlot(){
      return CreatureProperties.findOne(this.selectedSlotId);
    },
    selectedSpell(){
      return CreatureProperties.findOne(this.selectedSpellId);
    },
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
