<template lang="html">
  <div :class="attackForm ? 'attack-form' : 'action-form'">
    <text-field
      label="Name"
      :value="model.name"
      :debounce-time="debounceTime"
      :error-messages="errors.name"
      @change="(value, ack) => $emit('change', {path: ['name'], value, ack})"
    />
    <smart-select
      label="Action type"
      :items="actionTypes"
      :value="model.actionType"
      :error-messages="errors.actionType"
      :menu-props="{auto: true, lazy: true}"
      :hint="actionTypeHints[model.actionType]"
      :debounce-time="debounceTime"
      @change="(value, ack) => $emit('change', {path: ['actionType'], value, ack})"
    />
    <text-field
      v-if="attackForm"
      label="Roll bonus"
      :value="model.rollBonus"
      :error-messages="errors.rollBonus"
      :debounce-time="debounceTime"
      @change="(value, ack) => $emit('change', {path: ['rollBonus'], value, ack})"
    />
    <form-sections>
      <form-section name="Results">
        <results-form
          :model="model.results"
          :parent-target="model.target"
          @change="({path, value, ack}) => $emit('change', {path: ['results', ...path], value, ack})"
          @push="({path, value, ack}) => $emit('push', {path: ['results', ...path], value, ack})"
          @pull="({path, ack}) => $emit('pull', {path: ['results', ...path], ack})"
        />
      </form-section>
      <form-section name="Advanced">
        <text-field
          v-if="attackForm"
          label="Ammunition"
          hint="The variable name of the item used as ammunition"
          :value="model.ammunition"
          :error-messages="errors.ammunition"
          :debounce-time="debounceTime"
          @change="(value, ack) => $emit('change', {path: ['ammunition'], value, ack})"
        />
        <v-combobox
          label="Tags"
          multiple
          chips
          deletable-chips
          box
          :value="model.tags"
          @change="(value) => $emit('change', {path: ['tags'], value})"
        />
        <smart-select
          label="Target"
          style="flex-basis: 300px;"
          :items="targetOptions"
          :value="model.target"
          :error-messages="errors.target"
          :menu-props="{auto: true, lazy: true}"
          :debounce-time="debounceTime"
          @change="(value, ack) => $emit('change', {path: ['target'], value, ack})"
        />
        <div class="layout row wrap">
          <text-field
            label="Uses"
            hint="How many times this action can be used before needing to be reset"
            style="flex-basis: 300px;"
            :value="model.uses"
            :error-messages="errors.uses"
            :debounce-time="debounceTime"
            @change="(value, ack) => $emit('change', {path: ['uses'], value, ack})"
          />
          <text-field
            label="Uses used"
            type="number"
            hint="How many times this action has already been used"
            style="flex-basis: 300px;"
            :value="model.usesUsed"
            :error-messages="errors.uses"
            :debounce-time="debounceTime"
            @change="(value, ack) => $emit('change', {path: ['usesUsed'], value, ack})"
          />
        </div>
        <smart-select
          label="Reset"
          clearable
          style="flex-basis: 300px;"
          :items="resetOptions"
          :value="model.reset"
          :error-messages="errors.reset"
          :menu-props="{auto: true, lazy: true}"
          :debounce-time="debounceTime"
          @change="(value, ack) => $emit('change', {path: ['reset'], value: value || '', ack})"
        />
      </form-section>
    </form-sections>
  </div>
</template>

<script>
  import FormSection, {FormSections} from '/imports/ui/properties/forms/shared/FormSection.vue';
  import ResultsForm from '/imports/ui/properties/forms/ResultsForm.vue';

  export default {
    components: {
      FormSection,
      FormSections,
      ResultsForm,
    },
    props: {
      stored: {
        type: Boolean,
      },
      model: {
        type: Object,
        default: () => ({}),
      },
      errors: {
        type: Object,
        default: () => ({}),
      },
      attackForm: {
        type: Boolean,
      },
      debounceTime: {
        type: Number,
        default: undefined,
      },
    },
    data(){
      let data = {
        actionTypes: [
          {
            text: 'Action',
            value: 'action',
          }, {
            text: 'Bonus action',
            value: 'bonus',
          }, {
            text: 'Attack action',
            value: 'attack',
            help: 'Attack actions replace a single attack when you choose to use your Action to attack',
          }, {
            text: 'Reaction',
            value: 'reaction',
          }, {
            text: 'Free action',
            value: 'free',
            help: 'You can take one free action on your turn without using an action or bonus action'
          }, {
            text: 'Long action',
            value: 'long',
            help: 'Long actions take longer than one turn to complete'
          },
        ],
        targetOptions: [
          {
            text: 'Self',
            value: 'self',
          }, {
            text: 'Single target',
            value: 'singleTarget',
          }, {
            text: 'Multiple targets',
            value: 'multipleTargets',
          },
        ],
        resetOptions: [
          {
            text: 'Short rest',
            value: 'shortRest',
          }, {
            text: 'Long rest',
            value: 'longRest',
          }
        ],
      };
      data.actionTypeHints = {};
      data.actionTypes.forEach(type => {
        data.actionTypeHints[type.value] = type.help;
      });
      return data;
    },
  };
</script>

<style lang="css" scoped>
  .no-flex {
    flex: initial;
  }
  .layout.row.wrap {
    margin-right: -8px;
  }
  .layout.row.wrap > *{
    margin-right: 8px;
  }
</style>
