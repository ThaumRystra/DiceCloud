<template lang="html">
  <v-list-item
    class="ability-list-tile pl-0"
    v-on="hasClickListener ? {click} : {}"
  >
    <template #prepend>
      <v-btn
        class="mr-4 py-2"
        variant="text"
        height="82"
        :data-id="`check-btn-${model._id}`"
        :loading="checkLoading"
        :disabled="!context.editPermission"
        @click.stop="check"
      >
        <div>
          <div class="text-h4 mod">
            <template v-if="swapScoresAndMods">
              <span :class="{'text-primary': model.total !== model.value}">
                {{ model.value }}
              </span>
            </template>
            <template v-else>
              {{ numberToSignedString(model.modifier) }}
            </template>
          </div>
          <div class="text-h6 value">
            <template v-if="swapScoresAndMods">
              {{ numberToSignedString(model.modifier) }}
            </template>
            <template v-else>
              <span :class="{'text-primary': model.total !== model.value}">
                {{ model.value }}
              </span>
            </template>
          </div>
        </div>
      </v-btn>
    </template>

    <v-list-item-title>
        {{ model.name }}
        <v-icon
          v-if="model.advantage > 0"
          right
        >
          mdi-chevron-double-up
        </v-icon>
        <v-icon
          v-if="model.advantage < 0"
          right
        >
          mdi-chevron-double-down
        </v-icon>
      </v-list-item-title>
  </v-list-item>
</template>

<script setup lang="ts">
import { ref, computed, useAttrs, inject } from 'vue';
import { autorun } from 'vue-meteor-tracker';
import { useStore } from 'vuex';
import numberToSignedString from '/imports/api/utility/numberToSignedString';
import { snackbar } from '/imports/client/ui/components/snackbars/SnackbarQueue';
import doAction from '/imports/client/ui/creature/actions/doAction';

const props = defineProps<{
  model: Record<string, any>;
}>();

const emit = defineEmits(['click']);
const store = useStore();
const context = inject('context', {} as any);
const attrs = useAttrs();

const checkLoading = ref(false);

const hasClickListener = computed(() => !!attrs.onClick);

const { result: swapScoresAndMods } = autorun(() => {
  const user = Meteor.user();
  return user?.preferences?.swapAbilityScoresAndModifiers;
});

function click(e: Event) {
  emit('click', e);
}

async function check() {
  checkLoading.value = true;
  try {
    await doAction({
      creatureId: props.model.root.id,
      $store: store,
      elementId: `check-btn-${props.model._id}`,
      task: {
        subtaskFn: 'check',
        targetIds: [props.model.root.id],
        advantage: props.model.advantage,
        skillVariableName: undefined,
        abilityVariableName: props.model.variableName,
        dc: null,
      },
    });
  } catch (error: any) {
    snackbar({ text: error.reason || error.message || error.toString() });
    console.error(error);
  } finally {
    checkLoading.value = false;
  }
}
</script>

<style lang="css" scoped>
.ability-list-tile {
  background: inherit;
}

.ability-list-tile :deep(.v-list-item) {
  height: 88px;
}

.ability-list-tile :deep(.v-list-item__append) {
  justify-content: center;
}

.value {
  font-weight: 600;
  font-size: 24px !important;
  color: rgba(0, 0, 0, 0.54);
}

.v-theme--dark .value {
  color: rgba(255, 255, 255, 0.54);
}

.mod,
.value {
  text-align: center;
  width: 100%;
  min-width: 42px;
}
</style>
