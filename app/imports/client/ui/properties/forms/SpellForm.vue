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
          :label="$t('SpellForm.ozk71DlHhCBkpj7s7WDH_')"
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
          :label="$t('SpellForm.M86-fX4wtA6kqG5cg-fkz')"
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
          :label="$t('SpellForm.2I910Z2ljzQsB4rom_Iaa')"
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
          :label="$t('CharacterCreationDialog.ALoCn8fXt0dv34QiFx1jx')"
          :hint="$t('SpellForm.Vex6w1JjvHUKls3pk7oFZ')"
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
          :label="$t('SpellForm.piPx3pA-W5h-qH0Z94ZsE')"
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
          :label="$t('SpellForm.ueR7vU7WQSNPP2pybozmv')"
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
          :label="$t('SpellForm.GTo5F3pHuu3BbIYKib0wi')"
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
          :label="$t('SpellForm.O5ypCXsK7hCS6k9_GsGa6')"
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
          :label="$t('CastSpellWithSlotDialog.ZJalW18LEJvZmvjZ7rbUG')"
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
          :label="$t('CastSpellWithSlotDialog._1NJvagH4wHdqwixdE6nU')"
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
          :label="$t('CastSpellWithSlotDialog.JhkgAy7hkeEm0nlKxRUKb')"
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
          :label="$t('CastSpellWithSlotDialog.pKKtVPJFsDi6EMWOmVbkP')"
          :value="model.ritual"
          :error-messages="errors.ritual"
          @change="change('ritual', ...arguments)"
        />
      </v-col>
    </v-row>
    <v-row dense>
      <v-col cols="12">
        <text-field
          :label="$t('CastSpellWithSlotDialog.3F4GREMFeI2XiZUbvbx4M')"
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
          :label="$t('ActionForm.IwoGz7GsJv8SJpY4hizQ8')"
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
            :label="$t('ActionForm.xmMtf1B_9pQbs427sDgXe')"
            :value="attackSwitch"
            @change="e => attackSwitch = e"
          />
          <computed-field
            v-else
            :label="$t('SpellForm.NOKptK1axsbZR5GD25qsU')"
            prefix="1d20 + "
            :hint="$t('SpellForm.B60Mk40GVdSVmceeTRBzX')"
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
      :label="$t('ActionForm.uMqJz6So1tbWiONiw7coZ')"
      :hint="$t('SpellForm.S2_u5BV8zB47T3bBxIhos')"
      :model="model.summary"
      :error-messages="errors['summary.text']"
      @change="({path, value, ack}) =>
        $emit('change', {path: ['summary', ...path], value, ack})"
    />
    <inline-computation-field
      :label="$t('TabletopForm.nOLcz4YcyQNTwJKSAWI0K')"
      :model="model.description"
      :error-messages="errors['description.text']"
      @change="({path, value, ack}) =>
        $emit('change', {path: ['description', ...path], value, ack})"
    />
    <form-sections type="spell">
      <form-section :name="$t('SpellForm.9vZpIPlQ0HnyTakitCf9Q')">
        <resources-form
          :model="model.resources"
          @change="({path, value, ack}) => $emit('change', {path: ['resources', ...path], value, ack})"
          @push="({path, value, ack}) => $emit('push', {path: ['resources', ...path], value, ack})"
          @pull="({path, ack}) => $emit('pull', {path: ['resources', ...path], ack})"
        />
      </form-section>

      <form-section :name="$t('SpellForm.NpAGduLy-SOfauzGzvusg')">
        <v-row dense>
          <v-col
            cols="12"
            md="6"
          >
            <computed-field
              :label="$t('ActionForm.kIN6lH7jJTD3RaF7WkyUy')"
              :hint="$t('ActionForm.7SSJSK3GiHrpECAN5kVK7')"
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
              :label="$t('ActionForm.HTFEl9P4nWPzp5aVQmtz4')"
              type="number"
              :hint="$t('ActionForm.WRR0YxFykMD9mmYmqe5no')"
              style="flex-basis: 300px;"
              :value="model.usesUsed"
              :error-messages="errors.uses"
              @change="change('usesUsed', ...arguments)"
            />
          </v-col>
        </v-row>
        <reset-selector
          :hint="$t('ActionForm.dHGbl2jpHpaOGOSg3oGeJ')"
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
          text: this.$t('SpellForm.z2plG0fUv_p1-oYE6_pND'),
          value: 'abjuration',
        }, {
          text: this.$t('SpellForm.ihIrgJDVdlbOmy7EyMKsK'),
          value: 'conjuration',
        }, {
          text: this.$t('SpellForm.-N_9-nYmodzyCbogisGic'),
          value: 'divination',
        }, {
          text: this.$t('SpellForm.nDLMtr_bs43vmERGMPWLY'),
          value: 'enchantment',
        }, {
          text: this.$t('SpellForm.ImEk1BgyaLLO2At-kgNWP'),
          value: 'evocation',
        }, {
          text: this.$t('SpellForm.MSXjPwdG3SHxJZ3bZUoCm'),
          value: 'illusion',
        }, {
          text: this.$t('SpellForm.2KoBs2FxRLtHNEQs-Bmiw'),
          value: 'necromancy',
        }, {
          text: this.$t('SpellForm.8z1c9fXQUFWv4fIiZxS0y'),
          value: 'transmutation',
        },
      ],
      spellLevels: [
        {
          text: this.$t('SpellForm.JYWYIHI5jMCfFYmdr4evi'),
          value: 0,
        }, {
          text: this.$t('SpellForm.k2avCP4iAc4PFukrCPbDo'),
          value: 1,
        }, {
          text: this.$t('SpellForm.gB89QO687cn7yLAKPwBEl'),
          value: 2,
        }, {
          text: this.$t('SpellForm.D3SyskQRf0yvJr4iiqYny'),
          value: 3,
        }, {
          text: this.$t('SpellForm.fYpzkMe6GPP_eKrEozRFH'),
          value: 4,
        }, {
          text: this.$t('SpellForm.aWfYJtUzaoAMGF1yBC4w2'),
          value: 5,
        }, {
          text: this.$t('SpellForm.X-CoR6o4seOvq1G2_aPJn'),
          value: 6,
        }, {
          text: this.$t('SpellForm.SPMNvqBQ6knw_RCmV5F91'),
          value: 7,
        }, {
          text: this.$t('SpellForm.W1uAlPfLyVbeDDAIKkger'),
          value: 8,
        }, {
          text: this.$t('SpellForm.9NG6wFrJrVLAHIN4-J0td'),
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
