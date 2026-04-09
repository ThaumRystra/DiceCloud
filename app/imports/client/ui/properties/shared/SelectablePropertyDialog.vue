<template lang="html">
  <transition-group name="slide">
    <dialog-base
      v-show="!value"
      key="left"
      class="step-1"
    >
      <template #toolbar>
        <v-toolbar-title>
          Property Type
        </v-toolbar-title>
        <v-spacer />
        <v-switch
          :model-value="showPropertyHelp"
          append-icon="mdi-help"
          hide-details
          @change="propertyHelpChanged"
        />
      </template>
      <template #unwrapped-content>
        <property-selector
          :no-library-only-props="noLibraryOnlyProps"
          :parent-type="parentType"
          @select="type => $emit('input', type)"
        />
      </template>
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

<script setup lang="ts">
import { autorun } from 'vue-meteor-tracker';
import DialogBase from '/imports/client/ui/dialogStack/DialogBase.vue';
import PropertySelector from '/imports/client/ui/properties/shared/PropertySelector.vue';
import { snackbar } from '/imports/client/ui/components/snackbars/SnackbarQueue';

withDefaults(defineProps<{
  noLibraryOnlyProps?: boolean;
  value?: string;
  parentType?: string;
}>(), {
  noLibraryOnlyProps: false,
  value: undefined,
  parentType: undefined,
});

const { result: showPropertyHelp } = autorun(() => {
  const user = Meteor.user();
  return !(user?.preferences?.hidePropertySelectDialogHelp);
});

async function propertyHelpChanged(value: boolean) {
  try {
    await Meteor.users.setPreference.callAsync({
      preference: 'hidePropertySelectDialogHelp',
      value: !value,
    });
  } catch (error: any) {
    console.error(error);
    snackbar({
      text: error.reason,
    });
  }
}
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
