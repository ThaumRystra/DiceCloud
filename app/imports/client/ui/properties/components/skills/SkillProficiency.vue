<template lang="html">
  <v-list-item
    class="proficiency-viewer layout align-center"
    v-on="!hideBreadcrumbs ? {click} : {}"
  >
    <div class="effect-icon">
      <v-tooltip bottom>
        <template #activator="{ on }">
          <v-icon
            class="mx-2"
            style="cursor: default;"
            large
            v-on="on"
          >
            {{ icon }}
          </v-icon>
        </template>
        <span>{{ proficiencyText }}</span>
      </v-tooltip>
    </div>
    <div
      class="text-h4 effect-value mr-2"
    >
      {{ proficiencyValue }}
    </div>
    <div class="layout column my-2">
      <div class="text-body-1 mb-1">
        {{ model.name || proficiencyText }}
      </div>
      <div v-if="!hideBreadcrumbs">
        <breadcrumbs
          :model="model"
          class="text-caption"
          no-links
          no-icons
          style="margin-bottom: 0"
        />
      </div>
    </div>
  </v-list-item>
</template>

<script lang="js">
  import propertyViewerMixin from '/imports/client/ui/properties/viewers/shared/propertyViewerMixin.js';
  import Breadcrumbs from '/imports/client/ui/creature/creatureProperties/Breadcrumbs.vue';
  import getProficiencyIcon from '/imports/client/ui/utility/getProficiencyIcon.js';

  export default {
    components: {
      Breadcrumbs,
    },
    mixins: [propertyViewerMixin],
    props: {
      hideBreadcrumbs: Boolean,
      proficiencyBonus: {
        type: Number,
        default: null,
      },
    },
    computed: {
      icon(){
        return getProficiencyIcon(this.model.value);
      },
      proficiencyText(){
        switch (this.model.value){
          case 0.49: return 'Half proficiency bonus rounded down';
          case 0.5: return 'Half proficiency bonus rounded up';
          case 1: return 'Proficient';
          case 2: return 'Double proficiency bonus';
          default: return '';
        }
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
    min-width: 30px;
  }
  .icon {
    color: inherit !important;
  }
  .net-effect {
    flex-grow: 0;
    flex-shrink: 0;
  }
  .effect-value {
    min-width: 60px;
    text-align: center;
  }
</style>
