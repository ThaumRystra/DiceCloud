<template lang="html">
  <v-toolbar
    :color="color || 'secondary'"
    :theme="isDark ? 'dark' : 'light'"
    :flat="flat"
  >
    <v-btn
      v-if="!embedded"
      icon
      @click="back"
    >
      <v-icon>mdi-arrow-left</v-icon>
    </v-btn>
    <property-icon
      :model="model"
      class="mr-2"
    />
    <v-toolbar-title v-if="model">
      {{ title }}
    </v-toolbar-title>
    <v-spacer />
    <v-slide-y-transition hide-on-leave>
      <div
        v-if="editing && model"
        key="edit-buttons"
        style="flex-shrink: 0;"
      >
        <v-spacer />
        <v-menu
          v-if="$attrs && (
            $attrs.onMove ||
            $attrs.onDuplicate ||
            $attrs.onRemove
          )"
          bottom
          left
          transition="slide-y-transition"
        >
          <template #activator="{ props }">
            <v-btn
              icon
              data-id="property-toolbar-menu-button"
              v-bind="props"
            >
              <v-icon>mdi-dots-vertical</v-icon>
            </v-btn>
          </template>
          <v-list>
            <v-list-item
              v-if="docsPath"
              @click="helpDialog"
            >
              <v-list-item-title>
                Help
              </v-list-item-title>
              <template #append>
                <v-icon>mdi-help</v-icon>
              </template>
            </v-list-item>
            <v-list-item
              v-if="$attrs && $attrs.onDuplicate"
              :disabled="context.editPermission === false"
              @click="$emit('duplicate')"
            >
              <v-list-item-title>
                Duplicate
              </v-list-item-title>
              <template #append>
                <v-icon>mdi-content-copy</v-icon>
              </template>
            </v-list-item>
            <v-list-item
              v-if="$attrs && $attrs.onCopy"
              :disabled="context.copyPermission === false"
              @click="$emit('copy')"
            >
              <v-list-item-title>
                Copy To
              </v-list-item-title>
              <template #append>
                <v-icon>mdi-content-duplicate</v-icon>
              </template>
            </v-list-item>
            <v-list-item
              v-if="$attrs && $attrs['onMake-reference']"
              :disabled="context.editPermission === false"
              @click="$emit('make-reference')"
            >
              <v-list-item-title>
                Create Reference
              </v-list-item-title>
              <template #append>
                <v-icon>mdi-link-plus</v-icon>
              </template>
            </v-list-item>
            <v-list-item
              v-if="$attrs && $attrs.onMove"
              :disabled="context.editPermission === false"
              @click="$emit('move')"
            >
              <v-list-item-title>
                Move
              </v-list-item-title>
              <template #append>
                <v-icon>mdi-send</v-icon>
              </template>
            </v-list-item>
            <v-list-item
              v-if="$attrs && $attrs['onCopy-to-library'] && userPaid"
              :disabled="context.editPermission === false"
              @click="$emit('copy-to-library')"
            >
              <v-list-item-title>
                Copy to library
              </v-list-item-title>
              <template #append>
                <v-icon>mdi-content-duplicate</v-icon>
              </template>
            </v-list-item>
            <v-list-item
              v-if="$attrs && $attrs.onRemove"
              :disabled="context.editPermission === false"
              @click="$emit('remove')"
            >
              <v-list-item-title>
                Delete
              </v-list-item-title>
              <template #append>
                <v-icon>mdi-delete</v-icon>
              </template>
            </v-list-item>
          </v-list>
        </v-menu>
      </div>
      <div
        v-else
        key="blank"
      />
    </v-slide-y-transition>
    <v-btn
      rounded="0"
      variant="outlined"
      @click="$emit('toggle-editing')"
    >
      <span style="width: 44px;">
        {{ editing ? 'Done' : 'Edit' }}
      </span>
      <v-slide-y-transition hide-on-leave>
        <v-icon
          v-if="editing"
          key="doneIcon"
          right
        >
          mdi-check
        </v-icon>
        <v-icon
          v-else
          key="createIcon"
          right
        >
          mdi-pencil
        </v-icon>
      </v-slide-y-transition>
    </v-btn>
  </v-toolbar>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue';
import { useStore } from 'vuex';
import { autorun } from 'vue-meteor-tracker';
import isDarkColor from '/imports/client/ui/utility/isDarkColor';
import PropertyIcon from '/imports/client/ui/properties/shared/PropertyIcon.vue';
import { getPropertyName } from '/imports/constants/PROPERTIES';
import getThemeColor from '/imports/client/ui/utility/getThemeColor';
import PROPERTIES from '/imports/constants/PROPERTIES';
import { assertUserHasPaidBenefits } from '/imports/api/users/patreon/tiers';
import { key } from '/imports/client/ui/vuexStore';

const context = inject<{ editPermission?: boolean; copyPermission?: boolean }>('context', {});
const store = useStore(key);

const props = defineProps<{
  model?: Record<string, any>;
  flat?: boolean;
  editing?: boolean;
  embedded?: boolean;
}>();

const emit = defineEmits<{
  'color-changed': [value: string];
  'toggle-editing': [];
  duplicate: [];
  copy: [];
  'make-reference': [];
  move: [];
  'copy-to-library': [];
  remove: [];
}>();

const { result: userPaid } = autorun(() => {
  try {
    assertUserHasPaidBenefits(Meteor.user());
    return true;
  } catch (e) {
    return false;
  }
});

const color = computed(() => props.model?.color || getThemeColor('secondary'));
const isDark = computed(() => isDarkColor(color.value));

const title = computed(() => {
  const model = props.model;
  if (!model) return '';
  if (model.quantity !== 1 && model.quantity !== undefined) {
    if (model.plural) {
      return `${model.quantity} ${model.plural}`;
    } else if (model.name) {
      return `${model.quantity} ${model.name}`;
    } else {
      return `${model.quantity} × ${getPropertyName(model.type)}`;
    }
  }
  return model.name || getPropertyName(model.type);
});

const docsPath = computed(() => {
  if (!props.model) return undefined;
  const propDef = (PROPERTIES as Record<string, { docsPath?: string }>)[props.model.type];
  return propDef?.docsPath;
});

function colorChanged(value: string) {
  emit('color-changed', value);
}

function back() {
  store.dispatch('popDialogStack');
}

function helpDialog() {
  store.commit('pushDialogStack', {
    component: 'help-dialog',
    elementId: 'property-toolbar-menu-button',
    data: { path: docsPath.value },
  });
}
</script>

<style lang="css" scoped></style>
