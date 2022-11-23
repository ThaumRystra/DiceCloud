<template lang="html">
  <v-card
    class="ma-2 log-entry"
  >
    <v-card-title v-if="showName && model.creatureName">
      {{ model.creatureName }}
    </v-card-title>
    <v-card-text
      v-if="model.text || (model.content && model.content.length)"
      class="pa-2"
    >
      <log-content :model="model.content" />
    </v-card-text>
  </v-card>
</template>

<script lang="js">
import LogContent from '/imports/client/ui/log/LogContent.vue';

export default {
  components: {
    LogContent,
  },
  props: {
    model: {
      type: Object,
      required: true,
    },
    showName: Boolean,
  },
}
</script>
