<template lang="html">
  <v-toolbar
    :color="color || 'secondary'"
    :dark="isDark"
    :light="!isDark"
    :flat="flat"
  >
    <v-btn
      icon
      @click="back"
    >
      <v-icon>arrow_back</v-icon>
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
              <v-icon>more_vert</v-icon>
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
                <v-icon>file_copy</v-icon>
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
                <v-icon>send</v-icon>
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
                <v-icon>delete</v-icon>
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
      icon
      @click="$emit('toggle-editing')"
    >
      <v-slide-y-transition
        hide-on-leave
      >
        <v-icon
          v-if="editing"
          key="doneIcon"
        >
          done
        </v-icon>
        <v-icon
          v-else
          key="createIcon"
        >
          create
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
