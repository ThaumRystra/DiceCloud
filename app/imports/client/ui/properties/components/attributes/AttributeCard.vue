<template lang="html">
  <v-card
    :hover="hasClickListener"
    :color="model.color"
    :dark="model.color && isDark"
    :light="model.color && !isDark"
    @click="click"
    @mouseover="hasClickListener ? hovering = true : undefined"
    @mouseleave="hasClickListener ? hovering = false : undefined"
  >
    <attribute-card-content :model="model" />
    <card-highlight :active="hasClickListener && hovering" />
  </v-card>
</template>

<script lang="js">
  import CardHighlight from '/imports/client/ui/components/CardHighlight.vue';
  import AttributeCardContent from '/imports/client/ui/properties/components/attributes/AttributeCardContent.vue';
  import isDarkColor from '/imports/client/ui/utility/isDarkColor';

  export default {
    components: {
      CardHighlight,
      AttributeCardContent,
    },
    props: {
      model: {
        type: Object,
        required: true,
      },
    },
    data(){return {
      checkLoading: false,
      hovering: false,
    }},
    computed: {
      hasClickListener(){
        return this.$listeners && !!this.$listeners.click
      },
      isDark() {
        if (!this.model.color) return;
        return isDarkColor(this.model.color);
      },
    },
    methods: {
      click(e){
        this.$emit('click', e);
      },
    },
  }
</script>
