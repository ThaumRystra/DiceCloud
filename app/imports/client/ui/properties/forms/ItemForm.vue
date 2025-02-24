<template lang="html">
  <div class="item-form">
    <div class="layout justify-space-around">
      <div>
        <smart-switch
          :label="$t('InventoryTab.7csTJE-Hdc56U4SulNOzN')"
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
          :label="$t('AttributeConsumedForm.UmwJU_8ntBz-N8i0UgvKd')"
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
          :label="$t('ItemForm.Y_HLbO5UK3Ui8yWCsVTBp')"
          :value="model.plural"
          :error-messages="errors.plural"
          :hint="$t('ItemForm.Uhoi-fcO1xIaoI88kJCTM')"
          @change="change('plural', ...arguments)"
        />
      </v-col>

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
          prepend-inner-icon="$vuetify.icons.weight"
          :hint="$t('ItemForm.oQRP7GFX81t45GD91kkUX')"
          :value="model.weight"
          :error-messages="errors.weight"
          @change="change('weight', ...arguments)"
        />
      </v-col>
    </v-row>

    <inline-computation-field
      :label="$t('TabletopForm.nOLcz4YcyQNTwJKSAWI0K')"
      :model="model.description"
      :error-messages="errors['description.text']"
      @change="({path, value, ack}) =>
        $emit('change', {path: ['description', ...path], value, ack})"
    />

    <form-sections type="item">
      <form-section
        :name="$t('AttributeForm.yRM4XSwze2YA1X0FZY8RI')"
      >
        <v-row dense>
          <v-col
            cols="12"
            md="6"
          >
            <smart-switch
              :label="$t('ItemForm.UWBTYL3LaLrPFw0VHu-XB')"
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
              :label="$t('ActionForm.pTOkAuMdrx_hGI0E1xQl2')"
              :value="model.silent"
              :error-messages="errors.silent"
              @change="change('silent', ...arguments)"
            />
          </v-col>
        </v-row>
      </form-section>
      <form-section
        :name="$t('ItemForm.CCKYjd6Fr5AKUkkAftNPb')"
      >
        <v-row dense>
          <v-col
            cols="12"
            md="6"
          >
            <smart-switch
              :label="$t('PrintedBlockItem.SFhP2eWq7btddl4MHtwZj')"
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
                :label="$t('PrintedBlockItem.C--Y4P75TjKpuM26BDapb')"
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
