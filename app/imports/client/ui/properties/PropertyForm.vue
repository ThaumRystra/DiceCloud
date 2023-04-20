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
          @change="(value, ack) => $emit('change', {path: ['name'], value, ack})"
        />
        <icon-color-menu
          :model="model"
          @change="e => $emit('change', e)"
        />
      </v-col>
    </v-row>
    <component
      :is="model.type"
      class="creature-property-form mb-4"
      :model="model"
      @change="e => $emit('change', e)"
      @push="e => $emit('push', e)"
      @pull="e => $emit('pull', e)"
    >
      <form-section
        v-if="context.isLibraryForm"
        name="Library Options"
      >
        <v-row 
          v-if="context.isLibraryForm"
        >
          <v-col
            cols="12"
            md="6"
          >
            <smart-select
              label="Slot Fill Type"
              style="flex-basis: 300px;"
              clearable
              hint="The property type that this slot filler pretends to be when being searched for by a slot"
              :items="slotTypes"
              :value="model.slotFillerType"
              @change="(value, ack) => $emit('change', {path: ['slotFillerType'], value, ack})"
            />
          </v-col>
          <v-col
            cols="12"
            md="6"
          >
            <text-field
              label="Slot Fill Quantity"
              type="number"
              min="0"
              hint="How many properties this counts as when filling a slot"
              :value="model.slotQuantityFilled"
              @change="(value, ack) => $emit('change', {path: ['slotQuantityFilled'], value, ack})"
            />
          </v-col>
          <v-col
            cols="12"
            md="6"
          >
            <text-field
              v-if="context.isLibraryForm"
              label="Condition"
              hint="A caclulation to determine if this property can be added to a character"
              placeholder="Always active"
              :value="model.slotFillerCondition"
              @change="(value, ack) => $emit('change', {path: ['slotFillerCondition'], value, ack})"
            />
          </v-col>
          <v-col
            cols="12"
            md="6"
          >
            <text-field
              v-if="context.isLibraryForm"
              label="Condition Error Text"
              hint="Text to display if the condition isn't met"
              placeholder="Always active"
              :value="model.slotFillerConditionNote"
              @change="(value, ack) => $emit('change', {path: ['slotFillerConditionNote'], value, ack})"
            />
          </v-col>
          <v-col
            cols="12"
            md="6"
          >
            <smart-combobox
              label="Library Tags"
              multiple
              chips
              deletable-chips
              hint="Used to let slots find this property in a library"
              :value="model.tags"
              @change="(value, ack) => $emit('change', {path: ['libraryTags'], value, ack})"
            />
          </v-col>
        </v-row>
      </form-section>
    </component>
    <v-divider
      class="mb-4"
    />
    <v-row>
      <v-col
        cols="12"
      >
        <smart-combobox
          label="Tags"
          multiple
          chips
          deletable-chips
          hint="Tags let other properties target this property with interactions"
          :value="model.tags"
          @change="(value, ack) => $emit('change', {path: ['tags'], value, ack})"
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
            :root="{collection, id: model._id}"
            :collection="collection"
            @selected="e => $emit('select-sub-property', e)"
          />
          <v-btn
            v-for="suggestion in suggestedChildren"
            :key="suggestion.type"
            tile
            plain
            :data-id="`insert-${suggestion.type}-property-btn`"
            @click="$event => $emit('add-child', {suggestedType: suggestion.type, elementId: `insert-${suggestion.type}-property-btn`})"
          >
            <v-icon left>
              mdi-plus
            </v-icon>
            {{ suggestion.details.name }}
          </v-btn>
          <v-btn
            tile
            plain
            data-id="insert-any-property-btn"
            @click="$event => $emit('add-child', {elementId: 'insert-any-property-btn'})"
          >
            <v-icon
              v-if="!suggestedChildren.length"
              left
            >
              mdi-plus
            </v-icon>
            {{ suggestedChildren.length ? '...Other' : 'Child' }}
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
import PROPERTIES from '/imports/constants/PROPERTIES.js';

const slotTypes = [];
for (let key in PROPERTIES) {
  slotTypes.push({ text: PROPERTIES[key].name, value: key });
}
    
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
  inject: {
    context: { default: {} }
  },
  props: {
    model: {
      type: [Object, Array],
      default: () => ({}),
    },
    collection: {
      type: String,
      default: 'creatureProperties'
    },
    embedded: Boolean, // This dialog is embedded in a page
  },
  data() {
    return {
      slotTypes,
    };
  },
  computed: {
    suggestedChildren() {
      if (!this.model?.type) return;
      return getSuggestedChildren(this.model.type);
    },
  },
  mounted() {
    // Don't autofocus on mobile, it brings up the on-screen keyboard
    if (this.$vuetify.breakpoint.smAndDown) return;

    setTimeout(() => {
      if (this.$refs.focusFirst && this.$refs.focusFirst.focus) {
        this.$refs.focusFirst.focus()
      }
    }, 300);
  },
  methods: {
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