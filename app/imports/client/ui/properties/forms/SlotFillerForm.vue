<template>
  <div class="slot-filler-form">
    <v-row
      dense
      align="start"
    >
      <v-col
        cols="12"
        sm="9"
        md="10"
      >
        <text-field
          ref="focusFirst"
          label="Name"
          :value="model.name"
          :error-messages="errors.name"
          @change="change('name', ...arguments)"
        />
      </v-col>
      <v-col
        cols="12"
        sm="3"
        md="2"
      >
        <icon-picker
          :value="model.icon"
          :error-messages="errors.icon"
          height="56"
          width="100%"
          button-style="margin-bottom: 30px;"
          @change="change('icon', ...arguments)"
        />
      </v-col>
    </v-row>
    <text-area
      label="Description"
      :value="model.description"
      :error-messages="errors.description"
      @change="change('description', ...arguments)"
    />

    <text-field
      label="Picture URL"
      hint="A link to an image representing this property"
      :value="model.picture"
      :error-messages="errors.picture"
      @change="change('picture', ...arguments)"
    />
    <smart-select
      label="Type"
      style="flex-basis: 300px;"
      clearable
      hint="The property type that this slot filler pretends to be when being searched for by a slot"
      :items="slotTypes"
      :value="model.slotFillerType"
      :error-messages="errors.slotFillerType"
      @change="change('slotFillerType', ...arguments)"
    />
    <text-field
      label="Quantity"
      type="number"
      min="0"
      hint="How many properties this counts as when filling a slot"
      :value="model.slotQuantityFilled"
      :error-messages="errors.slotQuantityFilled"
      @change="change('slotQuantityFilled', ...arguments)"
    />
    <text-field
      v-if="context.isLibraryForm"
      label="Condition"
      hint="A caclulation to determine if this can be added to the character"
      placeholder="Always active"
      :value="model.slotFillerCondition"
      :error-messages="errors.slotFillerCondition"
      @change="change('slotFillerCondition', ...arguments)"
    />
    <smart-combobox
      label="Tags"
      multiple
      chips
      deletable-chips
      hint="Used to let slots find this slot filler in a library"
      :value="model.tags"
      :error-messages="errors.tags"
      @change="change('tags', ...arguments)"
    />
    <form-section
      v-if="$slots.children"
      name="Children"
      standalone
    >
      <slot name="children" />
    </form-section>
  </div>
</template>

<script>
import propertyFormMixin from '/imports/client/ui/properties/forms/shared/propertyFormMixin.js';
import PROPERTIES from '/imports/constants/PROPERTIES.js';

export default {
  mixins: [propertyFormMixin],
  inject: {
    context: { default: {} }
  },
  data() {
    let slotTypes = [];
    for (let key in PROPERTIES) {
      slotTypes.push({ text: PROPERTIES[key].name, value: key });
    }
    return { slotTypes };
  },
};
</script>
