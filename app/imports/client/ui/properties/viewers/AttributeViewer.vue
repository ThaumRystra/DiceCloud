<template lang="html">
  <div class="attribute-viewer">
    <v-row
      dense
      align="stretch"
      justify="center"
      justify-sm="start"
    >
      <property-field
        v-if="model.value !== undefined ||
          fallbackValue !== undefined"
        :name="$t('AttributeViewer.zEu8A_0XCdLVyossItEYd')"
        center
      >
        <v-spacer />
        <div class="mr-3">
          <div
            v-if="model.damage !== undefined"
            class="text-h4 mr-3"
          >
            {{ model.value }} / {{ model.total }}
          </div>
          <div
            v-if="model.value !== undefined"
            class="text-h4 mr-3"
          >
            {{ model.value }}
          </div>
          <div
            v-else
            class="mono"
          >
            {{ fallbackValue }}
          </div>
        </div>
        <v-spacer />
        <increment-button
          v-if="context.creatureId"
          outlined
          icon
          tile
          color="primary"
          :value="model.value"
          :loading="damagePropertyLoading"
          @change="damageProperty"
        />
      </property-field>
      <property-field
        v-if="model.modifier !== undefined"
        :name="$t('AttributeForm.hmMMXL0YrBcfQuwiKerBH')"
        center
        :value="isFinite(model.modifier) ?
          numberToSignedString(model.modifier) :
          model.modifier"
      >
        <div class="text-h6">
          {{ numberToSignedString(model.modifier) }}
        </div>
      </property-field>
      <property-field
        :name="$t('AttributeViewer.MNk7FUYtABwXmOJJeujzZ')"
        mono
        :value="model.variableName"
      />
      <property-field
        :name="$t('AttributeViewer.bIYmp9PJeOvM6OfGfRKdm')"
        :value="attributeTypes[model.attributeType]"
      />
      <property-field
        v-if="model.attributeType === 'hitDice' && model.hitDiceSize"
        :name="$t('AttributeViewer.AGm3xFqY_MvIqXyIH0lIw')"
        :value="model.hitDiceSize"
      />
      <property-field
        v-if="model.attributeType === 'hitDice'"
        :name="$t('AttributeViewer.UPC_7nSq-oc8wxYsumxZL')"
        :value="isFinite(model.constitutionMod) ?
          numberToSignedString(model.constitutionMod) :
          model.constitutionMod"
      />
      <property-field
        v-if="model.attributeType === 'spellSlot' && model.spellSlotLevel"
        :name="$t('AttributeForm.lPr7-xwYqNHO27hpZCuKM')"
        :value="model.spellSlotLevel.value !== undefined ? model.spellSlotLevel.value : model.spellSlotLevel.calculation"
      />
      <property-field
        v-if="model.attributeType === 'ability' && model.proficiency !== undefined"
        :name="$t('InlineProficiency.jN183F3ufg8Le9jkznJ4p')"
      >
        <v-icon
          style="height: 12px"
          class="ml-1 mr-2"
        >
          {{ proficiencyIcon }}
        </v-icon>
        <div>
          {{ proficiencyText[model.proficiency] }}
        </div>
      </property-field>
      <property-field
        v-if="reset && model.attributeType !== 'hitDice'"
        :name="$t('ResetSelector.i6eGWDKtSDJDxSkvSA9bB')"
        :value="reset"
      />
      <property-field
        v-if="model.overridden"
        :cols="{cols: 6, md: 12}"
        :name="$t('AttributeViewer.tPFT2_kLfhaS8Od_i6cAK')"
        :value=$t('AttributeViewer.JcSIdK2QZ6kcQFs94kJeh')
      />
    </v-row>
    <v-row dense>
      <property-description
        :name="$t('TabletopForm.nOLcz4YcyQNTwJKSAWI0K')"
        :model="model.description"
      />
    </v-row>
    <v-row dense>
      <property-field
        v-if="effects && effects.length"
        :cols="{col: 12}"
        :name="$t('AttributeViewer.kgj4Ky-O4dlLEDYQyGP2V')"
      >
        <v-list style="width: 100%;">
          <attribute-effect
            v-for="effect in effects"
            :key="effect._id"
            :model="effect"
            :attribute="model"
            :data-id="effect._id"
            :hide-breadcrumbs="effect._id === model._id"
            @click="effect._id !== model._id && clickEffect(effect._id)"
          />
        </v-list>
      </property-field>
    </v-row>
  </div>
