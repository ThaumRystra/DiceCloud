<template lang="html">
  <div class="creature-template-form">
    <v-row>
      <v-col
        cols="12"
        md="6"
      >
        <smart-image-input
          :label="$t('CreatureForm.ordep68gu9FPcmPbN2qNQ')"
          :hint="$t('CreatureForm.K_X3XLw_OiKsx5Gz8VKuE')"
          :value="model.picture"
          :error-messages="errors.picture"
          @change="(value, ack) => $emit('change', {path: ['picture'], value, ack})"
        />
      </v-col>
      <v-col
        cols="12"
        md="6"
      >
        <smart-image-input
          :label="$t('CreatureForm.YGtqDhW93C1P2aAq-rV2Z')"
          :hint="$t('CreatureForm.P51MPYDy7PxdpoBtc2LFA')"
          :value="model.avatarPicture"
          :error-messages="errors.avatarPicture"
          @change="(value, ack) => $emit('change', {path: ['avatarPicture'], value, ack})"
        />
      </v-col>
    </v-row>
    <inline-computation-field
      :label="$t('TabletopForm.nOLcz4YcyQNTwJKSAWI0K')"
      :hint="$t('CreatureTemplateForm.DE13oKA3fiC13FVUIh_xD')"
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
import SmartImageInput from '/imports/client/ui/components/global/SmartImageInput.vue';

export default {
  components: {
    SmartImageInput,
  },
  mixins: [propertyFormMixin],
}
</script>
