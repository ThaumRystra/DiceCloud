<template lang="html">
  <div class="slot-filler-viewer">
    <v-row dense>
      <property-field
        v-if="model.description"
        name="Description"
        :cols="{cols: 12}"
      >
        <markdown-text :markdown="model.description" />
      </property-field>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import MarkdownText from '/imports/client/ui/components/MarkdownText.vue';

defineProps<{ model: Record<string, any> }>();
</script>
