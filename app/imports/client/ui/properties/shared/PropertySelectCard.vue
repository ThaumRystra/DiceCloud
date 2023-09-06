<template lang="html">
  <v-card
    hover
    style="height: 100%; overflow: hidden;"
    :class="{'accent--text': disabled}"
    :disabled="disabled"
    @click="e => $emit('click', e)"
  >
    <v-card-title
      class="subtitle pb-3"
      style="text-align: center;"
    >
      <v-avatar tile>
        <v-icon x-large>
          {{ property.icon }}
        </v-icon>
      </v-avatar>
      <span class="ml-3">
        {{ property.name }}
      </span>
    </v-card-title>
    <v-expand-transition>
      <div
        v-if="showPropertyHelp"
        class="mx-4"
      >
        {{ property.helpText }}
        <div style="height: 16px;" />
        <div
          v-if="property.examples"
          class="text-caption"
        >
          {{ property.examples }}
          <div style="height: 16px;" />
        </div>
      </div>
    </v-expand-transition>
  </v-card>
</template>

<script lang="js">
export default {
  props: {
    property: {
      type: Object,
      required: true,
    },
    disabled: Boolean,
  },
  meteor: {
    showPropertyHelp(){
      let user = Meteor.user();
      return !(user?.preferences?.hidePropertySelectDialogHelp)
    },
  },
}
</script>

<style lang="css" scoped>
</style>
