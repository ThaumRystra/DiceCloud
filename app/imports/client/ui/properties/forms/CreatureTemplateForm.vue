<template lang="html">
  <div class="creature-template-form">
    <v-row dense>
      <v-col
        cols="12"
        md="6"
      >
        <text-field
          label="Picture URL"
          hint="A link to a high resolution image"
          :value="model.picture"
          :error-messages="errors.picture"
          @change="change('picture', ...arguments)"
        />
      </v-col>
      <v-col
        cols="12"
        md="6"
      >
        <text-field
          label="Avatar picture URL"
          hint="A link to a smaller, square image to use as an avatar"
          :value="model.avatarPicture"
          :error-messages="errors.avatarPicture"
          @change="change('avatarPicture', ...arguments)"
        />
      </v-col>
    </v-row>
    <inline-computation-field
      label="Description"
      hint="A brief description of the creature shown when the creature is added to a tabletop"
      :model="model.description"
      :error-messages="errors['description.text']"
      @change="({path, value, ack}) =>
        $emit('change', {path: ['description', ...path], value, ack})"
    />

    <form-sections
      v-if="$slots.default"
      type="creatureTemplate"
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
