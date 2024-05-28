<template
  lang="html"
  functional
>
  <draggable
    v-model="dataItems"
    :group="'item-list'"
    :animation="200"
    :sort="false"
    ghost-class="item-to-creature-ghost"
    draggable=".no-real-items"
    style="position: relative;"
    @change="dropItem"
  >
    <v-list-item
      slot="header"
      v-bind="$attrs"
      :class="{
        'primary--text v-list-item--active': isSelected,
        'item-to-creature-drag-over': dragover,
      }"
      :dense="dense"
      v-on="selection ? { click() {$emit('click')} } : {}"
    >
      <v-list-item-avatar
        :color="isSelected ? 'red darken-1' : model.color || 'grey'"
        :size="dense ? 30 : undefined"
        class="white--text"
        style="transition: background 0.3s;"
      >
        <v-fade-transition leave-absolute>
          <v-icon v-if="isSelected">
            mdi-check
          </v-icon>
          <img
            v-else-if="model.avatarPicture"
            :src="model.avatarPicture"
            :alt="model.name"
          >
          <template v-else>
            <span>
              {{ model.initial }}
            </span>
          </template>
        </v-fade-transition>
      </v-list-item-avatar>
      <v-list-item-content>
        <v-list-item-title>
          {{ model.name }}
        </v-list-item-title>
        <v-list-item-subtitle v-if="!dense">
          {{ model.alignment }} {{ model.gender }} {{ model.race }}
        </v-list-item-subtitle>
      </v-list-item-content>
      <v-list-item-action v-if="!dense">
        <shared-icon :model="model" />
      </v-list-item-action>
      <v-list-item-action v-if="!selection && !dense">
        <drag-handle
          style="height: 100%; width: 40px;"
        />
      </v-list-item-action>
    </v-list-item>
  </draggable>
</template>

<script lang="js">
import SharedIcon from '/imports/client/ui/components/SharedIcon.vue';
import draggable from 'vuedraggable';
import { organizeDoc } from '/imports/api/parenting/organizeMethods';
import { snackbar } from '/imports/client/ui/components/snackbars/SnackbarQueue';

export default {
  components: {
    SharedIcon,
    draggable,
  },
  props: {
    model: {
      type: Object,
      required: true,
    },
    selection: Boolean,
    isSelected: Boolean,
    dense: Boolean,
  },
  data() {
    return {
      dataItems: [],
      dragover: false, 
    };
  },
  methods: {
    dropItem({ added }) {
      const item = added?.element;
      if (!item?._id) return;
      const docRef = { collection: 'creatureProperties', id: item._id };

      // Create the undo function
      const oldOrder = item.order;
      const oldParent = item.parent;
      // TODO organize doc needs to be replaced with organize between roots
      const undo = () => organizeDoc.callAsync({
        docRef,
        parentRef: oldParent,
        order: (oldOrder || 0) - 0.5,
        skipClient: true, // The client no longer has the doc subscribed, so we can't simulate
      }, (error) => {
        if (error) {
          console.error(error);
          snackbar({ text: error.reason || error.message || error.toString() });
        }
      });

      // TODO organize doc needs to be replaced with organize between roots
      organizeDoc.callAsync({
        docRef,
        parentRef: { collection: 'creatures', id: this.model._id },
        order: -0.5,
      }, (error) => {
        if (error) {
          console.error(error);
          snackbar({ text: error.reason || error.message || error.toString() });
        } else {
          snackbar({
            text: `Moved ${item.name || 'item'} to ${this.model.name || 'another character'}`,
            callbackName: 'undo',
            callback: undo,
          });
        }
      });
    },
  }
}
</script>

<style lang="css">
  .item-to-creature-ghost {
    position: absolute;
    left: 50%;
    top: 0;
    bottom: 0;
    right: 0;
  }
  .item-to-creature-ghost .v-btn {
    display: none;
  }
</style>
