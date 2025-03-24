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
            v-for="filter in booleanFilters"
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
        <v-list-item-group
          key="slot-list"
          v-model="selectedSlotId"
        >
          <v-list-item
            key="cantrip-dummy-slot"
            class="spell-slot-list-tile"
            :class="{ 'primary--text': selectedSlotId === 'no-slot' }"
            value="no-slot"
            :disabled="!canCastSpellWithSlot(selectedSpell, 'no-slot')"
            @click="selectedSlotId = 'no-slot'"
          >
            <v-list-item-content>
              <v-list-item-title>
                Cast without spell slot
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item
            key="ritual-dummy-slot"
            class="spell-slot-list-tile"
            :class="{ 'primary--text': selectedSlotId === 'ritual' }"
            value="ritual"
            :disabled="!canCastSpellWithSlot(selectedSpell, 'ritual')"
            @click="selectedSlotId = 'ritual'"
          >
            <v-list-item-content>
              <v-list-item-title>
                Cast as ritual
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <spell-slot-list-tile
            v-for="spellSlot in spellSlots"
            :key="spellSlot._id"
            :model="spellSlot"
            :class="{ 'primary--text': selectedSlotId === spellSlot._id }"
            :value="spellSlot._id"
            :disabled="!canCastSpellWithSlot(selectedSpell, spellSlot._id, spellSlot)"
            view-only
            @click="selectedSlotId = spellSlot._id"
          />
        </v-list-item-group>
      </template>
      <template slot="right">
        <div
          key="spell-title-right"
          class="text-h6 my-3"
        >
          Spell
        </div>
        <v-list-item-group
          key="slot-list-right"
          v-model="selectedSpellId"
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
              hide-handle
              show-info-button
              :model="spell"
              :value="spell._id"
              :class="{ 'primary--text': selectedSpellId === spell._id }"
              :disabled="!canCastSpellWithSlot(spell, selectedSlotId, selectedSlot)"
              @show-info="spellDialog(spell._id)"
            />
          </template>
        </v-list-item-group>
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
        class="mx-2 px-4"
        color="primary"
        data-id="cast-spell-dialog-btn"
        @click="cast"
      >
        Cast
      </v-btn>
    </template>
  </dialog-base>
</template>

<script lang="js">
import { assertEditPermission } from '/imports/api/creature/creatures/creaturePermissions';
import DialogBase from '/imports/client/ui/dialogStack/DialogBase.vue';
import SplitListLayout from '/imports/client/ui/properties/components/attributes/SplitListLayout.vue';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties';
import spellsWithSubheaders from '/imports/client/ui/properties/components/spells/spellsWithSubheaders';
import SpellSlotListTile from '/imports/client/ui/properties/components/attributes/SpellSlotListTile.vue';
import SpellListTile from '/imports/client/ui/properties/components/spells/SpellListTile.vue';
import { find } from 'lodash';
import doAction from '/imports/client/ui/creature/actions/doAction';
import { snackbar } from '/imports/client/ui/components/snackbars/SnackbarQueue';

