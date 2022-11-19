<template lang="html">
  <div class="log-content">
    <div
      v-for="(content, index) in model"
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

<script lang="js">
import MarkdownText from '/imports/client/ui/components/MarkdownText.vue';

export default {
  components: {
    MarkdownText,
  },
  props: {
    model: {
      type: Array,
      default: () => [],
    },
  },
}
</script>

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
