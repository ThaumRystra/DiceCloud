<script setup lang="ts">
import { ref, computed, inject } from 'vue';
import { useStore } from 'vuex';
import { snackbar } from '/imports/client/ui/components/snackbars/SnackbarQueue';
import numberToSignedString from '/imports/api/utility/numberToSignedString';
import doAction from '/imports/client/ui/creature/actions/doAction';
import { key } from '/imports/client/ui/vuexStore';

const props = defineProps<{
  model: Record<string, any>;
}>();

const store = useStore(key);
const context = inject('context', {} as any);

const checkLoading = ref(false);
const hovering = ref(false);

const computedValue = computed(() => {
  if (props.model.attributeType === 'modifier' || props.model.type === 'skill') {
    return numberToSignedString(props.model.value);
  } else {
    return props.model.value;
  }
});

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
        skillVariableName: props.model.variableName,
        abilityVariableName: props.model.ability,
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

<template>
  <div
    class="d-flex align-center"
    @click="$emit('click')"
    @mouseover="$emit('mouseover')"
    @mouseleave="$emit('mouseleave')"
  >
    <v-btn
      v-if="model.attributeType === 'modifier' || model.type === 'skill'"
      class="px-0"
      variant="text"
      height="70"
      min-width="72"
      :loading="checkLoading"
      :disabled="!context.editPermission"
      @click.stop="check"
    >
      <v-card-title class="value text-h4 flex-shrink-0">
        {{ computedValue }}
      </v-card-title>
    </v-btn>
    <v-card-title
      v-else
      class="value text-h4 flex-shrink-0"
    >
      {{ computedValue }}
    </v-card-title>
    <v-card-title class="name text-subtitle-1 text-truncate d-block pl-0">
      {{ model.name }}
      <v-icon
        v-if="model.advantage > 0"
        end
      >
        mdi-chevron-double-up
      </v-icon>
      <v-icon
        v-if="model.advantage < 0"
        end
      >
        mdi-chevron-double-down
      </v-icon>
    </v-card-title>
  </div>
</template>

<style lang="css" scoped>
.value {
  min-width: 72px;
  justify-content: center;
}
</style>
