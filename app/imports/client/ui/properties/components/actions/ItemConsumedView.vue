<script setup lang="ts">
import { computed, inject } from 'vue';
import SelectItemToConsume from '/imports/client/ui/properties/components/actions/SelectItemToConsume.vue';

const props = withDefaults(defineProps<{
  model?: Record<string, any>;
  action: Record<string, any>;
}>(), {
  model: () => ({}),
});

const context = inject('context', {});
const theme = inject('theme', { isDark: false });

const quantity = computed(() => props.model.quantity?.value || 0);
const insufficient = computed(() => quantity.value > props.model.available);
</script>

<template lang="html">
  <div
    :class="{
      'v-theme--dark': theme.isDark,
      'v-theme--light': !theme.isDark,
    }"
  >
    <v-menu
      v-if="context.creatureId"
      transition="slide-y-transition"
      :disabled="!context.editPermission"
    >
      <template #activator="{ props }">
        <div
          class="d-flex align-center justify-start px-2"
          style="height: 100%;"
          :class="{
            'text-error': insufficient,
            'clickable': context.creatureId && context.editPermission,
          }"
          v-bind="props"
        >
          <svg-icon
            v-if="model.itemIcon"
            class="mr-2"
            :shape="model.itemIcon.shape"
            :color="model.itemColor"
          />
          <div
            v-if="quantity !== 1"
            class="mr-2 text-no-wrap"
            style="min-width: 24px; text-align: center;"
          >
            {{ quantity }}
          </div>
          <template v-if="model.itemId">
            <div
              class="text-no-wrap text-truncate"
            >
              {{ model.itemName }}
            </div>
            <div
              v-if="(typeof model.available) == 'number'"
              class="text-disabled text-no-wrap text-truncate ml-1 flex-shrink-0"
            >
              ({{ model.available }})
            </div>
          </template>
          <div
            v-else
            class="text-error text-no-wrap text-truncate flex"
          >
            Select item
          </div>
          <v-icon
            v-if="context.editPermission"
            style="overflow: hidden;"
          >
            mdi-menu-down
          </v-icon>
        </div>
      </template>
      <select-item-to-consume
        :action="action"
        :item-consumed="model"
      />
    </v-menu>
    <div
      v-else
      class="d-flex align-center justify-start"
    >
      <div
        class="mr-2"
        style="width: 24px; text-align: center;"
      >
        {{ quantity }}
      </div>
      <div
        class="text-no-wrap text-truncate"
      >
        [{{ model.tag }}]
      </div>
    </div>
  </div>
</template>

<style lang="css" scoped>
.clickable {
  cursor: pointer;
}
.v-theme--light .clickable:hover {
  background: rgba(0,0,0,.04);
}
.v-theme--dark .clickable:hover {
  background: hsla(0,0%,100%,.08);
}
</style>
