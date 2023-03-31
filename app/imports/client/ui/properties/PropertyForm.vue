<template>
  <div class="property-form">
    <v-row>
      <v-col
        cols="12"
        md="6"
      >
        <icon-color-menu
          :model="model"
          :errors="errors"
          @change="$emit('change', ...arguments)"
        />
      </v-col>
      <v-col
        cols="12"
        md="6"
      >
        <text-field
          ref="focusFirst"
          label="Name"
          :value="model.name"
          :error-messages="errors.name"
          @change="change('name', ...arguments)"
        />
      </v-col>
    </v-row>
    <component
      :is="model.type + 'Form'"
      :key="_id"
      class="creature-property-form"
      :model="model"
      @change="$emit('change', ...arguments)"
      @push="$emit('push', ...arguments)"
      @pull="$emit('pull', ...arguments)"
    />
    <v-divider inset />
    <v-row
      v-show="!embedded && childrenLength"
      class="mt-1"
      dense
    >
      <property-field
        name="Child properties"
        :cols="{cols: 12}"
      >
        <creature-properties-tree
          style="width: 100%;"
          organize
          :root="{collection: 'creatureProperties', id: model._id}"
          @length="childrenLength = $event"
          @selected="selectSubProperty"
        />
      </property-field>
    </v-row>
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

export default {
  components: {
    ComputedField,
    InlineComputationField,
    FormSection,
    FormSections,
  },
  props: {
    model: {
      type: [Object, Array],
      default: () => ({}),
    },
    errors: {
      type: Object,
      default: () => ({}),
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