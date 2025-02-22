<template>
  <div class="d-flex flex-wrap">
    <div class="d-flex flex-column justify-center align-center ma-2">
      <v-btn-toggle
        :value="value.advantage"
        color="accent"
        @change="changeAdvantage"
      >
        <v-btn :value="-1">
          {{ $t('AdvantageInput.sN61sdTDUmZNRJhgdk3FT') }}
        </v-btn>
        <v-btn :value="1">
          {{ $t('AdvantageInput.GOVw9p7PQMyvg1W3QMv1h') }}
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
          @click="$emit('continue')"
        >
          <div>
            {{ $t('SelectedCreatureBar.NgRLZ1KujlD3o3EtzLY3R') }}
          </div>
        </vertical-hex>
      </div>
    </div>
    <div class="d-flex flex-column mt-4 mr-4">
      <smart-select
        :label="$t('CheckInput.ZOqgwwG1rCTTKIVrY23XB')"
        :items="abilityOptions"
        :value="value.abilityVariableName"
        @change="change('abilityVariableName', ...arguments)"
      />
      <smart-select
        :label="$t('CheckInput.sKXmebGzd92GfO5RYbSPI')"
        :items="skillOptions"
        :value="value.skillVariableName"
        @change="change('skillVariableName', ...arguments)"
      />
      <text-field
        label="DC"
        :value="value.dc"
        @change="change('dc', ...arguments)"
      />
    </div>
  </div>
</template>

<script lang="js">
import VerticalHex from '/imports/client/ui/components/VerticalHex.vue';
import createListOfProperties from '/imports/client/ui/properties/forms/shared/lists/createListOfProperties';

export default {
  components: {
    VerticalHex
  },
  props: {
    /**
      advantage: 0 | 1 | -1;
      skillVariableName?: string;
      abilityVariableName?: string;
      dc: number | null;
      contest?: true;
      targetSkillVariableName?: string;
      targetAbilityVariableName?: string;
    */
    value: {
      type: Object,
      required: true,
    }
  },
  data() {
    return {
      abilityOptions: createListOfProperties({
        attributeType: 'ability',
        'root.id': this.value.prop.root.id,
      }, true),
      skillOptions: createListOfProperties({
        type: 'skill',
        'root.id': this.value.prop.root.id,
      }, true),
    };
  },
  methods: {
    changeAdvantage(e) {
      const newValue = { ...this.value, advantage: e };
      this.$emit('input', newValue)
    },
    change(key, value, ack) {
      const newValue = { ...this.value, [key]: value };
      this.$emit('input', newValue);
      ack();
    },
  }
};
</script>
