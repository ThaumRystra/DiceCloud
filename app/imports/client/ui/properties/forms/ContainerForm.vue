<template lang="html">
  <div class="container-form">
    <v-row dense>
      <v-col
        cols="12"
        md="6"
      >
        <text-field
          :label="$t('ConstantForm.aEv2NC1UXKBC9Z63kT9Jb')"
          suffix="gp"
          type="number"
          min="0"
          :hint="$t('ContainerForm.HNEQCQuOUM4yqpujztd1o')"
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
          :label="$t('ContainerForm.7KxFeshSgsphebWl6Y_Bt')"
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
          :label="$t('InventoryTab.Qyw8J_ywquzZVrLGok-D8')"
          class="mx-3"
          :hint="$t('ContainerForm.l91vHznLv6GK7YVq9yldX')"
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
          :label="$t('ContainerForm.6fXp2y5zObA-KKIPAiL3x')"
          :value="model.contentsWeightless"
          :error-messages="errors.contentsWeightless"
          @change="change('contentsWeightless', ...arguments)"
        />
      </v-col>
    </v-row>

    <inline-computation-field
      class="mt-4"
      :label="$t('TabletopForm.nOLcz4YcyQNTwJKSAWI0K')"
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
