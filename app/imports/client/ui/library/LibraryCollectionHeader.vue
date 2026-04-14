<script setup lang="ts">
import { autorun } from 'vue-meteor-tracker';
import { Meteor } from 'meteor/meteor';
import { useStore } from 'vuex';
import { assertDocEditPermission } from '/imports/api/sharing/sharingPermissions';
import SharedIcon from '/imports/client/ui/components/SharedIcon.vue';
import { key } from '/imports/client/ui/vuexStore';

const props = defineProps<{
  model: Record<string, any>;
  open?: boolean;
  selection?: boolean;
  singleSelect?: boolean;
  dense?: boolean;
  isSelected?: boolean;
  disabled?: boolean;
}>();

const store = useStore(key);

const { result: canEdit } = autorun(() => {
  try {
    assertDocEditPermission(props.model, Meteor.userId());
    return true;
  } catch (e) {
    return false;
  }
});

function editLibraryCollection() {
  store.commit('pushDialogStack', {
    data: { _id: props.model._id },
    component: 'library-collection-edit-dialog',
    elementId: `library-collection-${props.model._id}`,
  });
}
</script>

<template lang="html">
  <v-list-item
    style="min-height: 60px; min-width: 0;"
    class="px-0 font-weight-bold"
    :class="isSelected && !disabled && 'text-primary v-list-item--active'"
  >
    <template
      v-if="selection && !singleSelect"
      #prepend
    >
      <v-checkbox
        :disabled="disabled"
        :model-value="disabled || isSelected"
        @update:model-value="e => $emit('select', e)"
        @click.stop
      />
    </template>
    <template
      v-else
      #prepend
    >
      <shared-icon :model="model" />
    </template>
    <v-list-item-title class="d-flex align-center">
      <div
        class="text-truncate text-no-wrap"
        style="opacity: 0.7"
      >
        {{ model.name }}
      </div>
      <template v-if="!selection && !dense">
        <v-spacer />
        <v-btn
          v-if="canEdit"
          icon
          style="flex-grow: 0"
          @click.stop="editLibraryCollection"
        >
          <v-icon>
            mdi-pencil
          </v-icon>
        </v-btn>
        <v-btn
          icon
          style="flex-grow: 0"
          :to="{ name: 'libraryCollection', params: { id: model._id } }"
          @click.stop
        >
          <v-icon>
            mdi-forward
          </v-icon>
        </v-btn>
      </template>
    </v-list-item-title>
  </v-list-item>
</template>

<style lang="css" scoped></style>
