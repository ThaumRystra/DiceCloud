<template lang="html">
  <smart-select
    append-icon="mdi-menu-down"
    :clearable="clearable"
    class="ml-3"
    v-bind="$attrs"
    :menu-props="{transition: 'slide-y-transition', lazy: true}"
    :items="values"
    :value="value"
    @change="(value, ack) => $emit('change', value, ack)"
  >
    <v-icon
      slot="prepend"
      class="icon"
      :class="iconClass"
    >
      {{ displayedIcon }}
    </v-icon>
  </smart-select>
</template>

<script lang="js">
  import getProficiencyIcon from '/imports/client/ui/utility/getProficiencyIcon';

  const ICON_SPIN_DURATION = 300;

  export default {
    props: {
      value: {
        type: Number,
        default: undefined,
      },
      clearable: {
        type: Boolean,
        default: true,
      },
    },
    data(){ return {
      displayedIcon: 'mdi-radiobox-blank',
      iconClass: '',
      values: [
        {value: 1, text: 'Proficient'},
        {value: 0.49, text: 'Half proficiency bonus rounded down'},
        {value: 0.5, text: 'Half proficiency bonus rounded up'},
        {value: 2, text: 'Double proficiency bonus'},
      ],
    }},
    watch: {
      'value': {
        immediate: true,
        handler(newValue){
          let newIcon = getProficiencyIcon(newValue);
          this.iconClass='leaving';
          setTimeout(() => {
            this.displayedIcon = newIcon;
            this.iconClass='arriving';
            requestAnimationFrame(() => {
              this.iconClass='';
            });
          }, ICON_SPIN_DURATION / 2);
        },
      },
    }
  }
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
</style>