const slotFilter = {
  type: 'attribute',
  attributeType: 'spellSlot',
  removed: { $ne: true },
  inactive: { $ne: true },
  overridden: { $ne: true },
  'spellSlotLevel.value': { $gte: 1 },
};

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
  data() {
    return {
      searchString: undefined,
      selectedSlotId: this.slotId,
      selectedSpellId: this.spellId,
      selectedSlot: undefined,
      selectedSpell: undefined,
      searchValue: undefined,
      searchError: undefined,
      filterMenuOpen: false,
      booleanFilters: {
        verbal: { name: 'Verbal', enabled: false, value: true },
        somatic: { name: 'Somatic', enabled: false, value: true },
        material: { name: 'Material', enabled: false, value: true },
        concentration: { name: 'Concentration', enabled: false, value: true },
        ritual: { name: 'Ritual', enabled: false, value: true },
      },
    }
  },
  reactiveProvide: {
    name: 'context',
    include: ['editPermission'],
  },
  computed: {
    computedSpells() {
      return spellsWithSubheaders(this.spells);
    },
    canCast() {
      if (!this.selectedSpell || !this.selectedSlotId) return false;
      return this.canCastSpellWithSlot(
        this.selectedSpell, this.selectedSlotId, this.selectedSlot
      );
    },
    filtersApplied() {
      for (let key in this.booleanFilters) {
        if (this.booleanFilters[key].enabled) {
          return true;
        }
      }
      return false;
    },
  },
  watch: {
    selectedSpellId: {
      handler(spellId) {
        this.selectedSpell = CreatureProperties.findOne(spellId)
      },
      immediate: true
    },
    selectedSpell: {
      handler(spell) {
        if (!spell) return;
        if (this.selectedSlotId && this.canCastSpellWithSlot(
          spell, this.selectedSlotId, this.selectedSlot
        )) return;
        if (
          (spell.level === 0 || spell.castWithoutSpellSlots)
        ) {
          this.selectedSlotId = 'no-slot';
        } else {
          const newSlot = find(
            CreatureProperties.find({
              'root.id': this.creatureId,
              ...slotFilter
            }, {
              sort: { 'spellSlotLevel.value': 1, order: 1 },
            }).fetch(),
            slot => {
              return this.canCastSpellWithSlot(spell, slot._id, slot)
            }
          );
          if (newSlot) {
            this.selectedSlotId = newSlot._id;
          } else if (spell.ritual) {
            this.selectedSlotId = 'ritual';
          }
        }
      },
      immediate: true,
    },
    selectedSlotId: {
      handler(slotId) {
        this.selectedSlot = CreatureProperties.findOne(slotId);
      },
      immediate: true
    },
    selectedSlot: {
      handler(slot) {
        if (!slot) return;
        if (!this.selectedSpell) return;
        if (this.selectedSpell.level > slot.spellSlotLevel.value) {
          this.selectedSpellId = undefined;
        }
      },
      immediate: true,
    },
  },
  mounted() {
    if (this.selectedSpellId) {
      this.$vuetify.goTo('.spell.v-list-item--active', { container: '.right' });
    }
  },
  methods: {
    clearBooleanFilters() {
      for (let key in this.booleanFilters) {
        this.booleanFilters[key].enabled = false;
      }
    },
    spellDialog(_id) {
      this.$store.commit('pushDialogStack', {
        component: 'creature-property-dialog',
        elementId: `spell-info-btn-${_id}`,
        data: { _id },
      });
    },
    searchChanged(val, ack) {
      this.searchValue = val;
      setTimeout(ack, 200);
    },
    canCastSpellWithSlot(spell, slotId, slot) {
      if (slot && !slot.value) return false;
      if (!spell) return true;
      if (!slotId) return true;
      if (
        spell.castWithoutSpellSlots &&
        spell.insufficientResources
      ) return false;
      if (spell.ritual && slotId === 'ritual') return true;
      if (!spell.level || spell.castWithoutSpellSlots) {
        // Cantrips and no-slot spells
        return slotId && slotId === 'no-slot'
      } else {
        // Levelled spells
        return slotId !== 'no-slot' && slot && spell && (
            spell.level <= slot.spellSlotLevel.value
          );
      }
    },
    cast() {
      const spellId = this.selectedSpellId;
      let slotId = this.selectedSlotId;
      const ritual = slotId === 'ritual';
      const withoutSpellSlot = slotId === 'no-slot';
      if (ritual || withoutSpellSlot) slotId = undefined;
      const $store = this.$store;
      doAction({
        creatureId: this.creatureId,
        $store,
        task: {
          subtaskFn: 'castSpell',
          prop: CreatureProperties.findOne(spellId),
          params: {
            slotId,
            ritual,
            withoutSpellSlot,
          },
        },
        elementId: 'cast-spell-dialog-btn',
        replaceDialog: true,
      }).catch(error => {
        snackbar({ text: error.reason || error.message || error.toString() });
        console.error(error);
      });
    }
  },
  meteor: {
    editPermission(){
      try {
        assertEditPermission(this.creatureId, Meteor.userId());
        return true;
      } catch (e) {
        return false;
      }
    },
    spells() {
      let filter = {
        'root.id': this.creatureId,
        removed: { $ne: true },
        inactive: { $ne: true },
        $or: [
          { prepared: true },
          { alwaysPrepared: true },
        ],
      };

      // Apply the filters from the filter menu
      for (let key in this.booleanFilters) {
        if (this.booleanFilters[key].enabled) {
          let value = this.booleanFilters[key].value;
          if (key === 'material') {
            filter[key] = { $exists: this.booleanFilters[key].value };
          } else {
            filter[key] = value ? true : { $ne: true };
          }
        }
      }
      // Apply the search string to the name field
      if (this.searchValue) {
        filter.name = {
          $regex: this.searchValue.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'),
          $options: 'i'
        };
      }
      return CreatureProperties.find(filter, {
        sort: { order: 1 }
      });
    },
    spellSlots() {
      return CreatureProperties.find({
        'root.id': this.creatureId,
        ...slotFilter
      }, {
        sort: { 'spellSlotLevel.value': 1, order: 1 },
      });
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
