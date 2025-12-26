<template lang="html">
  <div class="slot-form">
    <v-row dense>
      <v-col cols="12">
        <smart-select
          :label="$t('properties.forms.slotForm.type')"
          clearable
          :hint="$t('properties.forms.slotForm.typeHint')"
          :placeholder="$t('properties.forms.slotForm.anyType')"
          persistent-placeholder
          :items="slotTypes"
          :value="model.slotType"
          :error-messages="errors.slotType"
          @change="change('slotType', ...arguments)"
        />
      </v-col>
      <v-col cols="12">
        <tag-targeting
          :model="model"
          :errors="errors"
          tag-field="slotTags"
          tag-hint="Find library properties that have all of these tags"
          or-hint="Also library properties that have all of these tags instead"
          not-hint="Ignore library properties that have any of these tags"
          @change="e => $emit('change', e)"
          @push="e => $emit('push', e)"
          @pull="e => $emit('pull', e)"
        />
      </v-col>
      <v-col
        cols="12"
        md="6"
      >
        <computed-field
          :label="$t('properties.forms.slotForm.quantity')"
          :hint="$t('properties.forms.slotForm.quantityHint')"
          :placeholder="$t('properties.forms.slotForm.unlimited')"
          persistent-placeholder
          :model="model.quantityExpected"
          :error-messages="errors.quantityExpected"
          @change="({path, value, ack}) =>
            $emit('change', {path: ['quantityExpected', ...path], value, ack})"
        />
      </v-col>
      <v-col
        cols="12"
        md="6"
      >
        <computed-field
          :label="$t('properties.forms.slotForm.condition')"
          :hint="$t('properties.forms.slotForm.conditionHint')"
          :placeholder="$t('properties.forms.slotForm.alwaysActive')"
          persistent-placeholder
          :model="model.slotCondition"
          :error-messages="errors.slotCondition"
          @change="({path, value, ack}) =>
            $emit('change', {path: ['slotCondition', ...path], value, ack})"
        />
      </v-col>
      <v-col
        cols="12"
        md="6"
      >
        <smart-select
          v-if="model.type !== 'class'"
          :label="$t('properties.forms.slotForm.unique')"
          style="flex-basis: 300px;"
          clearable
          :hint="$t('properties.forms.slotForm.uniqueHint')"
          :placeholder="$t('properties.forms.slotForm.allowDuplicates')"
          persistent-placeholder
          :items="uniqueOptions"
          :value="model.unique"
          :error-messages="errors.unique"
          @change="change('unique', ...arguments)"
        />
      </v-col>
      <v-col
        v-if="context.isLibraryForm"
        cols="12"
        md="6"
      >
        <outlined-input
          name="Test"
          data-id="test-slot-button"
        >
          <v-btn
            text
            class="ma-0"
            height="54"
            width="100%"
            style="justify-content: start;"
            @click="testSlot"
          >
            Test Slot
          </v-btn>
        </outlined-input>
      </v-col>
    </v-row>
    <inline-computation-field
      :label="$t('properties.forms.common.description')"
      :model="model.description"
      :error-messages="errors['description.text']"
      @change="({path, value, ack}) =>
        $emit('change', {path: ['description', ...path], value, ack})"
    />

    <form-sections type="slot">
      <form-section :name="$t('properties.forms.common.behavior')">
        <v-row dense>
          <!--
          <v-col
            cols="12"
            md="6"
          >
            <smart-switch
              label="Hide when full"
              style="width: 200px; flex-grow: 0;"
              class="mx-2"
              :value="model.hideWhenFull"
              :error-messages="errors.hideWhenFull"
              @change="change('hideWhenFull', ...arguments)"
            />
          </v-col>
          -->
          <v-col
            cols="12"
            md="6"
          >
            <smart-switch
              :label="$t('properties.forms.slotForm.ignored')"
              style="width: 200px; flex-grow: 0;"
              class="mx-2"
              :value="model.ignored"
              :error-messages="errors.ignored"
              @change="change('ignored', ...arguments)"
            />
          </v-col>
        </v-row>
      </form-section>
      <slot />
    </form-sections>
  </div>
</template>

<script lang="js">
import propertyFormMixin from '/imports/client/ui/properties/forms/shared/propertyFormMixin';
import FormSection from '/imports/client/ui/properties/forms/shared/FormSection.vue';
import PROPERTIES from '/imports/constants/PROPERTIES';
import TagTargeting from '/imports/client/ui/properties/forms/shared/TagTargeting.vue';
import OutlinedInput from '/imports/client/ui/properties/viewers/shared/OutlinedInput.vue';

export default {
  components: {
    FormSection,
    TagTargeting,
    OutlinedInput,
  },
  mixins: [propertyFormMixin],
  inject: {
    context: { default: {} }
  },
  data() {
    let slotTypes = [];
    for (let key in PROPERTIES) {
      slotTypes.push({ text: PROPERTIES[key].name, value: key });
    }
    return {
      slotTypes,
      uniqueOptions: [{
        text: 'Each property inside this slot should be unique',
        value: 'uniqueInSlot',
      }, {
        text: 'Properties in this slot should be unique across the whole character',
        value: 'uniqueInCreature',
      }],
    };
  },
  methods: {
    testSlot() {
      if (!this.context.isLibraryForm) return;
      this.$store.commit('pushDialogStack', {
        component: 'slot-fill-dialog',
        elementId: 'test-slot-button',
        data: {
          dummySlot: this.model,
        },
      });
    }
  },
};
</script>
