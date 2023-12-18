<template lang="html">
  <div class="spell-form">
    <v-row dense>
      <v-col
        cols="12"
        sm="6"
        md="4"
      >
        <smart-switch
          class="ml-2"
          label="Always prepared"
          :value="model.alwaysPrepared"
          :error-messages="errors.alwaysPrepared"
          @change="change('alwaysPrepared', ...arguments)"
        />
      </v-col>
      <v-col
        v-show="!model.alwaysPrepared"
        cols="12"
        sm="6"
        md="4"
      >
        <smart-switch
          class="ml-2"
          label="Prepared"
          :value="model.prepared"
          :error-messages="errors.prepared"
          @change="change('prepared', ...arguments)"
        />
      </v-col>
      <v-col
        v-show="model.level"
        cols="12"
        sm="6"
        md="4"
      >
        <smart-switch
          class="ml-2"
          label="Cast without spell slots"
          :value="model.castWithoutSpellSlots"
          :error-messages="errors.castWithoutSpellSlots"
          @change="change('castWithoutSpellSlots', ...arguments)"
        />
      </v-col>
    </v-row>
    <v-row dense>
      <v-col
        cols="12"
        md="6"
      >
        <smart-select
          label="Level"
          hint="The spell level"
          :items="spellLevels"
          :value="model.level"
          :error-messages="errors.level"
          @change="change('level', ...arguments)"
        />
      </v-col>
      <v-col
        cols="12"
        md="6"
      >
        <smart-select
          label="School"
          :items="magicSchools"
          :value="model.school"
          :error-messages="errors.school"
          @change="change('school', ...arguments)"
        />
      </v-col>
      <v-col
        cols="12"
        md="6"
      >
        <text-field
          label="Casting Time"
          :value="model.castingTime"
          :error-messages="errors.castingTime"
          @change="change('castingTime', ...arguments)"
        />
      </v-col>
      <v-col
        cols="12"
        md="6"
      >
        <text-field
          label="Range"
          :value="model.range"
          :error-messages="errors.range"
          @change="change('range', ...arguments)"
        />
      </v-col>
      <v-col
        cols="12"
        md="6"
      >
        <text-field
          label="Duration"
          :value="model.duration"
          :error-messages="errors.duration"
          @change="change('duration', ...arguments)"
        />
      </v-col>
    </v-row>
    <v-row class="mt-0">
      <v-col
        cols="6"
        md="3"
        class="pt-1"
      >
        <smart-checkbox
          label="Verbal"
          :value="model.verbal"
          :error-messages="errors.verbal"
          @change="change('verbal', ...arguments)"
        />
      </v-col>
      <v-col
        cols="6"
        md="3"
        class="pt-1"
      >
        <smart-checkbox
          label="Somatic"
          :value="model.somatic"
          :error-messages="errors.somatic"
          @change="change('somatic', ...arguments)"
        />
      </v-col>
      <v-col
        cols="6"
        md="3"
        class="pt-1"
      >
        <smart-checkbox
          label="Concentration"
          :value="model.concentration"
          :error-messages="errors.concentration"
          @change="change('concentration', ...arguments)"
        />
      </v-col>
      <v-col
        cols="6"
        md="3"
        class="pt-1"
      >
        <smart-checkbox
          label="Ritual"
          :value="model.ritual"
          :error-messages="errors.ritual"
          @change="change('ritual', ...arguments)"
        />
      </v-col>
    </v-row>
    <v-row dense>
      <v-col cols="12">
        <text-field
          label="Material"
          :value="model.material"
          :error-messages="errors.material"
          @change="change('material', ...arguments)"
        />
      </v-col>
    </v-row>
    <v-row dense>
      <v-col
        cols="12"
        md="6"
      >
        <smart-toggle
          label="Target creature"
          :value="model.target"
          :options="[
            {name: 'Single Target', value: 'singleTarget'},
            {name: 'Multiple Targets', value: 'multipleTargets'},
            {name: 'Self', value: 'self'},
          ]"
          :error-messages="errors.target"
          @change="change('target', ...arguments)"
        />
      </v-col>
      <v-col
        cols="12"
        md="6"
      >
        <v-slide-x-transition mode="out-in">
          <v-switch
            v-if="!isAttack"
            class="ml-4"
            label="Attack roll"
            :value="attackSwitch"
            @change="e => attackSwitch = e"
          />
          <computed-field
            v-else
            label="To Hit"
            prefix="1d20 + "
            hint="The bonus to attack if this action has an attack roll"
            :model="model.attackRoll"
            :error-messages="errors.attackRoll"
            @change="({path, value, ack}) =>
              $emit('change', {path: ['attackRoll', ...path], value, ack})"
          >
            <template #prepend>
              <v-btn
                :disabled="!!(model.attackRoll && model.attackRoll.calculation)"
                icon
                style="margin-top: -12px;"
                @click="attackSwitch = false"
              >
                <v-icon>mdi-close</v-icon>
              </v-btn>
            </template>
          </computed-field>
        </v-slide-x-transition>
      </v-col>
    </v-row>
    <inline-computation-field
      label="Summary"
      hint="This will appear in the action card in the character sheet, summarise what the action does"
      :model="model.summary"
      :error-messages="errors['summary.text']"
      @change="({path, value, ack}) =>
        $emit('change', {path: ['summary', ...path], value, ack})"
    />
    <inline-computation-field
      label="Description"
      :model="model.description"
      :error-messages="errors['description.text']"
      @change="({path, value, ack}) =>
        $emit('change', {path: ['description', ...path], value, ack})"
    />
    <form-sections type="spell">
      <form-section name="Resources Consumed">
        <resources-form
          :model="model.resources"
          @change="({path, value, ack}) => $emit('change', {path: ['resources', ...path], value, ack})"
          @push="({path, value, ack}) => $emit('push', {path: ['resources', ...path], value, ack})"
          @pull="({path, ack}) => $emit('pull', {path: ['resources', ...path], ack})"
        />
      </form-section>

      <form-section name="Limit Uses">
        <v-row dense>
          <v-col
            cols="12"
            md="6"
          >
            <computed-field
              label="Uses"
              hint="How many times this action can be used before needing to be reset"
              class="mr-2"
              :model="model.uses"
              :error-messages="errors.uses"
              @change="({path, value, ack}) =>
                $emit('change', {path: ['uses', ...path], value, ack})"
            />
          </v-col>
          <v-col
            cols="12"
            md="6"
          >
            <text-field
              label="Uses used"
              type="number"
              hint="How many times this action has already been used: should be 0 in most cases"
              style="flex-basis: 300px;"
              :value="model.usesUsed"
              :error-messages="errors.uses"
              @change="change('usesUsed', ...arguments)"
            />
          </v-col>
        </v-row>
        <reset-selector
          hint="When number of uses used should be reset to zero"
          :value="model.reset"
          :error-messages="errors.reset"
          @change="change('reset', ...arguments)"
        />
      </form-section>
      <slot />
    </form-sections>
  </div>
