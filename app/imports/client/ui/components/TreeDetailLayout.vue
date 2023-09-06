<template lang="html">
  <div
    class="layout"
    style="height: 100%;"
  >
    <div
      v-if="$slots['left-tree']"
      class="layout column justify-start"
      :style="computedTreeStyle"
    >
      <slot
        name="left-tree"
      />
    </div>
    <v-divider
      v-if="$slots['left-tree']" 
      vertical
    />
    <div
      class="layout column justify-start"
      :style="computedTreeStyle"
    >
      <slot name="tree" />
    </div>
    <template v-if="$vuetify.breakpoint.mdAndUp">
      <v-divider vertical />
      <div
        class="flex layout column"
        style="background-color: inherit; overflow: hidden; min-height: 100%;"
        data-id="selected-node-card"
      >
        <slot name="detail" />
      </div>
    </template>
  </div>
</template>

<script lang="js">
export default {
  computed:{
    computedTreeStyle(){
      if (this.$vuetify.breakpoint.smAndDown) return;
      let style = 'flex-shrink: 0; flex-grow: 0; ';
      if (this.$vuetify.breakpoint.xlOnly){
        style += 'width: 400px;'
      } else {
        style += 'width: 320px;'
      }
      return style;
    },
  }
}
</script>

<style lang="css" scoped>
</style>
