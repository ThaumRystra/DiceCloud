<template lang="html">
  <v-menu offset-y>
    <template #activator="{ on, attrs }">
      <v-badge
        icon="mdi-pencil"
        overlap
      >
        <v-btn
          icon
          :color="model.color"
          outlined
          v-bind="attrs"
          v-on="on"
        >
          <property-icon
            :model="model"
            :color="model.color"
          />
        </v-btn>
      </v-badge>
    </template>
    <v-list>
      <v-list-item>
        <v-list-item-title>
          <icon-picker
            label="Icon"
            :value="model.icon"
            :error-messages="errors.icon"
            @change="(value, ack) =>$emit('change', {path: ['icon'], value, ack})"
          />
        </v-list-item-title>
      </v-list-item>
      <v-list-item>
        <v-list-item-title>
          <color-picker
            :value="model.color"
            @input="value =>$emit('change', {path: ['color'], value})"
          />
        </v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script lang="js">
  import PropertyIcon from '/imports/ui/properties/shared/PropertyIcon.vue';
  import ColorPicker from '/imports/ui/components/ColorPicker.vue';

  export default {
    components: {
      PropertyIcon,
      ColorPicker,
    },
    props: {
      model: {
        type: Object,
        required: true,
      },
      errors: {
        type: Object,
        required: true,
      },
    },
  }
</script>

<style lang="css" scoped>
</style>