</template>

<script lang="js">
import FormSection, { FormSections } from '/imports/client/ui/properties/forms/shared/FormSection.vue';
import propertyFormMixin from '/imports/client/ui/properties/forms/shared/propertyFormMixin';
import ResourcesForm from '/imports/client/ui/properties/forms/ResourcesForm.vue';
import ResetSelector from '/imports/client/ui/components/ResetSelector.vue';

export default {
  components: {
    FormSections,
    FormSection,
    ResourcesForm,
    ResetSelector,
  },
  mixins: [propertyFormMixin],
  data() {
    return {
      magicSchools: [
        {
          text: 'Abjuration',
          value: 'abjuration',
        }, {
          text: 'Conjuration',
          value: 'conjuration',
        }, {
          text: 'Divination',
          value: 'divination',
        }, {
          text: 'Enchantment',
          value: 'enchantment',
        }, {
          text: 'Evocation',
          value: 'evocation',
        }, {
          text: 'Illusion',
          value: 'illusion',
        }, {
          text: 'Necromancy',
          value: 'necromancy',
        }, {
          text: 'Transmutation',
          value: 'transmutation',
        },
      ],
      spellLevels: [
        {
          text: 'Cantrip',
          value: 0,
        }, {
          text: 'Level 1',
          value: 1,
        }, {
          text: 'Level 2',
          value: 2,
        }, {
          text: 'Level 3',
          value: 3,
        }, {
          text: 'Level 4',
          value: 4,
        }, {
          text: 'Level 5',
          value: 5,
        }, {
          text: 'Level 6',
          value: 6,
        }, {
          text: 'Level 7',
          value: 7,
        }, {
          text: 'Level 8',
          value: 8,
        }, {
          text: 'Level 9',
          value: 9,
        },
      ],
      attackSwitch: false,
    };
  },
  computed: {
    isAttack() {
      return this.attackSwitch || !!this.model.attackRoll?.calculation
    }
  }
};
</script>

<style lang="css" scoped>
.v-input--checkbox {
  margin-top: 0;
}
</style>
