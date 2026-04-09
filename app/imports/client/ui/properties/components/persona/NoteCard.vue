<template lang="html">
  <v-card
    :color="model.color"
    :data-id="model._id"
    hover
    :theme="model.color ? (isDark ? 'dark' : 'light') : undefined"
    @click="clickProperty(model._id)"
    @mouseover="hover = true"
    @mouseleave="hover = false"
  >
    <v-card-title class="text-h6">
      {{ model.name }}
    </v-card-title>
    <v-card-text v-if="model.summary">
      <property-description
        text
        :model="model.summary"
      />
    </v-card-text>
    <card-highlight
      :active="hover"
      :dark="theme.isDark"
    />
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed, inject } from 'vue';
import { useStore } from 'vuex';
import PropertyDescription from '/imports/client/ui/properties/viewers/shared/PropertyDescription.vue';
import isDarkColor from '/imports/client/ui/utility/isDarkColor';
import CardHighlight from '/imports/client/ui/components/CardHighlight.vue';

const props = defineProps<{
  model: Record<string, any>;
}>();

const store = useStore();
const theme = inject('theme', { isDark: false } as any);
const hover = ref(false);

const isDark = computed(() => isDarkColor(props.model.color));

function clickProperty(_id: string) {
  store.commit('pushDialogStack', {
    component: 'creature-property-dialog',
    elementId: `${_id}`,
    data: { _id },
  });
}
</script>

<style lang="css" scoped>

</style>
