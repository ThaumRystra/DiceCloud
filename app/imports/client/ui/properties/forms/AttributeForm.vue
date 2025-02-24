<template lang="html">
  <div class="attribute-form">
    <v-row dense>
      <v-col
        cols="12"
        md="6"
      >
        <text-field
          :label="$t('AttributeForm.vWQj52YzUPPcXSMEZ6dvh')"
          :value="model.variableName"
          :hint="$t('AttributeForm.5vD-GDW3cW8IXJrzxwTo_')"
          :error-messages="errors.variableName"
          @change="change('variableName', ...arguments)"
        />
      </v-col>
      <v-col
        cols="12"
        md="6"
      >
        <computed-field
          ref="focusFirst"
          :label="$t('AttributeForm.sg1vCF4ceatDzU2Y3bUbw')"
          class="base-value-field"
          :hint="$t('AttributeForm.vu2VNBgUUq_qRRlUmh_wV')"
          :model="model.baseValue"
          :error-messages="errors.baseValue"
          @change="({path, value, ack}) =>
            $emit('change', {path: ['baseValue', ...path], value, ack})"
        />
      </v-col>
      <v-col cols="12">
        <smart-select
          :label="$t('TreeSearchInput.BAArIlU-xLOyjxKLYTPg7')"
          :items="attributeTypes"
          :value="model.attributeType"
          :error-messages="errors.attributeType"
          :menu-props="{auto: true, lazy: true}"
          :hint="attributeTypeHints[model.attributeType]"
          @change="change('attributeType', ...arguments)"
        />
      </v-col>
      <v-expand-transition>
        <v-col
          v-if="model.attributeType === 'hitDice'"
          cols="12"
        >
          <smart-select
            :label="$t('AttributeForm.608eZxARAyNyX1lYJV1Bk')"
            :items="['d4', 'd6', 'd8', 'd10', 'd12', 'd20']"
            :value="model.hitDiceSize"
            :error-messages="errors.hitDiceSize"
            :menu-props="{auto: true, lazy: true}"
            @change="change('hitDiceSize', ...arguments)"
          />
        </v-col>
        <v-col
          v-if="model.attributeType === 'spellSlot'"
          cols="12"
        >
          <computed-field
            :label="$t('AttributeForm.lPr7-xwYqNHO27hpZCuKM')"
            :model="model.spellSlotLevel"
            :error-messages="errors.spellSlotLevel"
            @change="({path, value, ack}) =>
              $emit('change', {path: ['spellSlotLevel', ...path], value, ack})"
          />
        </v-col>
      </v-expand-transition>
    </v-row>
    <inline-computation-field
      :label="$t('TabletopForm.nOLcz4YcyQNTwJKSAWI0K')"
      :model="model.description"
      :error-messages="errors['description.text']"
      @change="({path, value, ack}) =>
        $emit('change', {path: ['description', ...path], value, ack})"
    />
    <form-sections type="attribute">
      <v-expand-transition>
        <form-section
          v-if="model.attributeType === 'healthBar'"
          :name="$t('AttributeForm.FVjxPC24B3Rg5lGdqrrOC')"
        >
          <div class="d-flex flex-column align-center mb-4">
            <div class="text-caption mb-4">
              {{ $t('AttributeForm.EhZsX8JX9x74WuNSOX6Vg') }}
            </div>
            <div
              class="d-flex flex-wrap align-center justify-start"
            >
              <outlined-input
                :name="$t('AttributeForm.xB4J2J1mjkaLNKYgrGZrW')"
                class="mb-4"
              >
                <color-picker
                  :value="model.healthBarColorMid"
                  :width="54"
                  :height="54"
                  @input="value => $emit('change', {path: ['healthBarColorMid'], value})"
                />
              </outlined-input>
              <outlined-input
                :name="$t('AttributeForm.pk4elR1L1G94TnzY6OcuS')"
                class="mb-4 ml-2"
              >
                <color-picker
                  :value="model.healthBarColorLow"
                  :width="54"
                  :height="54"
                  @input="value => $emit('change', {path: ['healthBarColorLow'], value})"
                />
              </outlined-input>
            </div>
          </div>
          <v-row dense>
            <v-col
              cols="12"
              md="4"
            >
              <text-field
                :label="$t('AttributeForm.td2_WWmRFBpLx5m7y56QX')"
                type="number"
                :hint="$t('AttributeForm.2Aiu6NaOCfyS8NLPk7Hpg')"
                :disabled="model.healthBarNoDamage"
                :value="model.healthBarDamageOrder"
                :error-messages="errors.healthBarDamageOrder"
                @change="change('healthBarDamageOrder', ...arguments)"
              />
            </v-col>
            <v-col
              cols="12"
              md="4"
              sm="6"
            >
              <smart-switch
                :label="$t('AttributeForm.ruI-LEbISdtlav6qdW_0i')"
                :value="model.healthBarNoDamage"
                :error-messages="errors.healthBarNoDamage"
                @change="change('healthBarNoDamage', ...arguments)"
              />
            </v-col>
            <v-col
              cols="12"
              md="4"
              sm="6"
            >
              <smart-switch
                :label="$t('AttributeForm.Xn1zUjmLnCU61XnSN4zYO')"
                :value="model.healthBarNoDamageOverflow"
                :error-messages="errors.healthBarNoDamageOverflow"
                @change="change('healthBarNoDamageOverflow', ...arguments)"
              />
            </v-col>
            <v-col
              cols="12"
              md="4"
            >
              <text-field
                :label="$t('AttributeForm.v6W1HsIGsKPTlCVeAvQVB')"
                type="number"
                :hint="$t('AttributeForm.FJ9V5QOXAnquEGN-B1AzC')"
                :disabled="model.healthBarNoHealing"
                :value="model.healthBarHealingOrder"
                :error-messages="errors.healthBarHealingOrder"
                @change="change('healthBarHealingOrder', ...arguments)"
              />
            </v-col>
            <v-col
              cols="12"
              md="4"
              sm="6"
            >
              <smart-switch
                :label="$t('AttributeForm.RvRkZRWrvDi4qFNjWDhAR')"
                :value="model.healthBarNoHealing"
                :error-messages="errors.healthBarNoHealing"
                @change="change('healthBarNoHealing', ...arguments)"
              />
            </v-col>
            <v-col
              cols="12"
              md="4"
              sm="6"
            >
              <smart-switch
                :label="$t('AttributeForm.vcJiP4B7PJJz6TrD802Zy')"
                :value="model.healthBarNoHealingOverflow"
                :error-messages="errors.healthBarNoHealingOverflow"
                @change="change('healthBarNoHealingOverflow', ...arguments)"
              />
            </v-col>
          </v-row>
        </form-section>
      </v-expand-transition>
      <form-section :name="$t('AttributeForm.Nhf3bIPS2M4dn_fb7Dt58')">
        <v-row dense>
          <v-col
            cols="12"
            md="6"
          >
            <text-field
              :label="$t('AttributeForm.Nhf3bIPS2M4dn_fb7Dt58')"
              type="number"
              class="damage-field text-center"
              :hint="$t('AttributeForm.ryw9qPB4RinfRXhxwKs1T')"
              :disabled="!context.isLibraryForm"
              :value="model.damage"
              :error-messages="errors.damage"
              @change="change('damage', ...arguments)"
            />
          </v-col>
          <v-col
            cols="12"
            md="6"
          >
            <reset-selector
              v-if="model.attributeType !== 'hitDice'"
              :hint="$t('AttributeForm.bEUH3HK4x3vEvSv1CQ4F-')"
              :value="model.reset"
              :error-messages="errors.reset"
              @change="change('reset', ...arguments)"
            />
          </v-col>
        </v-row>
      </form-section>
      <form-section :name="$t('AttributeForm.yRM4XSwze2YA1X0FZY8RI')"> 
        <v-row dense>
          <v-col
            cols="12"
            sm="6"
            md="4"
          >
            <smart-switch
              v-if="model.attributeType !== 'hitDice'"
              :label="$t('AttributeForm.-DPKihK3NeCXQMc2LMjLB')"
              class="mx-4"
              :value="model.decimal"
              :error-messages="errors.decimal"
              @change="change('decimal', ...arguments)"
            />
          </v-col>
          <v-col
            cols="12"
            sm="6"
            md="4"
          >
            <smart-switch
              :label="$t('AttributeForm.YvZi9u7WSXAXAJsQmHZqT')"
              class="mx-4"
              :value="model.ignoreLowerLimit"
              :error-messages="errors.ignoreLowerLimit"
              @change="change('ignoreLowerLimit', ...arguments)"
            />
          </v-col>
          <v-col
            cols="12"
            sm="6"
            md="4"
          >
            <smart-switch
              :label="$t('AttributeForm.tVNWyR4ivKTYK5bCxDrNs')"
              class="mx-4"
              :value="model.ignoreUpperLimit"
              :error-messages="errors.ignoreUpperLimit"
              @change="change('ignoreUpperLimit', ...arguments)"
            />
          </v-col>
          <v-col
            cols="12"
            sm="6"
            md="4"
          >
            <smart-switch
              :label="$t('AttributeForm.YZB2Nb2QgD78d7cH2n7-j')"
              class="mx-4"
              :value="model.hideWhenTotalZero"
              :error-messages="errors.hideWhenTotalZero"
              @change="change('hideWhenTotalZero', ...arguments)"
            />
          </v-col>
          <v-col
            cols="12"
            sm="6"
            md="4"
          >
            <smart-switch
              :label="$t('AttributeForm.Slz4MMc-dVhiu6ZVMLEaf')"
              class="mx-4"
              :value="model.hideWhenValueZero"
              :error-messages="errors.hideWhenValueZero"
              @change="change('hideWhenValueZero', ...arguments)"
            />
          </v-col>
        </v-row>
      </form-section>
      <slot />
    </form-sections>
  </div>
