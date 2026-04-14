<script setup lang="ts">
import { ref } from 'vue';
import { useStore } from 'vuex';
import SpellSlotListTile from '/imports/client/ui/properties/components/attributes/SpellSlotListTile.vue';
import { key } from '/imports/client/ui/vuexStore';

const props = withDefaults(defineProps<{
  creatureId: string;
  hasSpells?: boolean;
  spellSlots?: any[];
}>(), {
  hasSpells: false,
  spellSlots: () => [],
});

const store = useStore(key);
const castSpellLoading = ref(false);

function castSpell() {
  store.commit('pushDialogStack', {
    component: 'cast-spell-with-slot-dialog',
    elementId: 'spell-slot-card',
    data: { creatureId: props.creatureId },
  });
}

function clickProperty({ _id }: { _id: string }) {
  store.commit('pushDialogStack', {
    component: 'creature-property-dialog',
    elementId: `spell-slot-card-${_id}`,
    data: { _id },
  });
}
</script>

<template>
  <v-card data-id="spell-slot-card">
    <v-list
      v-if="spellSlots.length"
      lines="two"
      subheader
    >
      <v-list-subheader>Spell Slots</v-list-subheader>
      <spell-slot-list-tile
        v-for="spellSlot in spellSlots"
        :key="spellSlot._id"
        :model="spellSlot"
        :data-id="`spell-slot-card-${spellSlot._id}`"
        @click="clickProperty({ _id: spellSlot._id })"
      />
    </v-list>
    <div
      v-if="hasSpells"
      class="d-flex justify-end"
    >
      <v-btn
        color="accent"
        style="width: 100%;"
        variant="outlined"
        data-id="cast-spell-btn"
        @click="castSpell"
      >
        Cast a spell
      </v-btn>
    </div>
  </v-card>
</template>
