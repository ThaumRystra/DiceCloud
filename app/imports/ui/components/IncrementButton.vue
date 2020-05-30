<template lang="html">
  <v-menu
    v-model="open"
    origin="center center"
    transition="scale-transition"
    :nudge-left="130"
    :min-width="305"
    :close-on-content-click="false"
  >
    <template #activator="{ on }">
      <v-btn
        v-bind="$attrs"
        v-on="on"
      >
        <slot>
          <v-icon>add</v-icon>
        </slot>
      </v-btn>
    </template>
    <v-card>
      <increment-menu
        flat
        :value="value"
        :open="open"
        @change="changeIncrementMenu"
        @close="open = false"
      />
    </v-card>
  </v-menu>
</template>

<script>
import IncrementMenu from '/imports/ui/components/IncrementMenu.vue';

export default {
  components: {
    IncrementMenu,
  },
  props: {
    value: {
      type: Number,
      required: true,
    },
  },
  data(){return {
    open: false
  }},
  methods: {
    changeIncrementMenu(e){
      this.$emit('change', e);
      this.open = false;
    },
  },
}
</script>

<style lang="css" scoped>
</style>
