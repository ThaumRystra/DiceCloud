<template>
  <div class="octagon-border">
    <div class="label text-center">
      {{ model.name }}
    </div>
    <div>
      Spell Save DC: {{ model.dc && model.dc.value }}
    </div>
    <div>
      Spell Attack Bonus: {{ model.attackRollBonus && model.attackRollBonus.value }}
    </div>
    <div>
      Maximum prepared spells: {{ model.maxPrepared && model.maxPrepared.value }}
    </div>
    <property-description
      text
      :model="model.description"
    />
  </div>
</template>

<script lang="js">
import PropertyDescription from '/imports/ui/properties/viewers/shared/PropertyDescription.vue';

export default {
  components: {
    PropertyDescription,
  },
  props: {
    model: {
      type: Object,
      required: true,
    },
  },
  computed: {
    
  }
}
</script>