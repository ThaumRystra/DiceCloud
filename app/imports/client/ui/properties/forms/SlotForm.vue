<template lang="html">
  <div class="slot-form">
    <v-row dense>
      <v-col cols="12">
        <smart-select
          :label="$t('TreeSearchInput.BAArIlU-xLOyjxKLYTPg7')"
          clearable
          :hint="$t('SlotForm.x4sMsacAn8F6rdRJrNTdK')"
          :placeholder="$t('SlotForm.gWh0qAApOp9CLIt4Ejg7A')"
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
          :label="$t('AttributeConsumedForm.UmwJU_8ntBz-N8i0UgvKd')"
          :hint="$t('SlotForm.Kcj4HuPhShey7KFdkYrD9')"
          placeholder="unlimited"
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
          :label="$t('PropertyForm.reKPKGEnAfdHpBLoywE1w')"
          :hint="$t('SlotForm.VmZxwp5mQbb7zDHack9Lf')"
          :placeholder="$t('PropertyForm.M6byRruoaG1QJnLgCQJzH')"
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
          :label="$t('SlotForm.WIu_0M9OtcK660CQC62B2')"
          style="flex-basis: 300px;"
          clearable
          :hint="$t('SlotForm.S0uRmtKemCthlYlE7wCw4')"
          :placeholder="$t('SlotForm.Bc_sIklyCRDL6M65Qh0vM')"
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
          :name="$t('SlotForm.QmA82D5rtGFyDccgUb-Q5')"
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
            {{ $t('SlotForm.5eIJH_EaVZYbtTJVTMGI9') }}
          </v-btn>
        </outlined-input>
      </v-col>
    </v-row>
    <inline-computation-field
      :label="$t('TabletopForm.nOLcz4YcyQNTwJKSAWI0K')"
      :model="model.description"
      :error-messages="errors['description.text']"
      @change="({path, value, ack}) =>
        $emit('change', {path: ['description', ...path], value, ack})"
    />

    <form-sections type="slot">
      <form-section :name="$t('AttributeForm.yRM4XSwze2YA1X0FZY8RI')">
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
              :label="$t('SlotForm.o0Kugra9XSBHf4xAXvCkV')"
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
        text: this.$t('SlotForm.85H-J_AvQcQHHk9W2-7y9'),
        value: 'uniqueInSlot',
      }, {
        text: this.$t('SlotForm.dvHDVcG6MuKwp7mIIZ9cO'),
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
