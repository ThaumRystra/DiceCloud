<template lang="html">
  <v-list-item
    class="inline-proficiency layout align-center"
    :class="{'text--disabled': model.overridden}"
    dense
    @click="click"
  >
    <div class="effect-icon">
      <proficiency-icon
        :value="model.proficiency"
        class="prof-icon"
      />
    </div>
    <v-list-item-content>
      <v-list-item-title>
        <span
          class="effect-value mr-2"
        >
          {{ displayedValue }}
        </span>
        {{ displayedText }}
      </v-list-item-title>
    </v-list-item-content>
  </v-list-item>
</template>

<script lang="js">
import ProficiencyIcon from '/imports/client/ui/properties/shared/ProficiencyIcon.vue';
import numberToSignedString from '/imports/api/utility/numberToSignedString.js';

export default {
  components: {
    ProficiencyIcon,
  },
  props: {
    model: {
      type: Object,
      required: true,
    },
  },
  computed: {
    displayedText(){
      return this.model.name || (this.model.type == 'proficiency' ? 'Proficiency' : 'Skill')
    },
    displayedValue() {
      return numberToSignedString(this.model.value);
    },
  },
  methods: {
    click(e){
      this.$emit('click', e);
    },
  },
};
</script>

<style lang="css" scoped>
  .icon, .effect-icon {
    min-width: 20px;
  }
  .icon {
    color: inherit !important;
  }
  .net-effect {
    flex-grow: 0;
    flex-shrink: 0;
  }
  .effect-value {
    min-width: 30px;
    text-align: center;
  }
  .prof-icon {
    width: 24px;
    margin: 0 8px;
  }
</style>
