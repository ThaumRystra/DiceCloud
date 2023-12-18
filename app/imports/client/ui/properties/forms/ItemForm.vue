<template lang="html">
  <div class="item-form">
    <div class="layout justify-space-around">
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
          label="Quantity"
          type="number"
          min="0"
          prepend-inner-icon="$vuetify.icons.abacus"
          :value="model.quantity"
          :error-messages="errors.quantity"
          @change="change('quantity', ...arguments)"
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
    </v-row>

    <inline-computation-field
      label="Description"
      :model="model.description"
      :error-messages="errors['description.text']"
      @change="({path, value, ack}) =>
        $emit('change', {path: ['description', ...path], value, ack})"
    />

    <form-sections type="item">
      <form-section
        name="Behavior"
      >
        <v-row dense>
          <v-col
            cols="12"
            md="6"
          >
            <smart-switch
              label="Show increment button"
              :value="model.showIncrement"
              :error-messages="errors.showIncrement"
              @change="change('showIncrement', ...arguments)"
            />
          </v-col>
          <v-col
            cols="12"
            md="6"
          >
            <smart-switch
              label="Don't show in log"
              :value="model.silent"
              :error-messages="errors.silent"
              @change="change('silent', ...arguments)"
            />
          </v-col>
        </v-row>
      </form-section>
      <form-section
        name="Attunement"
      >
        <v-row dense>
          <v-col
            cols="12"
            md="6"
          >
            <smart-switch
              label="Requires attunement"
              :value="model.requiresAttunement"
              :error-messages="errors.requiresAttunement"
              @change="change('requiresAttunement', ...arguments)"
            />
          </v-col>
          <v-slide-x-transition>
            <v-col
              v-show="model.requiresAttunement"
              cols="12"
              md="6"
            >
              <smart-switch
                label="Attuned"
                :value="model.attuned"
                :error-messages="errors.attuned"
                @change="change('attuned', ...arguments)"
              />
            </v-col>
          </v-slide-x-transition>
        </v-row>
      </form-section>
      <slot />
    </form-sections>
  </div>
</template>

<script lang="js">
import FormSection from '/imports/client/ui/properties/forms/shared/FormSection.vue';
import propertyFormMixin from '/imports/client/ui/properties/forms/shared/propertyFormMixin';

export default {
  components: {
    FormSection,
  },
  mixins: [propertyFormMixin],
}
</script>
