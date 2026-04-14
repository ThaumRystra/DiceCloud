<script setup lang="ts">
import { computed } from 'vue';
import MarkdownText from '/imports/client/ui/components/MarkdownText.vue';

const props = defineProps<{
  model?: any[];
  showSilenced?: boolean;
}>();

const filteredModel = computed(() =>
  (props.model ?? []).filter(content => !content.silenced || props.showSilenced)
);
</script>

<template lang="html">
  <div class="log-content">
    <div
      v-for="(content, index) in filteredModel"
      :key="index"
      class="content-line"
    >
      <h4
        class="content-name"
        style="min-height: 12px;"
      >
        {{ content.name }}
      </h4>
      <markdown-text
        v-if="content.value"
        class="content-value"
        :markdown="content.value"
      />
      <div
        v-else
        style="min-height: 12px;"
      />
    </div>
  </div>
</template>

<style lang="css" scoped>
.content-line {
  min-height: 24px;
  margin-top: 8px;
  margin-bottom: 2px;
}
.content-line .details {
  display: inline-block;
}
</style>

<style lang="css">
  .log-content .content-value > p:last-of-type{
    margin-bottom: 0;
  }
</style>
