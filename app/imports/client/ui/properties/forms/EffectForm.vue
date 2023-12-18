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
          <v-icon
            slot="prepend-inner"
            class="icon ml-0"
            :class="iconClass"
          >
            {{ displayedIcon }}
          </v-icon>
          <template
            slot="item"
            slot-scope="item"
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

<script lang="js">
import getEffectIcon from '/imports/client/ui/utility/getEffectIcon';
import propertyFormMixin from '/imports/client/ui/properties/forms/shared/propertyFormMixin';
import attributeListMixin from '/imports/client/ui/properties/forms/shared/lists/attributeListMixin';
import TagTargeting from '/imports/client/ui/properties/forms/shared/TagTargeting.vue';

const ICON_SPIN_DURATION = 300;
export default {
  components: {
    TagTargeting,
  },
  mixins: [propertyFormMixin, attributeListMixin],
  data() {
    return {
      displayedIcon: 'add',
      iconClass: '',
      oldOperation: undefined,
      operations: [
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
      ],
    }
  },
  computed: {
    radioGroup() {
      return this.model.targetByTags ? 'tags' : 'stats';
    },
    needsValue() {
      switch (this.model.operation) {
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
    },
    operationHint() {
      switch (this.model.operation) {
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
    },
  },
  watch: {
    'model.operation': {
      immediate: true,
      handler(newValue, oldValue) {
        let newIcon = getEffectIcon(newValue, 1);
        if (!oldValue) {
          // Skip animation
          this.displayedIcon = newIcon;
        } else {
          this.iconClass = 'leaving';
          setTimeout(() => {
            this.displayedIcon = newIcon;
            this.iconClass = 'arriving';
            requestAnimationFrame(() => {
              this.iconClass = '';
            });
          }, ICON_SPIN_DURATION / 2);
        }
      },
    },
  },
  methods: {
    getEffectIcon,
    changeTargetByTags(value, ack) {
      if (value === 'stats') {
        this.$emit('change', { path: ['targetByTags'], value: undefined, ack });
      } else if (value === 'tags') {
        this.$emit('change', { path: ['targetByTags'], value: true, ack });
      }
    },
  }
};
</script>

<style lang="css" scoped>
.theme--light .icon {
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
