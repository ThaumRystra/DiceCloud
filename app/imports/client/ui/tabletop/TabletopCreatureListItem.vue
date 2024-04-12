<template>
  <div
    class="d-flex align-center"
  >
    <hexagon-progress
      :percent="66"
      style="z-index: 1; width: 60px; height: 60px; margin-right: -16px"
    >
      <hexagon-progress
        :percent="30"
        style="width: 100%; height: 100%"
      >
        <v-img
          contain
          src="/images/paragons/kira.png"
        />
      </hexagon-progress>
    </hexagon-progress>
    <v-card
      class="flex-grow-1"
      style="margin: 16px 16px 16px 0px;"
    >
      <div style="margin: 8px 8px 8px 24px;">
        {{ title }}
      </div>
    </v-card>
  </div>
</template>

<script lang="js">
import HexagonProgress from '/imports/client/ui/components/HexagonProgress.vue';

export default {
  components: { 
    HexagonProgress,
  },
  props: {
    title: {
      type: String,
      default: 'Title'
    },
  }
};
</script>

<style scoped>

</style>