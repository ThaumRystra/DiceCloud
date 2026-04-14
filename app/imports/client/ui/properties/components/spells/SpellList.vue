<script setup lang="ts">
import { computed, inject } from 'vue';
import { useStore } from 'vuex';
import SpellListTile from '/imports/client/ui/properties/components/spells/SpellListTile.vue';
import spellsWithSubheaders from '/imports/client/ui/properties/components/spells/spellsWithSubheaders';
import { key } from '/imports/client/ui/vuexStore';

const props = withDefaults(defineProps<{
  spells?: any[];
  preparingSpells?: boolean;
}>(), {
  spells: () => [],
  preparingSpells: false,
});

const store = useStore(key);
const context = inject('context', {});

const computedSpells = computed(() => spellsWithSubheaders(props.spells));

function clickProperty(_id: string) {
  store.commit('pushDialogStack', {
    component: 'creature-property-dialog',
    elementId: `spell-list-tile-${_id}`,
    data: { _id },
  });
}
</script>

<template lang="html">
  <v-list
    lines="two"
    density="compact"
    class="spell-list"
  >
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
