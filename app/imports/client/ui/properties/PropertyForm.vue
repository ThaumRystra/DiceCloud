<template>
  <div class="property-form">
    <v-row>
      <v-col
        cols="12"
        class="d-flex flex-wrap-reverse justify-end"
        style="gap: 8px"
      >
        <text-field
          ref="focusFirst"
          label="Name"
          style="flex-basis: 320px;"
          :value="model.name"
          @change="change('name', ...arguments)"
        />
        <icon-color-menu
          :model="model"
          @change="$emit('change', $event)"
        />
      </v-col>
    </v-row>
    <component
      :is="model.type"
      class="creature-property-form"
      :model="model"
      @change="$emit('change', ...arguments)"
      @push="$emit('push', ...arguments)"
      @pull="$emit('pull', ...arguments)"
    />
    <v-divider inset />
    <v-row>
      <v-col
        cols="12"
        md="6"
      >
        <smart-combobox
          label="Tags"
          multiple
          chips
          deletable-chips
          hint="Tags let other properties target this property with interactions"
          :value="model.tags"
          @change="change('tags', ...arguments)"
        />
      </v-col>
    </v-row>
    <v-row
      class="mt-1"
      dense
    >
      <v-col
        cols="12"
        class="d-flex flex-wrap-reverse justify-end"
        style="gap: 8px"
      >
        <outlined-input
          name="Child properties"
          style="width: 100%"
          class="pa-2"
        >
          <creature-properties-tree
            style="width: 100%;"
            organize
            :root="{collection: 'creatureProperties', id: model._id}"
            @selected="selectSubProperty"
          />
          <v-btn
            v-for="suggestion in suggestedChildren"
            :key="suggestion.type"
            text
            tile
            color="accent"
            data-id="insert-creature-property-btn"
            @click="$emit('add-child')"
          >
            <v-icon left>
              mdi-plus
            </v-icon>
            {{ suggestion.details.name }}
          </v-btn>
          <v-btn
            text
            tile
            color="accent"
            data-id="insert-creature-property-btn"
            @click="$emit('add-child')"
          >
            ...Other
          </v-btn>
        </outlined-input>
      </v-col>
    </v-row>
  </div>
</template>

<script lang="js">
/*
  All of the shared fields common to all properties go in this form,
  property-specific forms are included as dynamic components
*/
import ComputedField from '/imports/client/ui/properties/forms/shared/ComputedField.vue';
import InlineComputationField from '/imports/client/ui/properties/forms/shared/InlineComputationField.vue';
import FormSection, { FormSections } from '/imports/client/ui/properties/forms/shared/FormSection.vue';
import propertyFormIndex from '/imports/client/ui/properties/forms/shared/propertyFormIndex.js';
import IconColorMenu from '/imports/client/ui/properties/forms/shared/IconColorMenu.vue';
import CreaturePropertiesTree from '/imports/client/ui/creature/creatureProperties/CreaturePropertiesTree.vue';
import OutlinedInput from '/imports/client/ui/properties/viewers/shared/OutlinedInput.vue';
import { getSuggestedChildren } from '/imports/constants/PROPERTIES.js';

export default {
  components: {
    ComputedField,
    InlineComputationField,
    FormSection,
    FormSections,
    IconColorMenu,
    CreaturePropertiesTree,
    OutlinedInput,
    ...propertyFormIndex,
  },
  props: {
    model: {
      type: [Object, Array],
      default: () => ({}),
    },
    embedded: Boolean, // This dialog is embedded in a page
  },
  computed: {
    suggestedChildren() {
      if (!this.model?.type) return;
      return getSuggestedChildren(this.model.type);
    },
  },
  methods: {
    change(path, value, ack){
      if (!Array.isArray(path)){
        path = [path];
      }
      this.$emit('change', {path, value, ack});
    },
    selectSubProperty(_id){
      this.$store.commit('pushDialogStack', {
        component: 'creature-property-dialog',
        elementId: `tree-node-${_id}`,
        data: {
          _id,
          startInEditTab: this.editing,
        },
      });
    },
  },
}
</script>