</template>

<script lang="js">
  import propertyViewerMixin from '/imports/client/ui/properties/viewers/shared/propertyViewerMixin'
  import numberToSignedString from '../../../../api/utility/numberToSignedString';
  import AttributeEffect from '/imports/client/ui/properties/components/attributes/AttributeEffect.vue';
  import IncrementButton from '/imports/client/ui/components/IncrementButton.vue';
  import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties';
  import getProficiencyIcon from '/imports/client/ui/utility/getProficiencyIcon';
  import {snackbar} from '/imports/client/ui/components/snackbars/SnackbarQueue';
  import sortEffects from '/imports/client/ui/utility/sortEffects';
import doAction from '/imports/client/ui/creature/actions/doAction';
import getPropertyTitle from '/imports/client/ui/properties/shared/getPropertyTitle';

  export default {
    components: {
      AttributeEffect,
      IncrementButton,
    },
    mixins: [propertyViewerMixin],
    inject: {
      context: { default: {} }
    },
    data(){return {
      attributeTypes: {
        ability: this.$t('AttributeForm.5hpvJ6q4Hn5sFTyouCff6'),
        stat: this.$t('AttributeForm.HfQFeTAfKd1zckW8iTKeZ'),
        modifier: this.$t('AttributeForm.hmMMXL0YrBcfQuwiKerBH'),
        hitDice: this.$t('AttributeForm.Zq1j6dv8EzkcCKupgbtJJ'),
        healthBar: this.$t('AttributeForm.c26Obti6Uq4ei1OCpx5Nt'),
        resource: this.$t('AttributeForm.6n6iQ0mM-LNTUFGDgEicm'),
        spellSlot: this.$t('AttributeForm.VaJqa5cUoqNj8brF0-of6'),
        utility: this.$t('AttributeForm.QUnXaen7rDzDb624npbUE'),
      },
      proficiencyText: {
        0: this.$t('AttributeViewer.zS5I5I1HtvQ-bmZWAvNWK'),
        1: this.$t('SkillProficiency.c7_OrgWVaMZiroKapKs0O'),
        0.49: this.$t('SkillProficiency.rdG6DgAZ2pH5uGiEXs9ni'),
        0.5: this.$t('SkillProficiency.H3H4WWeJkDnYc9n0b8pee'),
        2: this.$t('SkillProficiency.Lq-INVfia0gaEurWHuCvq'),
      },
      damagePropertyLoading: false,
    }},
    computed: {
      reset(){
        let reset = this.model.reset
        if (reset === 'shortRest'){
          return this.$t('ActionViewer.mPkSelm59kG9PgRpl7PuX');
        } else if (reset === 'longRest'){
          return this.$t('ActionViewer.bN9dpIryBBN8_iI1JacWp');
        }
        return undefined;
      },
      proficiencyIcon(){
        return getProficiencyIcon(this.model.proficiency);
      },
      effects() {
        if (!this.model.effectIds) return [];
        const effects = CreatureProperties.find({ _id: { $in: this.model.effectIds } }).fetch();
        return sortEffects(effects);
      },
      fallbackValue() {
        return this.model.baseValue?.value ?? this.model.baseValue?.calculation;
      },
    },
    methods: {
      numberToSignedString,
      clickEffect(id){
        this.$store.commit('pushDialogStack', {
          component: 'creature-property-dialog',
          elementId: `${id}`,
          data: {_id: id},
        });
      },
      damageProperty({ type, value }) {
        const model = this.model;
        this.damagePropertyLoading = true;
        doAction(model, this.$store, model._id, {
          subtaskFn: 'damageProp',
          prop: model,
          targetIds: [model.root.id],
          params: {
            title: getPropertyTitle(model),
            operation: type,
            value,
            targetProp: model,
          }
        }).catch((error) => {
          snackbar({ text: error.reason || error.message || error.toString() });
          console.error(error);
        }).finally(() => {
          this.damagePropertyLoading = false;
        });
      },
    },
  }
</script>

<style lang="css" scoped>
  .ability-value {
    font-weight: 600;
    font-size: 24px !important;
    color: rgba(0, 0, 0, 0.54);
  }
  .mod, .ability-value {
    text-align: center;
    width: 100%;
  }
  .attribute-value {
    text-align: center;
  }
  .mono {
    font-family: monospace !important;
  }
</style>
