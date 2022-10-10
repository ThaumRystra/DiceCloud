<template lang="html">
  <div class="effect-viewer">
    <v-row dense>
      <property-field name="Operation">
        <div
          class="layout"
          style="overflow: hidden;"
        >
          <v-icon class="mr-2">
            {{ effectIcon }}
          </v-icon>
          {{ operation }}
        </div>
      </property-field>
      <property-field
        v-if="model.operation !== 'conditional'"
        name="Amount"
        :value="displayedValue || ' '"
      />
      <property-field
        v-if="model.targetByTags"
        name="Targeted tags"
      >
        <div>
          <div class="d-flex flex-wrap">
            <v-chip
              v-for="(tag, index) in model.targetTags"
              :key="index"
              class="ma-1"
            >
              {{ tag }}
            </v-chip>
          </div>
          <div
            v-for="ex in model.extraTags"
            :key="ex._id"
          >
            <span class="ma-2">
              {{ ex.operation }}
            </span>
            <div class="d-flex flex-wrap">
              <v-chip
                v-for="(extraTag, index) in ex.tags"
                :key="index"
                class="ma-1"
              >
                {{ extraTag }}
              </v-chip>
            </div>
          </div>
        </div>
      </property-field>
      <property-field
        v-else
        name="Stats"
      >
        <div class="d-flex flex-wrap">
          <v-chip
            v-for="(stat, index) in model.stats"
            :key="index"
            class="ma-1"
          >
            {{ stat }}
          </v-chip>
        </div>
      </property-field>
      <property-field
        v-if="model.operation === 'conditional'"
        name="Text"
        :cols="{cols: 12}"
        :value="model.text || ' '"
      />
    </v-row>
  </div>
</template>

<script lang="js">
import propertyViewerMixin from '/imports/ui/properties/viewers/shared/propertyViewerMixin.js';
import getEffectIcon from '/imports/ui/utility/getEffectIcon.js';
import { isFinite } from 'lodash';

export default {
  mixins: [propertyViewerMixin],
  computed: {
    resolvedValue() {
      if (!this.model.amount) return;
      return this.model.amount.value !== undefined ?
        this.model.amount.value :
        this.model.amount.calculation;
    },
    effectIcon() {
      let value = this.resolvedValue;
      return getEffectIcon(this.model.operation, value);
    },
    operation() {
      switch (this.model.operation) {
        case 'base': return 'Base value';
        case 'add': return 'Add';
        case 'mul': return 'Multiply';
        case 'min': return 'Minimum';
        case 'max': return 'Maximum';
        case 'set': return 'Set';
        case 'advantage': return 'Advantage';
        case 'disadvantage': return 'Disadvantage';
        case 'passiveAdd': return 'Passive bonus';
        case 'fail': return 'Always fail';
        case 'conditional': return 'Conditional benefit';
        default: return this.model.operation;
      }
    },
    displayedValue() {
      let value = this.resolvedValue;
      switch (this.model.operation) {
        case 'base': return value;
        case 'add': return isFinite(value) ? Math.abs(value) : value;
        case 'mul': return value;
        case 'min': return value;
        case 'max': return value;
        case 'advantage': return;
        case 'disadvantage': return;
        case 'passiveAdd': return isFinite(value) ? Math.abs(value) : value;
        case 'fail': return;
        case 'conditional': return;
        default: return undefined;
      }
    }
  },
};
</script>

<style lang="css" scoped>
.icon {
  min-width: 30px;
}

.icon {
  color: inherit !important;
}

.net-effect {
  flex-grow: 0;
  flex-shrink: 0;
}

.value,
.calculation {
  min-width: 80px;
}
</style>
