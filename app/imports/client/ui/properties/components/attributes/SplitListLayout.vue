<script setup lang="ts">
</script>

<template lang="html">
  <div
    v-if="$vuetify.display.smAndUp"
    class="d-flex split"
  >
    <v-list
      class="float-left"
      subheader
      lines="two"
      density="compact"
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
      class="float-right"
      subheader
      lines="two"
      density="compact"
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
    lines="two"
    density="compact"
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
