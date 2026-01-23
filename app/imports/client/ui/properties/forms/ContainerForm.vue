<template lang="html">
  <div class="container-form">
    <v-row dense>
      <v-col
        cols="12"
        md="6"
      >
        <text-field
          :label="$t('properties.forms.containerForm.value')"
          suffix="gp"
          type="number"
          min="0"
          :hint="$t('properties.forms.containerForm.valueHint')"
          class="mx-1"
          style="flex-basis: 300px;"
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
          :label="$t('properties.forms.containerForm.weight')"
          suffix="lb"
          type="number"
          min="0"
          class="mx-1"
          style="flex-basis: 300px;"
          prepend-inner-icon="$vuetify.icons.weight"
          :value="model.weight"
          :error-messages="errors.weight"
          @change="change('weight', ...arguments)"
        />
      </v-col>
      <v-col
        cols="12"
        sm="6"
      >
        <smart-switch
          :label="$t('properties.forms.containerForm.carried')"
          class="mx-3"
          :hint="$t('properties.forms.containerForm.carriedHint')"
          :value="model.carried"
          :error-messages="errors.carried"
          @change="change('carried', ...arguments)"
        />
      </v-col>
      <v-col
        cols="12"
        sm="6"
      >
        <smart-switch
          :label="$t('properties.forms.containerForm.contentsWeightless')"
          :value="model.contentsWeightless"
          :error-messages="errors.contentsWeightless"
          @change="change('contentsWeightless', ...arguments)"
        />
      </v-col>
    </v-row>

    <inline-computation-field
      class="mt-4"
      :label="$t('properties.forms.common.description')"
      :model="model.description"
      :error-messages="errors['description.text']"
      @change="({path, value, ack}) =>
        $emit('change', {path: ['description', ...path], value, ack})"
    />

    <form-sections
      v-if="$slots.default"
      type="container"
    >
      <slot />
    </form-sections>
  </div>
</template>

<script lang="js">
import propertyFormMixin from '/imports/client/ui/properties/forms/shared/propertyFormMixin';

export default {
  mixins: [propertyFormMixin],
}
</script>
