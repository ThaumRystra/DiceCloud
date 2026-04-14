<template lang="html">
  <div>
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
      <template #activator="{ props }">
        <v-btn
          icon
          :class="{ 'text-primary': filtersApplied }"
          v-bind="props"
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
            variant="text"
            @click="clearBooleanFilters"
          >
            Clear
          </v-btn>
          <v-spacer />
          <v-btn
            variant="text"
            class="text-primary"
            @click="filterMenuOpen = false"
          >
            Done
          </v-btn>
        </div>
      </v-list>
    </v-menu>
    <split-list-layout>
      <template #left>
        <div
          key="slot-title"
          class="text-h6 my-3"
        >
          Slot
        </div>
        <v-list-item
          key="cantrip-dummy-slot"
          class="spell-slot-list-tile"
          :class="{ 'text-primary': selectedSlotId === 'no-slot' }"
          value="no-slot"
          :disabled="!canCastSpellWithSlot(selectedSpell, 'no-slot')"
          @click="selectedSlotId = 'no-slot'"
        >
          <v-list-item-title>
            Cast without spell slot
          </v-list-item-title>
        </v-list-item>
        <v-list-item
          key="ritual-dummy-slot"
          class="spell-slot-list-tile"
          :class="{ 'text-primary': selectedSlotId === 'ritual' }"
          value="ritual"
          :disabled="!canCastSpellWithSlot(selectedSpell, 'ritual')"
          @click="selectedSlotId = 'ritual'"
        >
          <v-list-item-title>
            Cast as ritual
          </v-list-item-title>
        </v-list-item>
        <spell-slot-list-tile
          v-for="spellSlot in spellSlots"
          :key="spellSlot._id"
          :model="spellSlot"
          :class="{ 'text-primary': selectedSlotId === spellSlot._id }"
          :value="spellSlot._id"
          :disabled="!canCastSpellWithSlot(selectedSpell, spellSlot._id, spellSlot)"
          hide-cast-button
          @click="selectedSlotId = spellSlot._id"
        />
      </template>
      <template #right>
        <div
          key="spell-title-right"
          class="text-h6 my-3"
        >
          Spell
        </div>
        <template v-for="spell in computedSpells">
          <v-list-subheader
            v-if="spell.isSubheader"
            :key="`${spell.level}-header`"
            class="item"
          >
            {{ spell.level === 0 ? 'Cantrips' : `Level ${spell.level}` }}
          </v-list-subheader>
          <spell-list-tile
            v-else
            :key="spell._id"
            hide-handle
            show-info-button
            :model="spell"
            :value="spell._id"
            :class="{ 'text-primary': selectedSpellId === spell._id }"
            :disabled="!canCastSpellWithSlot(spell, selectedSlotId, selectedSlot)"
            @show-info="spellDialog(spell._id)"
          />
        </template>
      </template>
    </split-list-layout>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useGoTo } from 'vuetify';
import { autorun } from 'vue-meteor-tracker';
import SplitListLayout from '/imports/client/ui/properties/components/attributes/SplitListLayout.vue';
import CreatureProperties, { type CreaturePropertyTypes } from '/imports/api/creature/creatureProperties/CreatureProperties';
import spellsWithSubheaders from '/imports/client/ui/properties/components/spells/spellsWithSubheaders';
import SpellSlotListTile from '/imports/client/ui/properties/components/attributes/SpellSlotListTile.vue';
import SpellListTile from '/imports/client/ui/properties/components/spells/SpellListTile.vue';
import { find } from 'lodash';
import { getFilter } from '/imports/api/parenting/parentingFunctions';
import { key } from '/imports/client/ui/vuexStore';

const slotFilter = {
  type: 'attribute',
  attributeType: 'spellSlot',
  removed: { $ne: true },
  inactive: { $ne: true },
  overridden: { $ne: true },
  'spellSlotLevel.value': { $gte: 1 },
} as const;

const props = defineProps<{
  creatureId: string;
  value: Record<string, any>;
}>();

const emit = defineEmits(['input']);
const store = useStore(key);
const goTo = useGoTo();

const searchString = ref<string | undefined>(undefined);
const selectedSlotId = ref<string | undefined>(props.value.slotId);
const selectedSpellId = ref<string | undefined>(props.value.spellId);
const selectedSlot = ref<any>(undefined);
const selectedSpell = ref<any>(undefined);
const searchValue = ref<string | undefined>(undefined);
const searchError = ref<string | undefined>(undefined);
const filterMenuOpen = ref(false);
const booleanFilters = reactive({
  verbal: { name: 'Verbal', enabled: false, value: true },
  somatic: { name: 'Somatic', enabled: false, value: true },
  material: { name: 'Material', enabled: false, value: true },
  concentration: { name: 'Concentration', enabled: false, value: true },
  ritual: { name: 'Ritual', enabled: false, value: true },
});

