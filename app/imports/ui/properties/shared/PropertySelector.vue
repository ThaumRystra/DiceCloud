<template lang="html">
  <div class="card-raised-background">
    <v-container
      fluid
      grid-list-lg
      fill-height
    >
      <v-layout
        wrap
        fill-height
      >
        <template v-for="(property, type) in PROPERTIES">
          <v-flex
            v-if="!noLibraryOnlyProps || !property.libraryOnly"
            :key="type"
            md4
            sm6
            xs12
          >
            <v-card
              hover
              style="height: 100%; overflow: hidden;"
              @click="$emit('select', type)"
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
          </v-flex>
        </template>
      </v-layout>
    </v-container>
  </div>
</template>

<script lang="js">
import PROPERTIES from '/imports/constants/PROPERTIES.js';

export default {
  props: {
    noLibraryOnlyProps: Boolean,
  },
	data(){ return {
		PROPERTIES,
	};},
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
