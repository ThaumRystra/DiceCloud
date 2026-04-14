<template lang="html">
  <toolbar-card
    :color="model.color"
    :data-id="model._id"
    @toolbarclick="clickSpellList(model._id)"
  >
    <template #toolbar>
      <v-toolbar-title v-if="!preparingSpells">
        {{ model.name }}
      </v-toolbar-title>
      <v-spacer v-if="!preparingSpells && preparedError" />
      <v-toolbar-title
        v-if="preparingSpells || preparedError"
        :class="{ 'text-error': preparedError }"
      >
        {{ numPrepared }}/{{ model.maxPrepared && model.maxPrepared.value || 0 }} spells prepared
      </v-toolbar-title>
      <v-spacer />
      <v-menu
        v-if="!preparingSpells"
        bottom
        left
        transition="slide-y-transition"
        style="margin-right: -12px;"
      >
        <template #activator="{ props }">
          <v-btn
            icon
            v-bind="props"
            @click.stop
          >
            <v-icon>mdi-dots-vertical</v-icon>
          </v-btn>
        </template>
        <v-list class="pa-2">
          <v-switch
            v-model="preparingSpells"
            class="ma-2"
            label="Change prepared spells"
            hide-details
          />
        </v-list>
      </v-menu>
      <v-btn
        v-else
        icon
        @click.stop="preparingSpells = false"
      >
        <v-icon>mdi-check</v-icon>
      </v-btn>
    </template>
    <spell-list
      :spells="spells"
      :preparing-spells="preparingSpells"
    />
  </toolbar-card>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { autorun } from 'vue-meteor-tracker';
import { useStore } from 'vuex';
import ToolbarCard from '/imports/client/ui/components/ToolbarCard.vue';
import SpellList from '/imports/client/ui/properties/components/spells/SpellList.vue';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties';
import { getFilter } from '/imports/api/parenting/parentingFunctions';
import { key } from '/imports/client/ui/vuexStore';

const props = withDefaults(defineProps<{
  model: Record<string, any>;
  organize?: boolean;
}>(), {
  organize: false,
});

const store = useStore(key);
const preparingSpells = ref(false);

const { result: spells } = autorun(() => {
  const filter: any = {
    ...getFilter.descendants(props.model),
    type: 'spell',
    removed: { $ne: true },
  };
  if (preparingSpells.value) {
    filter.deactivatedByAncestor = { $ne: true };
    filter.deactivatedByToggle = { $ne: true };
  } else {
    filter.inactive = { $ne: true };
  }
  return CreatureProperties.find(filter, {
    sort: { level: 1, left: 1 },
  }).fetch();
});

const { result: numPrepared } = autorun(() =>
  CreatureProperties.find({
    ...getFilter.descendants(props.model),
    type: 'spell',
    removed: { $ne: true },
    prepared: true,
    alwaysPrepared: { $ne: true },
    deactivatedByAncestor: { $ne: true },
    deactivatedByToggle: { $ne: true },
  }).count()
);

const { result: preparedError } = autorun(() => {
  if (!props.model.maxPrepared) return undefined;
  const prepared = CreatureProperties.find({
    ...getFilter.descendants(props.model),
    type: 'spell',
    removed: { $ne: true },
    prepared: true,
    alwaysPrepared: { $ne: true },
    deactivatedByAncestor: { $ne: true },
    deactivatedByToggle: { $ne: true },
  }).count();
  const maxPrepared = props.model.maxPrepared.value || 0;
  return prepared !== maxPrepared;
});

function clickSpellList(_id: string) {
  store.commit('pushDialogStack', {
    component: 'creature-property-dialog',
    elementId: `${_id}`,
    data: { _id },
  });
}
</script>

<style lang="css" scoped></style>
