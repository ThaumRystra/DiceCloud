<template lang="html">
  <v-list-item
    class="inline-proficiency layout align-center"
    :class="{'text--disabled': model.overridden}"
    dense
    @click="click"
  >
    <div class="effect-icon">
      <proficiency-icon
        :value="model.value"
        class="prof-icon"
      />
    </div>
    <v-list-item-content>
      <v-list-item-title>
        <span
          class="effect-value mr-2"
        >
          {{ proficiencyValue }}
        </span>
        {{ displayedText }}
      </v-list-item-title>
    </v-list-item-content>
  </v-list-item>
</template>

<script lang="js">
import ProficiencyIcon from '/imports/client/ui/properties/shared/ProficiencyIcon.vue';

export default {
  components: {
    ProficiencyIcon,
  },
  props: {
    hideBreadcrumbs: Boolean,
    model: {
      type: Object,
      required: true,
    },
    proficiencyBonus: {
      type: Number,
      default: 0,
    },
  },
  computed: {
    displayedText(){
      return this.model.name || 'Proficiency'
    },
    proficiencyValue(){
        if (!this.proficiencyBonus) return;
        if (this.model.value === 0.49){
          return Math.floor(0.5 * this.proficiencyBonus);
        } else {
          return Math.ceil(this.model.value * this.proficiencyBonus);
        }
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
