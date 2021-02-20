<template lang="html">
  <v-card
    class="ma-2 log-entry"
  >
    <v-card-text
      v-if="model.text || (model.content && model.content.length)"
      class="pa-2"
    >
      <div
        v-for="(content, index) in model.content"
        :key="index"
        class="content-line"
      >
        <h4>
          {{ content.name }}
        </h4>
        <span
          v-if="content.error"
          class="error"
        >{{ content.error }}</span>
        {{ content.resultPrefix }}
        <span
          v-if="content.result"
          class="subheading font-weight-bold mx-1"
        >{{ content.result }}</span>
        <span
          v-if="content.details"
        >{{ content.details }}</span>
        <markdown-text
          v-if="content.description"
          class="description"
          :markdown="content.description"
        />
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
import MarkdownText from '/imports/ui/components/MarkdownText.vue';

export default {
  components: {
    MarkdownText,
  },
  props: {
    model: {
      type: Object,
      required: true,
    },
  },
}
</script>

<style lang="css" scoped>
.content-line {
  min-height: 24px;
  margin-top: 2px;
  margin-bottom: 2px;
}
.content-line .details {
  display: inline-block;
}
</style>

<style lang="css">
  .log-entry .description > p:last-of-type{
    margin-bottom: 0;
  }
</style>
