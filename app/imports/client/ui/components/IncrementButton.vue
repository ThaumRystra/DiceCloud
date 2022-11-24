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
        :loading="loading"
        v-on="on"
        @click.stop
      >
        <slot>
          <v-icon>$vuetify.icons.abacus</v-icon>
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

<script lang="js">
import IncrementMenu from '/imports/client/ui/components/IncrementMenu.vue';

export default {
  components: {
    IncrementMenu,
  },
  props: {
    value: {
      type: Number,
      required: true,
    },
    loading: Boolean,
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
