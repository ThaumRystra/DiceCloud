<template lang="html">
  <div class="item-form">
    <div class="layout justify-space-around">
      <div>
        <icon-picker
          label="Icon"
          :value="model.icon"
          :error-messages="errors.icon"
          @change="change('icon', ...arguments)"
        />
      </div>
      <div>
        <smart-switch
          label="Equipped"
          :value="model.equipped"
          :error-messages="errors.equipped"
          @change="change('equipped', ...arguments)"
        />
      </div>
    </div>
    <v-row dense>
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
      <v-col
        cols="12"
        md="6"
      >
        <text-field
          label="Plural name"
          :value="model.plural"
          :error-messages="errors.plural"
          hint="The plural name of your item. If your item's name is 'sword' plural name would be 'swords'"
          @change="change('plural', ...arguments)"
        />
      </v-col>

      <v-col
        cols="12"
        md="6"
      >
        <text-field
          label="Value"
          suffix="gp"
          type="number"
          min="0"
          hint="The value of the item in gold pieces, using decimals for values less than 1 gp"
          prepend-inner-icon="$vuetify.icons.two_coins"
          :value="model.value"
          :error-messages="errors.value"
          @change="change('value', ...arguments)"
        />
      </v-col>
      <v-col
        cols="12"
        md="6"
      >
        <text-field
          label="Weight"
          suffix="lb"
          type="number"
          min="0"
          prepend-inner-icon="$vuetify.icons.weight"
          hint="The weight of a single item in lbs. Can be a decimal value"
          :value="model.weight"
          :error-messages="errors.weight"
          @change="change('weight', ...arguments)"
        />
      </v-col>
      <v-col
        cols="12"
        md="6"
      >
        <text-field
          label="Quantity"
          type="number"
          min="0"
          prepend-inner-icon="$vuetify.icons.abacus"
          :value="model.quantity"
          :error-messages="errors.quantity"
          @change="change('quantity', ...arguments)"
        />
      </v-col>
    </v-row>

    <inline-computation-field
      label="Description"
      :model="model.description"
      :error-messages="errors.description"
      @change="({path, value, ack}) =>
        $emit('change', {path: ['description', ...path], value, ack})"
    />

    <form-section
      name="Advanced"
      standalone
    >
      <smart-combobox
        label="Tags"
        class="mr-2"
        multiple
        chips
        deletable-chips
        hint="Used to let slots find this property in a library, should otherwise be left blank"
        :value="model.tags"
        :error-messages="errors.tags"
        @change="change('tags', ...arguments)"
      />
      <smart-switch
        label="Show increment button"
        :value="model.showIncrement"
        :error-messages="errors.showIncrement"
        @change="change('showIncrement', ...arguments)"
      />
      <smart-switch
        label="Requires attunement"
        :value="model.requiresAttunement"
        :error-messages="errors.requiresAttunement"
        @change="change('requiresAttunement', ...arguments)"
      />
      <v-expand-transition>
        <div
          v-show="model.requiresAttunement"
          style="padding-top: 0.1px;"
        >
          <smart-switch
            label="Attuned"
            :value="model.attuned"
            :error-messages="errors.attuned"
            @change="change('attuned', ...arguments)"
          />
        </div>
      </v-expand-transition>
    </form-section>
  </div>
</template>

<script lang="js">
import FormSection from '/imports/ui/properties/forms/shared/FormSection.vue';
import propertyFormMixin from '/imports/ui/properties/forms/shared/propertyFormMixin.js';

export default {
	components: {
		FormSection,
	},
  mixins: [propertyFormMixin],
	}
</script>
