<template lang="html">
  <v-card
    :hover="hasClickListener"
    @click="click"
    @mouseover="hasClickListener ? hovering = true : undefined"
    @mouseleave="hasClickListener ? hovering = false : undefined"
  >
    <attribute-card-content :model="model" />
    <card-highlight :active="hasClickListener && hovering" />
  </v-card>
</template>

<script lang="js">
  import CardHighlight from '/imports/ui/components/CardHighlight.vue';
  import AttributeCardContent from '/imports/ui/properties/components/attributes/AttributeCardContent.vue';

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
    },
    methods: {
      click(e){
        this.$emit('click', e);
      },
    },
  }
</script>