</template>

<script lang="js">
import FormSection from '/imports/client/ui/properties/forms/shared/FormSection.vue';
import FormSections from '/imports/client/ui/properties/forms/shared/FormSections.vue';
import propertyFormMixin from '/imports/client/ui/properties/forms/shared/propertyFormMixin';
import ColorPicker from '/imports/client/ui/components/ColorPicker.vue';
import ResetSelector from '/imports/client/ui/components/ResetSelector.vue';
import OutlinedInput from '/imports/client/ui/properties/viewers/shared/OutlinedInput.vue';

export default {
  components: {
    FormSection,
    FormSections,
    OutlinedInput,
    ColorPicker,
    ResetSelector,
  },
  mixins: [propertyFormMixin],
  inject: {
    context: { default: {} }
  },
  data() {
    let data = {
      attributeTypes: [
        {
          text: this.$t('AttributeForm.5hpvJ6q4Hn5sFTyouCff6'),
          value: 'ability',
          help: this.$t('AttributeForm.DloW6vXDl_1prYmPob3-l'),
        }, {
          text: this.$t('AttributeForm.HfQFeTAfKd1zckW8iTKeZ'),
          value: 'stat',
          help: this.$t('AttributeForm.ctttcmTh_0M7sdOTf4yhf'),
        }, {
          text: this.$t('AttributeForm.hmMMXL0YrBcfQuwiKerBH'),
          value: 'modifier',
          help: this.$t('AttributeForm.ac-HjaZ1jMyN5N8dDkBSR'),
        }, {
          text: this.$t('AttributeForm.Zq1j6dv8EzkcCKupgbtJJ'),
          value: 'hitDice',
        }, {
          text: this.$t('AttributeForm.c26Obti6Uq4ei1OCpx5Nt'),
          value: 'healthBar',
        }, {
          text: this.$t('AttributeForm.6n6iQ0mM-LNTUFGDgEicm'),
          value: 'resource',
          help: this.$t('AttributeForm.USMFXb_H8L3dsdH48GYC-')
        }, {
          text: this.$t('AttributeForm.VaJqa5cUoqNj8brF0-of6'),
          value: 'spellSlot',
        }, {
          text: this.$t('AttributeForm.QUnXaen7rDzDb624npbUE'),
          value: 'utility',
          help: this.$t('AttributeForm.zVUsvz7aiedOb83otUDoA'),
        },
      ],
      resetOptions: [
        {
          text: this.$t('ResetSelector.kWVeEgn9xE3ttsd7ywkDb'),
          value: 'shortRest',
        }, {
          text: this.$t('ResetSelector.qGXvcPldmk5aYt86yPZL-'),
          value: 'longRest',
        }
      ],
    };
    data.attributeTypeHints = {};
    data.attributeTypes.forEach(type => {
      data.attributeTypeHints[type.value] = type.help;
    });
    return data;
  },
  watch: {
    'model.attributeType': function (newVal, oldVal) {
      if (newVal === 'hitDice' && !this.model.hitDiceSize) {
        this.$emit('change', { path: ['hitDiceSize'], value: 'd8' });
      } else if (oldVal === 'hitDice') {
        this.$emit('change', { path: ['hitDiceSize'], value: undefined });
      }
    },
  }
};
</script>

<style lang="css" scoped>
.no-flex {
  flex: initial;
}

.layout.row.wrap {
  margin-right: -8px;
}

.layout.row.wrap>* {
  margin-right: 8px;
}
</style>
