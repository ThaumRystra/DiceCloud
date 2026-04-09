<template>
  <div class="d-flex flex-wrap">
    <div class="d-flex flex-column justify-center align-center ma-2">
      <v-btn-toggle
        :model-value="value.advantage"
        color="accent"
        @update:model-value="changeAdvantage"
      >
        <v-btn :value="-1">
          Disadvantage
        </v-btn>
        <v-btn :value="1">
          Advantage
        </v-btn>
      </v-btn-toggle>
      <div style="position: relative;">
        <v-scale-transition
          origin="center center"
        >
          <vertical-hex
            v-if="value.advantage"
            id="extra-hex"
            style="position:absolute; transition: margin-left 0.3s ease;"
            :style="{marginLeft: value.advantage == 1 ? '24px' : '-24px'}"
            disable-hover
          />
        </v-scale-transition>
        <vertical-hex
          id="roll-hex"
          @click="emit('continue')"
        >
          <div>
            Roll
          </div>
        </vertical-hex>
      </div>
    </div>
    <div class="d-flex flex-column mt-4 mr-4">
      <smart-select
        label="Ability"
        :items="abilityOptions"
        :value="value.abilityVariableName"
        @change="(value, ack) => change('abilityVariableName', value, ack)"
      />
      <smart-select
        label="Skill"
        :items="skillOptions"
        :value="value.skillVariableName"
        @change="(value, ack) => change('skillVariableName', value, ack)"
      />
      <text-field
        label="DC"
        :value="value.dc"
        @change="(value, ack) => change('dc', value, ack)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import VerticalHex from '/imports/client/ui/components/VerticalHex.vue';
import createListOfProperties from '/imports/client/ui/properties/forms/shared/lists/createListOfProperties';

const props = defineProps<{
  value: Record<string, any>;
}>();

const emit = defineEmits <{
  input: any;
  continue: [];
}>();

const abilityOptions = ref(createListOfProperties({
  attributeType: 'ability',
  'root.id': props.value.prop.root.id,
}, true));

const skillOptions = ref(createListOfProperties({
  type: 'skill',
  'root.id': props.value.prop.root.id,
}, true));

function changeAdvantage(e: number) {
  emit('input', { ...props.value, advantage: e });
}

function change(key: string, value: any, ack: Function) {
  emit('input', { ...props.value, [key]: value });
  ack();
}
</script>
