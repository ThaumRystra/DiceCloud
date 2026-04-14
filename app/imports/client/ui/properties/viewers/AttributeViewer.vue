<template lang="html">
  <div class="attribute-viewer">
    <v-row
      density="compact"
      align="stretch"
      justify="center"
      justify-sm="start"
    >
      <property-field
        v-if="model.value !== undefined ||
          fallbackValue !== undefined"
        :name="model.damage !== undefined ? 'Value / Total' : 'Value'"
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
          variant="outlined"
          icon
          rounded="0"
          color="primary"
          :data-id="`${model._id}-increment`"
          :value="model.value"
          :loading="damagePropertyLoading"
          @change="damageProperty"
        />
      </property-field>
      <property-field
        v-if="model.modifier !== undefined"
        name="Modifier"
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
        name="Variable Name"
        mono
        :value="model.variableName"
      />
      <property-field
        name="Attribute type"
        :value="attributeTypes[model.attributeType]"
      />
      <property-field
        v-if="model.attributeType === 'hitDice' && model.hitDiceSize"
        name="Hit dice size"
        :value="model.hitDiceSize"
      />
      <property-field
        v-if="model.attributeType === 'hitDice'"
        name="Constitution modifier"
        :value="isFinite(model.constitutionMod) ?
          numberToSignedString(model.constitutionMod) :
          model.constitutionMod"
      />
      <property-field
        v-if="model.attributeType === 'spellSlot' && model.spellSlotLevel"
        name="Spell slot level"
        :value="model.spellSlotLevel.value !== undefined ? model.spellSlotLevel.value : model.spellSlotLevel.calculation"
      />
      <property-field
        v-if="model.attributeType === 'ability' && model.proficiency !== undefined"
        name="Proficiency"
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
        name="Reset"
        :value="reset"
      />
      <property-field
        v-if="model.overridden"
        :cols="{ cols: 6, md: 12 }"
        name="Overridden"
        value="Overriden by another property with the same variable name"
      />
    </v-row>
    <v-row dense>
      <property-description
        name="Description"
        :model="model.description"
      />
    </v-row>
    <v-row dense>
      <property-field
        v-if="effects && effects.length"
        :cols="{ col: 12 }"
        name="Effects"
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

<script setup lang="ts">
import { ref, computed, inject } from 'vue';
import { useStore } from 'vuex';
import { autorun } from 'vue-meteor-tracker';
import numberToSignedString from '../../../../api/utility/numberToSignedString';
import AttributeEffect from '/imports/client/ui/properties/components/attributes/AttributeEffect.vue';
import IncrementButton from '/imports/client/ui/components/IncrementButton.vue';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties';
import getProficiencyIcon from '/imports/client/ui/utility/getProficiencyIcon';
import { snackbar } from '/imports/client/ui/components/snackbars/SnackbarQueue';
import sortEffects from '/imports/client/ui/utility/sortEffects';
import doActionFn from '/imports/client/ui/creature/actions/doAction';
import getPropertyTitle from '/imports/client/ui/properties/shared/getPropertyTitle';
import { key } from '/imports/client/ui/vuexStore';

const props = defineProps<{ model: Record<string, any> }>();
const context = inject<any>('context', {});
const store = useStore(key);

const attributeTypes: Record<string, string> = {
  ability: 'Ability score',
  stat: 'Stat',
  modifier: 'Modifier',
  hitDice: 'Hit dice',
  healthBar: 'Health bar',
  resource: 'Resource',
  spellSlot: 'Spell slot',
  utility: 'Utility',
};

const proficiencyText: Record<number, string> = {
  0: 'Not proficient',
  1: 'Proficient',
  0.49: 'Half proficiency bonus rounded down',
  0.5: 'Half proficiency bonus rounded up',
  2: 'Double proficiency bonus',
};

const damagePropertyLoading = ref(false);

const reset = computed(() => {
  const r = props.model.reset;
  if (r === 'shortRest') return 'Reset on a short rest';
  if (r === 'longRest') return 'Reset on a long rest';
  return undefined;
});

const proficiencyIcon = computed(() => getProficiencyIcon(props.model.proficiency));

const fallbackValue = computed(() =>
  props.model.baseValue?.value ?? props.model.baseValue?.calculation
);

const { result: effects } = autorun(() => {
  if (!props.model.effectIds) return [];
  const effectList = CreatureProperties.find({ _id: { $in: props.model.effectIds } }).fetch();
  return sortEffects(effectList);
});

function clickEffect(id: string) {
  store.commit('pushDialogStack', {
    component: 'creature-property-dialog',
    elementId: `${id}`,
    data: { _id: id },
  });
}

async function damageProperty({ type, value }: { type: string; value: number }) {
  const model = props.model;
  damagePropertyLoading.value = true;
  try {
    await doActionFn({
      creatureId: model.root.id,
      $store: store,
      elementId: `${model._id}-increment`,
      task: {
        subtaskFn: 'damageProp',
        targetIds: [model.root.id],
        params: {
          title: getPropertyTitle(model),
          operation: type,
          value,
          targetProp: model,
        },
      },
    });
  } catch (error: any) {
    snackbar({ text: error.reason || error.message || error.toString() });
    console.error(error);
  } finally {
    damagePropertyLoading.value = false;
  }
}
</script>

<style lang="css" scoped>
.ability-value {
  font-weight: 600;
  font-size: 24px !important;
  color: rgba(0, 0, 0, 0.54);
}

.mod,
.ability-value {
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
