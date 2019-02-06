<template>
  <div>
    <v-toolbar app color="secondary" dark>
      <v-btn flat icon @click="toggleDrawer">
        <v-icon>menu</v-icon>
      </v-btn>
      <slot name="toolbar"></slot>
    </v-toolbar>
    <v-content>
      <slot></slot>
    </v-content>
  </div>
</template>

<script>
  import { mapMutations } from "vuex";
  export default {
    methods: {
      ...mapMutations([
        "toggleDrawer",
      ]),
    },
  };
</script>
