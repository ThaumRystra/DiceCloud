<template lang="html">
  <div
    v-if="insufficient"
    class="layout align-center justify-start error--text"
  >
    <div
      class="mr-2 text-no-wrap text-truncate"
      style="min-width: 24px; text-align: center;"
    >
      {{ model.conditionNote || (model.condition && model.condition.calculation) || $t('ActionConditionView.kgjnKJ5eYeG-6_UGkEwDW') }}
    </div>
  </div>
</template>

<script lang="js">
export default {
  props: {
    model: {
      type: Object,
      default: () => ({}),
    },
  },
  computed: {
    insufficient(){
      return !this.model.condition?.value;
    },
  },
}
</script>
