<template lang="html">
  <v-list-item
    style="min-height: 60px; min-width: 0;"
    class="px-0 font-weight-bold"
    :class="isSelected && !disabled && 'primary--text v-list-item--active'"
  >
    <v-list-item-action
      v-if="selection && !singleSelect"
    >
      <v-checkbox
        :disabled="disabled"
        :input-value="disabled || isSelected"
        @change="e => $emit('select', e)"
        @click.stop
      />
    </v-list-item-action>
    <v-list-item-avatar v-else>
      <shared-icon :model="model" />
    </v-list-item-avatar>
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
          :to="{name: 'libraryCollection', params: {id: model._id}}"
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

<script lang="js">
import { assertDocEditPermission } from '/imports/api/sharing/sharingPermissions';
import SharedIcon from '/imports/client/ui/components/SharedIcon.vue';

export default {
  components: {
    SharedIcon,
  },
  props: {
    model: {
      type: Object,
      required: true,
    },
    open: Boolean,
    selection: Boolean,
    singleSelect: Boolean,
    dense: Boolean,
    isSelected: Boolean,
    disabled: Boolean,
  },
  data(){return {
    renaming: false,
  }},
  meteor: {
    canEdit(){
      try {
        assertDocEditPermission(this.model, Meteor.userId());
        return true
      } catch (e) {
        return false;
      }
    }
  },
  methods: {
    editLibraryCollection() {
      this.$store.commit('pushDialogStack', {
        data: { _id: this.model._id},
        component: 'library-collection-edit-dialog',
        elementId: `library-collection-${this.model._id}`,
      });
    }
  }
}
</script>

<style lang="css" scoped>
</style>
