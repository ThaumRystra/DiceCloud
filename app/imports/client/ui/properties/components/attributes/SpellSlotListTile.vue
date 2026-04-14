<script setup lang="ts">
import { computed, inject, useAttrs } from 'vue';
import { useStore } from 'vuex';
import { snackbar } from '/imports/client/ui/components/snackbars/SnackbarQueue';
import doAction from '/imports/client/ui/creature/actions/doAction';
import getPropertyTitle from '/imports/client/ui/properties/shared/getPropertyTitle';
import { key } from '/imports/client/ui/vuexStore';

const props = withDefaults(defineProps<{
  model: Record<string, any>;
  dark?: boolean;
  viewOnly?: boolean;
  disabled?: boolean;
}>(), {
  dark: false,
  viewOnly: false,
  disabled: false,
});

const emit = defineEmits(['click']);
const store = useStore(key);
const context = inject('context', {} as any);
const attrs = useAttrs();

const hasClickListener = computed(() => !!attrs.onClick);
const canEdit = computed(() => (context).editPermission && !props.viewOnly);

function click(e: Event) {
  emit('click', e);
}

async function damageProperty({ type, value, ack }: { type: string; value: any; ack?: Function }) {
  const model = props.model;
  try {
    await doAction({
      creatureId: model.root.id,
      $store: store,
      elementId: `spell-slot-list-tile-${model._id}`,
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
    ack?.();
  } catch (error: any) {
    if (ack) {
      ack(error);
    } else {
      snackbar({ text: error.reason || error.message || error.toString() });
      console.error(error);
    }
  }
}
</script>

<template lang="html">
  <v-list-item
    :key="model._id"
    :data-id="`spell-slot-list-tile-${model._id}`"
    :disabled="disabled"
    class="spell-slot-list-tile"
    v-bind="$attrs"
    v-on="hasClickListener ? { click } : {}"
  >
    <v-list-item-title v-if="Number.isFinite(model.total)">
      <div
        v-if="model.total <= 0 || model.total > 5 || model.value > model.total || model.value < 0"
        class="d-flex value"
        style="align-items: baseline;"
      >
        <div
          style="font-weight: 500; font-size: 24px"
          class="current-value"
        >
          {{ model.value }}
        </div>
        <div
          v-if="model.total"
          class="ml-2 max-value"
        >
          /{{ model.total }}
        </div>
      </div>
      <div
        v-else-if="canEdit"
        class="d-flex align-center slot-bubbles"
      >
        <smart-btn
          v-for="i in model.total"
          :key="i"
          icon
          single-click
          @click="ack => damageProperty({
            type: 'increment',
            value: i <= model.value ? 1 : -1,
            ack
          })"
        >
          <v-icon>
            {{
              i > model.value ?
                'mdi-radiobox-blank' :
                'mdi-radiobox-marked'
            }}
          </v-icon>
        </smart-btn>
      </div>
      <div
        v-else
        class="d-flex align-center slot-bubbles view-only"
        :class="{ 'disabled-icon': disabled }"
      >
        <v-icon
          v-for="i in model.total"
          :key="i"
          class="ma-1"
        >
          {{
            i > model.value ?
              'mdi-radiobox-blank' :
              'mdi-radiobox-marked'
          }}
        </v-icon>
      </div>
    </v-list-item-title>
    <v-list-item-title v-else>
      <code>
        {{ model.total }}
      </code>
    </v-list-item-title>
    <v-list-item-subtitle>
      {{ model.name }}
    </v-list-item-subtitle>
  </v-list-item>
</template>

<style lang="css" scoped>
.spell-slot-list-tile {
  background: inherit;
}

.v-list__tile__action {
  width: 112px;
  flex-shrink: 0;
}

.spell-slot-list-tile.hover {
  background: #f5f5f5 !important;
}

.v-theme--dark .spell-slot-list-tile.hover {
  background: #515151 !important;
}

.disabled-icon {
  opacity: 0.3;
}

.content {
  cursor: pointer;
}

.max-value {
  color: rgba(0, 0, 0, .54);
}

.v-theme--dark .max-value {
  color: rgba(255, 255, 255, 0.54);
}
</style>
