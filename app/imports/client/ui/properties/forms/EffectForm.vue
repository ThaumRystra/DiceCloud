<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { autorun } from 'vue-meteor-tracker';
import getEffectIcon from '/imports/client/ui/utility/getEffectIcon';
import TagTargeting from '/imports/client/ui/properties/forms/shared/TagTargeting.vue';
import createListOfProperties from '/imports/client/ui/properties/forms/shared/lists/createListOfProperties';

const ICON_SPIN_DURATION = 300;

const props = withDefaults(defineProps<{
  model: Record<string, any>;
  errors?: Record<string, string>;
}>(), { errors: () => ({}) });

const emit = defineEmits(['change']);

function change(path: string | string[], value: any, ack?: Function) {
  const pathArray = Array.isArray(path) ? path : [path];
  emit('change', { path: pathArray, value, ack });
}

const operations = [
  { value: 'base', text: 'Base Value' },
  { value: 'add', text: 'Add' },
  { value: 'mul', text: 'Multiply' },
  { value: 'min', text: 'Minimum' },
  { value: 'max', text: 'Maximum' },
  { value: 'set', text: 'Set' },
  { value: 'advantage', text: 'Advantage' },
  { value: 'disadvantage', text: 'Disadvantage' },
  { value: 'passiveAdd', text: 'Passive Bonus' },
  { value: 'fail', text: 'Fail' },
  { value: 'conditional', text: 'Conditional Benefit' },
];

const { result: attributeList } = autorun(() =>
  createListOfProperties({ type: { $in: ['attribute', 'skill'] } })
);

const radioGroup = computed(() =>
  props.model.targetByTags ? 'tags' : 'stats'
);

const needsValue = computed(() => {
  switch (props.model.operation) {
    case 'base': return true;
    case 'add': return true;
    case 'mul': return true;
    case 'min': return true;
    case 'max': return true;
    case 'set': return true;
    case 'advantage': return false;
    case 'disadvantage': return false;
    case 'passiveAdd': return true;
    case 'fail': return false;
    case 'conditional': return false;
    default: return true;
  }
});

const operationHint = computed(() => {
  switch (props.model.operation) {
    case 'base': return 'Stats take their largest base value, and then apply all other effects';
    case 'add': return 'Add this value to the stat';
    case 'mul': return 'Multiply the stat by this value';
    case 'min': return 'The stat will be at least this value';
    case 'max': return 'The stat will not exceed this value';
    case 'set': return 'The stat will be set to this value';
    case 'advantage': return 'If this stat is the basis for a check, that check will be at advantage';
    case 'disadvantage': return 'If this stat is the basis for a check, that check will be at advantage';
    case 'passiveAdd': return 'This value will be added to the passive check';
    case 'fail': return 'Targeted skills and checks will always fail';
    case 'conditional': return 'Add a text note to this stat';
    default: return '';
  }
});

const displayedIcon = ref('add');
const iconClass = ref('');

watch(() => props.model.operation, (newValue, oldValue) => {
  const newIcon = getEffectIcon(newValue, 1);
  if (!oldValue) {
    displayedIcon.value = newIcon;
  } else {
    iconClass.value = 'leaving';
    setTimeout(() => {
      displayedIcon.value = newIcon;
      iconClass.value = 'arriving';
      requestAnimationFrame(() => {
        iconClass.value = '';
      });
    }, ICON_SPIN_DURATION / 2);
  }
}, { immediate: true });

function changeTargetByTags(value: string, ack?: Function) {
  if (value === 'stats') {
    emit('change', { path: ['targetByTags'], value: undefined, ack });
  } else if (value === 'tags') {
    emit('change', { path: ['targetByTags'], value: true, ack });
  }
}
</script>

<template lang="html">
  <div class="effect-form">
    <v-row dense>
      <v-col
        cols="12"
        md="6"
      >
        <smart-select
          label="Operation"
          append-icon="mdi-menu-down"
          :hint="operationHint"
          :error-messages="errors.operation"
          :menu-props="{transition: 'slide-y-transition', lazy: true}"
          :items="operations"
          :value="model.operation"
          @change="change('operation', ...arguments)"
        >
          <template #prepend-inner>
            <v-icon
              class="icon ml-0"
              :class="iconClass"
            >
              {{ displayedIcon }}
            </v-icon>
          </template>
          <template
            #item="item"
          >
            <v-icon class="icon mr-2">
              {{ getEffectIcon(item.item.value, 1) }}
            </v-icon>
            {{ item.item.text }}
          </template>
        </smart-select>
      </v-col>
      <v-col
        cols="12"
        md="6"
      >
        <text-field
          v-if="model.operation === 'conditional'"
          label="Text"
          hint="The text to display on the affected stats"
          :value="model.text"
          :error-messages="errors.text"
          @change="change('text', ...arguments)"
        />
        <computed-field
          v-else
          label="Value"
          hint="Number or calculation to determine the value of this effect"
          :disabled="!needsValue"
          :model="model.amount"
          :error-messages="errors.amount"
          @change="({path, value, ack}) =>
            $emit('change', {path: ['amount', ...path], value, ack})"
        />
      </v-col>
    </v-row>

    <smart-toggle
      label="Target properties"
      :value="radioGroup"
      :options="[
        {name: 'Target by variable name', value: 'stats'},
        {name: 'Target by tags', value: 'tags'},
      ]"
      @change="changeTargetByTags"
    />

    <v-slide-y-transition hide-on-leave>
      <smart-combobox
        v-if="!model.targetByTags"
        label="Stats"
        class="mr-2"
        multiple
        small-chips
        deletable-chips
        hint="Which stats will this effect apply to"
        persistent-hint
        :value="model.stats"
        :items="attributeList"
        :error-messages="errors.stats"
        @change="change('stats', ...arguments)"
      />
      <tag-targeting
        v-if="model.targetByTags"
        :model="model"
        :errors="errors"
        @change="e => $emit('change', e)"
        @push="e => $emit('push', e)"
        @pull="e => $emit('pull', e)"
      />
    </v-slide-y-transition>
    <v-expand-transition>
      <v-col
        v-if="model.targetByTags"
        cols="12"
      >
        <text-field
          label="Target field"
          :value="model.targetField"
          hint="Target a specific calculation field on the affected properties"
          placeholder="Default field"
          persistent-placeholder
          :error-messages="errors.targetField"
          @change="change('targetField', ...arguments)"
        />
      </v-col>
    </v-expand-transition>
    <form-sections
      v-if="$slots.default"
      type="effect"
    >
      <slot />
    </form-sections>
  </div>
</template>

<style lang="css" scoped>
.v-theme--light .icon {
  color: black;
}

.icon {
  min-width: 30px;
  transition: transform 0.15s linear, opacity 0.15s ease;
  transform-origin: 18px center;
  margin-left: -12px;
}

.icon.leaving {
  transform: translateY(-24px);
  opacity: 0;
}

.icon.arriving {
  transform: translateY(24px);
  opacity: 0;
  transition: none;
}

.hidden {
  visibility: hidden;
}

.effect-form>div {
  flex-basis: 220px;
}
</style>
