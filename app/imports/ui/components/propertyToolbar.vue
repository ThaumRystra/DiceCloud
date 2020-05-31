<template lang="html">
  <v-toolbar
    :color="color || 'secondary'"
    :dark="isDark"
    :light="!isDark"
    :flat="flat"
  >
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
            <v-list-tile
              v-if="$listeners && $listeners.duplicate"
              @click="$emit('duplicate')"
            >
              <v-list-tile-content>
                <v-list-tile-title>
                  Duplicate
                </v-list-tile-title>
              </v-list-tile-content>
              <v-list-tile-action>
                <v-icon>file_copy</v-icon>
              </v-list-tile-action>
            </v-list-tile>
            <v-list-tile
              v-if="$listeners && $listeners.move"
              @click="$emit('move')"
            >
              <v-list-tile-content>
                <v-list-tile-title>
                  Move
                </v-list-tile-title>
              </v-list-tile-content>
              <v-list-tile-action>
                <v-icon>send</v-icon>
              </v-list-tile-action>
            </v-list-tile>
            <v-list-tile
              v-if="$listeners && $listeners.remove"
              @click="$emit('remove')"
            >
              <v-list-tile-content>
                <v-list-tile-title>
                  Delete
                </v-list-tile-title>
              </v-list-tile-content>
              <v-list-tile-action>
                <v-icon>delete</v-icon>
              </v-list-tile-action>
            </v-list-tile>
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

<script>
import isDarkColor from '/imports/ui/utility/isDarkColor.js';
import PropertyIcon from '/imports/ui/properties/shared/PropertyIcon.vue';
import { getPropertyName } from '/imports/constants/PROPERTIES.js';
import ColorPicker from '/imports/ui/components/ColorPicker.vue';

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
      return this.model && this.model.color || this.$vuetify.theme.secondary;
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
  }
}
</script>

<style lang="css" scoped>
</style>
