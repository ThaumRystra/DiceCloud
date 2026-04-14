<script setup lang="ts">
import { ref, computed, inject } from 'vue';
import { useStore } from 'vuex';
import ActionConditionView from '/imports/client/ui/properties/components/actions/ActionConditionView.vue';
import AttributeConsumedView from '/imports/client/ui/properties/components/actions/AttributeConsumedView.vue';
import ItemConsumedView from '/imports/client/ui/properties/components/actions/ItemConsumedView.vue';
import PropertyIcon from '/imports/client/ui/properties/shared/PropertyIcon.vue';
import updateCreatureProperty from '/imports/api/creature/creatureProperties/methods/updateCreatureProperty';
import { snackbar } from '/imports/client/ui/components/snackbars/SnackbarQueue';
import doActionFn from '/imports/client/ui/creature/actions/doAction';
import { key } from '/imports/client/ui/vuexStore';

const props = defineProps<{
  model: Record<string, any>;
  attack?: boolean;
}>();
const context = inject<any>('context', {});
const store = useStore(key);

const doActionLoading = ref(false);

const actionTypes: Record<string, string> = {
  action: 'Action',
  bonus: 'Bonus action',
  attack: 'Attack action',
  reaction: 'Reaction',
  free: 'Free action',
  long: 'Long action',
};

const targetTypes: Record<string, string> = {
  self: 'Self',
  singleTarget: 'Single target',
  multipleTargets: 'Multiple targets',
};

const reset = computed(() => {
  const r = props.model.reset;
  if (r === 'shortRest') return 'Reset on a short rest';
  if (r === 'longRest') return 'Reset on a long rest';
  return undefined;
});

const totalUses = computed(() => {
  if (!props.model.uses) return 0;
  return Math.max(props.model.uses.value || 0, 0);
});

const usesLeft = computed(() =>
  Math.max(totalUses.value - (props.model.usesUsed || 0), 0)
);

async function doAction() {
  if (props.model.type === 'spell') {
    return store.commit('pushDialogStack', {
      component: 'cast-spell-with-slot-dialog',
      elementId: 'cast-spell',
      data: {
        creatureId: props.model.root.id,
        spellId: props.model._id,
      },
    });
  }
  doActionLoading.value = true;
  try {
    await doActionFn({
      creatureId: props.model.root.id,
      $store: store,
      propId: props.model._id,
      elementId: 'do-action-button',
      targetIds: [],
    });
  } catch (e: any) {
    console.error(e);
    snackbar({ text: e.message || e.reason || e.toString() });
  } finally {
    doActionLoading.value = false;
  }
}

function resetUses() {
  updateCreatureProperty.callAsync({
    _id: props.model._id,
    path: ['usesUsed'],
    value: 0,
  });
}
</script>

<template lang="html">
  <div class="action-viewer">
    <v-row dense>
      <property-field
        v-if="context.creatureId"
        :name="model.type === 'spell' ? 'Cast spell' : 'Apply action'"
        center
      >
        <v-btn
          variant="outlined"
          style="font-size: 18px;"
          class="ma-2"
          data-id="do-action-button"
          :color="model.color || 'primary'"
          icon
          :loading="doActionLoading"
          :disabled="model.insufficientResources || !context.editPermission"
          @click.stop="doAction"
        >
          <property-icon
            right
            :model="model"
          />
        </v-btn>
      </property-field>
      <property-field
        name="To hit"
        large
        center
        signed
        :calculation="model.attackRoll"
      />
      <property-field
        name="Action type"
        :value="actionTypes[model.actionType]"
      />
      <property-field
        name="Targeting"
        :value="targetTypes[model.target]"
      />
      <property-field
        v-if="model.uses"
        name="Uses"
      >
        <template v-if="context.creatureId && model.uses.value">
          <v-spacer />
          {{ usesLeft }}/{{ model.uses.value }}
          <v-spacer />
          <v-btn
            v-if="context.creatureId"
            variant="text"
            color="primary"
            :disabled="!model.usesUsed || !context.editPermission"
            @click="resetUses"
          >
            Reset
          </v-btn>
        </template>
        <span v-else>
          <code>{{ model.uses.calculation }}</code>
        </span>
      </property-field>
      <property-field
        name="Reset"
        :value="reset"
      />
      <property-field
        v-if="model.resources.conditions && model.resources.conditions.length"
        name="Conditions"
      >
        <div style="width: 100%;">
          <action-condition-view
            v-for="condition in model.resources.conditions"
            :key="condition._id"
            class="action-child"
            :model="condition"
          />
        </div>
      </property-field>
      <property-field
        v-if="model.resources.attributesConsumed.length"
        name="Attributes consumed"
      >
        <div style="width: 100%;">
          <attribute-consumed-view
            v-for="attributeConsumed in model.resources.attributesConsumed"
            :key="attributeConsumed._id"
            class="action-child"
            :model="attributeConsumed"
          />
        </div>
      </property-field>
      <property-field
        v-if="model.resources.itemsConsumed.length"
        name="Items consumed"
      >
        <div style="width: 100%;">
          <item-consumed-view
            v-for="itemConsumed in model.resources.itemsConsumed"
            :key="itemConsumed._id"
            class="action-child"
            :model="itemConsumed"
            :action="model"
          />
        </div>
      </property-field>
      <slot />
      <property-description
        name="Summary"
        :model="model.summary"
      />
      <property-description
        name="Description"
        :model="model.description"
      />
    </v-row>
  </div>
</template>

<style lang="css" scoped>
.action-sub-title {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.action-child {
  height: 40px;
}
</style>