const { result: spells } = autorun(() => {
  const filter: any = {
    ...getFilter.descendantsOfRoot(props.creatureId),
    removed: { $ne: true },
    inactive: { $ne: true },
    $or: [
      { prepared: true },
      { alwaysPrepared: true },
    ],
  };
  for (const key in booleanFilters) {
    const f = (booleanFilters as any)[key];
    if (f.enabled) {
      if (key === 'material') {
        filter[key] = { $exists: f.value };
      } else {
        filter[key] = f.value ? true : { $ne: true };
      }
    }
  }
  if (searchValue.value) {
    filter.name = {
      $regex: searchValue.value.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'),
      $options: 'i',
    };
  }
  return CreatureProperties.find(filter, { sort: { left: 1 } }).fetch();
});

const { result: spellSlots } = autorun(() =>
  CreatureProperties.find({
    ...getFilter.descendantsOfRoot(props.creatureId),
    ...slotFilter,
  }, {
    sort: { 'spellSlotLevel.value': 1, order: 1 },
  }).fetch() as CreaturePropertyTypes['attribute'][]
);

const computedSpells = computed(() => spellsWithSubheaders(spells.value));

const canCast = computed(() => {
  if (!selectedSpell.value || !selectedSlotId.value) return false;
  return canCastSpellWithSlot(selectedSpell.value, selectedSlotId.value, selectedSlot.value);
});

const filtersApplied = computed(() => {
  for (const key in booleanFilters) {
    if ((booleanFilters as any)[key].enabled) return true;
  }
  return false;
});

watch(selectedSpellId, (spellId) => {
  selectedSpell.value = CreatureProperties.findOne(spellId);
  emit('input', { ...props.value, spellId });
}, { immediate: true });

watch(selectedSpell, (spell) => {
  if (!spell) return;
  if (selectedSlotId.value && canCastSpellWithSlot(spell, selectedSlotId.value, selectedSlot.value)) return;
  if (spell.level === 0 || spell.castWithoutSpellSlots) {
    selectedSlotId.value = 'no-slot';
  } else {
    const newSlot = find(
      CreatureProperties.find({
        ...getFilter.descendantsOfRoot(props.creatureId),
        ...slotFilter,
      }, {
        sort: { 'spellSlotLevel.value': 1, order: 1 },
      }).fetch(),
      (slot: any) => canCastSpellWithSlot(spell, slot._id, slot)
    );
    if (newSlot) {
      selectedSlotId.value = (newSlot as any)._id;
    } else if (spell.ritual) {
      selectedSlotId.value = 'ritual';
    }
  }
}, { immediate: true });

watch(selectedSlotId, (slotId) => {
  selectedSlot.value = CreatureProperties.findOne(slotId);
  if (slotId === 'ritual') {
    emit('input', { ...props.value, slotId: undefined, ritual: true });
  } else {
    emit('input', { ...props.value, slotId, ritual: false });
  }
}, { immediate: true });

watch(selectedSlot, (slot) => {
  if (!slot) return;
  if (!selectedSpell.value) return;
  if (selectedSpell.value.level > slot.spellSlotLevel.value) {
    selectedSpellId.value = undefined;
  }
}, { immediate: true });

onMounted(() => {
  if (selectedSpellId.value) {
    goTo('.spell.v-list-item--active', { container: '.right' });
  }
});

function clearBooleanFilters() {
  for (const key in booleanFilters) {
    (booleanFilters as any)[key].enabled = false;
  }
}

function spellDialog(_id: string) {
  store.commit('pushDialogStack', {
    component: 'creature-property-dialog',
    elementId: `spell-info-btn-${_id}`,
    data: { _id },
  });
}

function searchChanged(val: string, ack: Function) {
  searchValue.value = val;
  setTimeout(ack, 200);
}

function canCastSpellWithSlot(spell: CreaturePropertyTypes['spell'], slotId: string | undefined, slot?: CreaturePropertyTypes['attribute']): boolean {
  if (slot && !slot.value) return false;
  if (!spell) return true;
  if (!slotId) return true;
  if (spell.castWithoutSpellSlots && spell.insufficientResources) return false;
  if (spell.ritual && slotId === 'ritual') return true;
  if (!spell.level || spell.castWithoutSpellSlots) {
    return slotId === 'no-slot';
  } else {
    return slotId !== 'no-slot' && slot && spell && spell.level <= +(slot.spellSlotLevel?.value || 0) || false;
  }
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
