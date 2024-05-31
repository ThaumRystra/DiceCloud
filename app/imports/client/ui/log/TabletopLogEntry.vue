<template lang="html">
  <v-card
    class="ma-2 log-entry"
  >
    <v-list-item
      v-if="model.creatureId"
      style="max-width: 220px;"
      dense
    >
      <v-list-item-avatar
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
      </v-list-item-avatar>
      <v-list-item-content>
        <v-list-item-title>
          {{ creature.name }}
        </v-list-item-title>
      </v-list-item-content>
    </v-list-item>
    <v-card-text
      v-if="model.text || (model.content && model.content.length)"
      class="px-2 pt-0 pb-2"
    >
      <tabletop-log-content :model="model.content" />
    </v-card-text>
  </v-card>
</template>

<script lang="js">
import TabletopLogContent from '/imports/client/ui/log/TabletopLogContent.vue';
import Creatures from '/imports/api/creature/creatures/Creatures';

export default {
  components: {
    TabletopLogContent,
  },
  props: {
    model: {
      type: Object,
      required: true,
    },
    showName: Boolean,
  },
  meteor: {
    creature() {
      return Creatures.findOne(this.model.creatureId);
    },
  }
}
</script>
