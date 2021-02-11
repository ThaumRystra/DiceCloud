<template lang="html">
  <v-card
    class="ma-2"
  >
    <v-card-title
      v-if="model.name"
      class="pa-2"
    >
      <h3>
        {{ model.name }}
      </h3>
    </v-card-title>
    <v-card-text
      v-if="model.text || (model.content && model.content.length)"
      class="pa-2"
    >
      {{ model.text }}
      <div
        v-for="(content, index) in model.content"
        :key="index"
        class="content-line"
      >
        {{ content.name }}
        <span
          v-if="content.error"
          class="error"
        >{{ content.error }}</span>
        {{ content.resultPrefix }}
        <span
          v-if="content.result"
          class="subheading font-weight-bold mx-1"
        >{{ content.result }}</span>
        {{ content.details }}
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
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
}
</style>
