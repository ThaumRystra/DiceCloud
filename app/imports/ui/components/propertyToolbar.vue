<template lang="html">
  <v-toolbar
    :color="color || 'secondary'"
    :dark="isDark"
    :light="!isDark"
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
    <v-slide-y-transition
      hide-on-leave
    >
      <v-layout
        v-if="editing && model"
        key="edit-buttons"
        style="flex-shrink: 0;"
      >
        <v-spacer />
        <color-picker
          v-if="$listeners && $listeners['color-changed']"
          :value="model.color"
          @input="colorChanged"
        />
        <v-menu
          v-if="$listeners && (
            $listeners.move ||
            $listeners.duplicate ||
            $listeners.remove
          )"
          bottom
          left
          transition="slide-y-transition"
        >
          <template #activator="{ on }">
            <v-btn
              icon
              data-id="property-toolbar-menu-button"
              v-on="on"
            >
              <v-icon>mdi-dots-vertical</v-icon>
            </v-btn>
          </template>
          <v-list>
            <v-list-item
              v-if="$listeners && $listeners.duplicate"
              @click="$emit('duplicate')"
            >
              <v-list-item-content>
                <v-list-item-title>
                  Duplicate
                </v-list-item-title>
              </v-list-item-content>
              <v-list-item-action>
                <v-icon>mdi-content-copy</v-icon>
              </v-list-item-action>
            </v-list-item>
            <v-list-item
              v-if="$listeners && $listeners.move"
              @click="$emit('move')"
            >
              <v-list-item-content>
                <v-list-item-title>
                  Move
                </v-list-item-title>
              </v-list-item-content>
              <v-list-item-action>
                <v-icon>mdi-send</v-icon>
              </v-list-item-action>
            </v-list-item>
            <v-list-item
              v-if="$listeners && $listeners.remove"
              @click="$emit('remove')"
            >
              <v-list-item-content>
                <v-list-item-title>
                  Delete
                </v-list-item-title>
              </v-list-item-content>
              <v-list-item-action>
                <v-icon>mdi-delete</v-icon>
              </v-list-item-action>
            </v-list-item>
          </v-list>
        </v-menu>
      </v-layout>
      <v-layout
        v-else
        key="blank"
      />
    </v-slide-y-transition>
    <v-btn
      tile
      outlined
      @click="$emit('toggle-editing')"
    >
      <span style="width: 44px;">
        {{ editing ? 'Done' : 'Edit' }}
      </span>
      <v-slide-y-transition
        hide-on-leave
      >
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

<script lang="js">
import isDarkColor from '/imports/ui/utility/isDarkColor.js';
import PropertyIcon from '/imports/ui/properties/shared/PropertyIcon.vue';
import { getPropertyName } from '/imports/constants/PROPERTIES.js';
import ColorPicker from '/imports/ui/components/ColorPicker.vue';
import getThemeColor from '/imports/ui/utility/getThemeColor.js';

export default {
  components: {
    PropertyIcon,
    ColorPicker,
  },
  props: {
    model: {
      type: Object,
      default: undefined,
    },
    flat: Boolean,
    editing: Boolean,
    embedded: Boolean,
  },
  computed: {
    isDark(){
      return isDarkColor(this.color);
    },
    color(){
      return this.model && this.model.color || getThemeColor('secondary');
    },
    title(){
      let model = this.model;
      if (model.quantity !== 1 && model.quantity !== undefined){
        if (model.plural){
          return `${model.quantity} ${model.plural}`;
        } else if (model.name) {
          return `${model.quantity} ${model.name}`;
        } else {
          return `${model.quantity} × ${getPropertyName(model.type)}`
        }
      }
      return model.name || getPropertyName(model.type);
    }
  },
  methods: {
    colorChanged(value){
      this.$emit('color-changed', value);
    },
    back(){
      this.$store.dispatch('popDialogStack');
    },
  }
}
</script>

<style lang="css" scoped>
</style>
