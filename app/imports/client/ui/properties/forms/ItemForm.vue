<template lang="html">
  <div class="item-form">
    <div class="layout justify-space-around">
      <div>
        <smart-switch
          :label="$t('properties.forms.itemForm.equipped')"
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
          :label="$t('properties.forms.itemForm.quantity')"
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
          :label="$t('properties.forms.itemForm.pluralName')"
          :value="model.plural"
          :error-messages="errors.plural"
          :hint="$t('properties.forms.itemForm.pluralNameHint')"
          @change="change('plural', ...arguments)"
        />
      </v-col>

      <v-col
        cols="12"
        md="6"
      >
        <text-field
          :label="$t('properties.forms.itemForm.value')"
          suffix="gp"
          type="number"
          min="0"
          :hint="$t('properties.forms.itemForm.valueHint')"
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
          :label="$t('properties.forms.itemForm.weight')"
          suffix="lb"
          type="number"
          min="0"
          prepend-inner-icon="$vuetify.icons.weight"
          :hint="$t('properties.forms.itemForm.weightHint')"
          :value="model.weight"
          :error-messages="errors.weight"
          @change="change('weight', ...arguments)"
        />
      </v-col>
    </v-row>

    <inline-computation-field
      :label="$t('properties.forms.common.description')"
      :model="model.description"
      :error-messages="errors['description.text']"
      @change="({path, value, ack}) =>
        $emit('change', {path: ['description', ...path], value, ack})"
    />

    <form-sections type="item">
      <form-section
        :name="$t('properties.forms.common.behavior')"
      >
        <v-row dense>
          <v-col
            cols="12"
            md="6"
          >
            <smart-switch
              :label="$t('properties.forms.itemForm.showIncrement')"
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
              :label="$t('properties.forms.actionForm.dontShowInLog')"
              :value="model.silent"
              :error-messages="errors.silent"
              @change="change('silent', ...arguments)"
            />
          </v-col>
        </v-row>
      </form-section>
      <form-section
        :name="$t('properties.forms.itemForm.attunement')"
      >
        <v-row dense>
          <v-col
            cols="12"
            md="6"
          >
            <smart-switch
              :label="$t('properties.forms.itemForm.requiresAttunement')"
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
                :label="$t('properties.forms.itemForm.attuned')"
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
