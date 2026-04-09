<template lang="html">
  <v-card
    class="ma-2 log-entry"
  >
    <v-list-item
      v-if="model.creatureId"
      style="max-width: 220px;"
      density="compact"
    >
      <template #prepend>
        <v-avatar
          :color="model.color || 'grey'"
          size="32"
        >
          <img
            v-if="creature.avatarPicture"
            :src="creature.avatarPicture"
            :alt="creature.name"
          >
          <span v-else>
            {{ creature.name && creature.name[0] || '?' }}
          </span>
        </v-avatar>
      </template>
      <v-list-item-title>
        {{ creature.name }}
      </v-list-item-title>
    </v-list-item>
    <v-card-text
      v-if="model.text || (model.content && model.content.length)"
      class="px-2 pt-0 pb-2"
    >
      <tabletop-log-content
        :model="model.content"
        :show-silenced="showSilenced"
      />
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { autorun } from 'vue-meteor-tracker';
import TabletopLogContent from '/imports/client/ui/log/TabletopLogContent.vue';
import Creatures from '/imports/api/creature/creatures/Creatures';

const props = defineProps<{
  model: object;
  showName?: boolean;
}>();

const showSilenced = ref(false);

const { result: creature } = autorun(() => {
  return Creatures.findOne((props.model as any).creatureId);
});
</script>
