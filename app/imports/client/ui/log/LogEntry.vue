<template>
  <v-card
    class="ma-2 log-entry"
  >
    <v-card-text
      v-if="model.text || (model.content && model.content.length)"
      class="pa-2"
    >
      <log-content :model="model.content" />
    </v-card-text>
  </v-card>
</template>

<script>
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
  },
}
</script>
