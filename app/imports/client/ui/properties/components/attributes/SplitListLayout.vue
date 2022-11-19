<template lang="html">
  <div
    v-if="$vuetify.breakpoint.smAndUp"
    class="layout split"
  >
    <v-list
      class="left"
      subheader
      two-line
      dense
    >
      <v-slide-x-transition
        group
        leave-absolute
      >
        <slot name="left" />
      </v-slide-x-transition>
    </v-list>
    <v-divider
      class="mx-3"
      vertical
    />
    <v-list
      class="right"
      subheader
      two-line
      dense
    >
      <v-slide-x-transition
        group
        leave-absolute
      >
        <slot name="right" />
      </v-slide-x-transition>
    </v-list>
  </div>
  <v-list
    v-else
    class="small"
    subheader
    two-line
    dense
  >
    <v-slide-x-transition
      group
      leave-absolute
    >
      <slot name="left" />
      <slot name="right" />
    </v-slide-x-transition>
  </v-list>
</template>

<script lang="js">
export default {
}
</script>

<style lang="css" scoped>
.split{
  height: 100%;
}
.left, .right {
  height: 100%;
  overflow: auto;
  flex-basis: 250px;
}
.right, .small {
  flex-grow: 1;
}
</style>
