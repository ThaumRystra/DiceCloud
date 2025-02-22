<template lang="html">
  <div class="buff-form">
    <inline-computation-field
      :label="$t('TabletopForm.nOLcz4YcyQNTwJKSAWI0K')"
      :model="model.description"
      :error-messages="errors['description.text']"
      @change="({path, value, ack}) =>
        $emit('change', {path: ['description', ...path], value, ack})"
    />

    <!-- Duration not implemented yet
    <computed-field
      label="Duration"
      hint="How many rounds the buff lasts"
      :model="model.duration"
      :error-messages="errors.duration"
      @change="({path, value, ack}) =>
        $emit('change', {path: ['duration', ...path], value, ack})"
    />
    -->
    <smart-toggle
      v-if="!model.applied"
      :label="$t('ActionForm.IwoGz7GsJv8SJpY4hizQ8')"
      :value="model.target"
      :options="[
        {name: $t('BuffRemoverForm.wP1izzQbSh60_E36Jwhdv'), value: 'target'},
        {name: $t('ActionForm.wvr48hnF1DbxApmRDC3R0'), value: 'self'},
      ]"
      :error-messages="errors.target"
      @change="change('target', ...arguments)"
    />
    <form-sections type="buff">
      <form-section
        v-if="$slots.children"
        :name="$t('BuffRemoverForm.mfgWVnzACJzVST8OLqhdo')"
        standalone
      >
        <slot name="children" />
      </form-section>
      <form-section :name="$t('AttributeForm.yRM4XSwze2YA1X0FZY8RI')">
        <v-row dense>
          <v-col
            cols="12"
            sm="6"
            md="4"
          >
            <smart-switch
              :label="$t('BuffForm.ujGTNeS7Qt6UNdSi90bCY')"
              :value="model.hideRemoveButton"
              :error-messages="errors.hideRemoveButton"
              @change="change('hideRemoveButton', ...arguments)"
            />
          </v-col>
          <v-col
            cols="12"
            sm="6"
            md="4"
          >
            <smart-switch
              :label="$t('BuffForm.pLP5I0DeEiydJilZcbWIS')"
              :value="model.skipCrystalization"
              :error-messages="errors.skipCrystalization"
              @change="change('skipCrystalization', ...arguments)"
            />
          </v-col>
        </v-row>
      </form-section>
      <form-section :name="$t('ActionForm.7JkrChA5Oz7n_-wF0QxsW')">
        <smart-switch
          :label="$t('ActionForm.pTOkAuMdrx_hGI0E1xQl2')"
          :value="model.silent"
          :error-messages="errors.silent"
          @change="change('silent', ...arguments)"
        />
      </form-section>
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

<style lang="css" scoped>

</style>
