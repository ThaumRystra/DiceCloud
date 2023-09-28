<template lang="html">
  <transition-group name="slide">
    <dialog-base
      v-show="!value"
      key="left"
      class="step-1"
    >
      <template slot="toolbar">
        <v-toolbar-title>
          Property Type
        </v-toolbar-title>
        <v-spacer />
        <v-switch
          :input-value="showPropertyHelp"
          append-icon="mdi-help"
          hide-details
          flat
          @change="propertyHelpChanged"
        />
      </template>
      <property-selector
        slot="unwrapped-content"
        :no-library-only-props="noLibraryOnlyProps"
        :parent-type="parentType"
        @select="type => $emit('input', type)"
      />
    </dialog-base>
    <div
      v-show="value"
      key="right"
      class="step-2"
      style="height: 100%;"
    >
      <slot />
    </div>
  </transition-group>
</template>

<script lang="js">
import DialogBase from '/imports/client/ui/dialogStack/DialogBase.vue';
import PropertySelector from '/imports/client/ui/properties/shared/PropertySelector.vue';
import { snackbar } from '/imports/client/ui/components/snackbars/SnackbarQueue';

export default {
  components: {
    DialogBase,
    PropertySelector,
  },
  props: {
    noLibraryOnlyProps: Boolean,
    value: {
      type: String,
      default: undefined,
    },
    parentType: {
      type: String,
      default: undefined,
    },
  },
  meteor: {
    showPropertyHelp() {
      let user = Meteor.user();
      return !(user?.preferences?.hidePropertySelectDialogHelp)
    },
  },
  methods: {
    propertyHelpChanged(value) {
      Meteor.users.setPreference.call({
        preference: 'hidePropertySelectDialogHelp',
        value: !value
      }, error => {
        if (!error) return;
        console.error(error);
        snackbar({
          text: error.reason,
        });
      });
    }
  }
};
</script>

<style lang="css" scoped>
.slide-enter-active,
.slide-leave-active {
  transition: transform .3s ease;
}

.slide-enter-active.step-1,
.slide-leave-active.step-1 {
  position: absolute;
}

.slide-enter.step-1,
.slide-leave-to.step-1 {
  transform: translateX(-100%);
}

.slide-enter.step-2,
.slide-leave-to.step-2 {
  transform: translateX(100%);
}
</style>
