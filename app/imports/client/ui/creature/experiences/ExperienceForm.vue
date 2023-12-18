<template lang="html">
  <div class="experience-form">
    <div class="layout column align-center">
      <smart-switch
        label="Milestone"
        class="mx-3"
        :value="milestone"
        @change="makeMilestone"
      />
      <text-field
        v-if="milestone"
        label="Levels"
        type="number"
        class="base-value-field text-center large-format no-flex"
        :value="model.levels"
        :error-messages="errors.levels"
        @change="change('levels', ...arguments)"
      />
      <text-field
        v-else
        type="number"
        class="base-value-field text-center large-format no-flex"
        suffix="XP"
        autofocus
        :value="model.xp"
        :error-messages="errors.xp"
        @change="change('xp', ...arguments)"
      />
    </div>
    <text-field
      label="Name"
      :autofocus="milestone"
      :value="model.name"
      :error-messages="errors.name"
      @change="change('name', ...arguments)"
    />
  </div>
</template>

<script lang="js">
import propertyFormMixin from '/imports/client/ui/properties/forms/shared/propertyFormMixin';

export default {
  mixins: [propertyFormMixin],
  props: {
    startAsMilestone: {
      type: Boolean,
    },
  },
  data(){return {
    milestone: this.startAsMilestone,
  }},
  methods: {
    makeMilestone(milestone, ack){
      this.milestone = milestone;
      if (milestone){
        this.change('xp', undefined);
        this.change('levels', 1, ack);
      } else {
        this.change('levels', undefined, ack);
      }
    }
  }
}
</script>

<style lang="css" scoped>
</style>
