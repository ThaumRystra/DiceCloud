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
              v-if="docsPath"
              @click="helpDialog"
            >
              <v-list-item-content>
                <v-list-item-title>
                  {{ $t('components.propertyToolbar.help') }}
                </v-list-item-title>
              </v-list-item-content>
              <v-list-item-action>
                <v-icon>mdi-help</v-icon>
              </v-list-item-action>
            </v-list-item>
            <v-list-item
              v-if="$listeners && $listeners.duplicate"
              :disabled="context.editPermission === false"
              @click="$emit('duplicate')"
            >
              <v-list-item-content>
                <v-list-item-title>
                  {{ $t('components.propertyToolbar.duplicate') }}
                </v-list-item-title>
              </v-list-item-content>
              <v-list-item-action>
                <v-icon>mdi-content-copy</v-icon>
              </v-list-item-action>
            </v-list-item>
            <v-list-item
              v-if="$listeners && $listeners.copy"
              :disabled="context.copyPermission === false"
              @click="$emit('copy')"
            >
              <v-list-item-content>
                <v-list-item-title>
                  {{ $t('components.propertyToolbar.copyTo') }}
                </v-list-item-title>
              </v-list-item-content>
              <v-list-item-action>
                <v-icon>mdi-content-duplicate</v-icon>
              </v-list-item-action>
            </v-list-item>
            <v-list-item
              v-if="$listeners && $listeners['make-reference']"
              :disabled="context.editPermission === false"
              @click="$emit('make-reference')"
            >
              <v-list-item-content>
                <v-list-item-title>
                  {{ $t('components.propertyToolbar.createReference') }}
                </v-list-item-title>
              </v-list-item-content>
              <v-list-item-action>
                <v-icon>mdi-link-plus</v-icon>
              </v-list-item-action>
            </v-list-item>
            <v-list-item
              v-if="$listeners && $listeners.move"
              :disabled="context.editPermission === false"
              @click="$emit('move')"
            >
              <v-list-item-content>
                <v-list-item-title>
                  {{ $t('components.propertyToolbar.move') }}
                </v-list-item-title>
              </v-list-item-content>
              <v-list-item-action>
                <v-icon>mdi-send</v-icon>
              </v-list-item-action>
            </v-list-item>
            <v-list-item
              v-if="$listeners && $listeners['copy-to-library'] && userPaid"
              :disabled="context.editPermission === false"
              @click="$emit('copy-to-library')"
            >
              <v-list-item-content>
                <v-list-item-title>
                  {{ $t('components.propertyToolbar.copyToLibrary') }}
                </v-list-item-title>
              </v-list-item-content>
              <v-list-item-action>
                <v-icon>mdi-content-duplicate</v-icon>
              </v-list-item-action>
            </v-list-item>
            <v-list-item
              v-if="$listeners && $listeners.remove"
              :disabled="context.editPermission === false"
              @click="$emit('remove')"
            >
              <v-list-item-content>
                <v-list-item-title>
                  {{ $t('components.propertyToolbar.delete') }}
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
      <!-- Changed to fix-content because in PT the text is too long -->
      <span style="width: fit-content;">
        {{ editing ? $t('components.propertyToolbar.done') : $t('components.propertyToolbar.edit') }}
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
import isDarkColor from '/imports/client/ui/utility/isDarkColor';
import PropertyIcon from '/imports/client/ui/properties/shared/PropertyIcon.vue';
import { getPropertyName } from '/imports/constants/PROPERTIES';
import getThemeColor from '/imports/client/ui/utility/getThemeColor';
import PROPERTIES from '/imports/constants/PROPERTIES';
import { assertUserHasPaidBenefits } from '/imports/api/users/patreon/tiers';

export default {
  components: {
    PropertyIcon,
  },
  inject: {
    context: { default: {} }
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
    },
    docsPath() {
      const propDef = PROPERTIES[this.model.type];
      return propDef && propDef.docsPath;
    },
  },
  meteor: {
    userPaid() {
      try {
        assertUserHasPaidBenefits(Meteor.user())
        return true;
      } catch (e) {
        return false;
      }
    },
  },
  methods: {
    colorChanged(value){
      this.$emit('color-changed', value);
    },
    back(){
      this.$store.dispatch('popDialogStack');
    },
    helpDialog() {
      this.$store.commit('pushDialogStack', {
        component: 'help-dialog',
        elementId: 'property-toolbar-menu-button',
        data: {
          path: this.docsPath,
        },
      });
    },
  }
}
</script>

<style lang="css" scoped>
</style>
