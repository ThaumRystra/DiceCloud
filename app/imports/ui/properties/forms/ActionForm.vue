<template lang="html">
  <div :class="attackForm ? 'attack-form' : 'action-form'">
    <div class="layout column align-center">
      <icon-picker
        label="Icon"
        :value="model.icon"
        :error-messages="errors.icon"
        @change="change('icon', ...arguments)"
      />
    </div>
    <text-field
      ref="focusFirst"
      label="Name"
      :value="model.name"
      :error-messages="errors.name"
      @change="change('name', ...arguments)"
    />
    <smart-select
      label="Action type"
      :items="actionTypes"
      :value="model.actionType"
      :error-messages="errors.actionType"
      :menu-props="{auto: true, lazy: true}"
      :hint="actionTypeHints[model.actionType]"
      @change="change('actionType', ...arguments)"
    />

    <computed-field
      label="Roll bonus"
      hint="A number (or calculation which returns a number) that is added to a d20 when making the attack roll"
      :model="model.rollBonus"
      :error-messages="errors.rollBonus"
      @change="({path, value, ack}) =>
        $emit('change', {path: ['rollBonus', ...path], value, ack})"
    />

    <inline-computation-field
      label="Summary"
      hint="This will appear in the action card in the character sheet"
      :model="model.summary"
      :error-messages="errors.summary"
      @change="({path, value, ack}) =>
        $emit('change', {path: ['summary', ...path], value, ack})"
    />

    <inline-computation-field
      label="Description"
      hint="The rest of the description that doesn't fit in the summary goes here"
      :model="model.description"
      :error-messages="errors.description"
      @change="({path, value, ack}) =>
        $emit('change', {path: ['description', ...path], value, ack})"
    />

    <form-sections>
      <form-section name="Resources">
        <resources-form
          :model="model.resources"
          @change="({path, value, ack}) => $emit('change', {path: ['resources', ...path], value, ack})"
          @push="({path, value, ack}) => $emit('push', {path: ['resources', ...path], value, ack})"
          @pull="({path, ack}) => $emit('pull', {path: ['resources', ...path], ack})"
        />
      </form-section>
      <form-section name="Advanced">
        <smart-combobox
          label="Tags"
          multiple
          chips
          deletable-chips
          hint="Used to let slots find this property in a library, should otherwise be left blank"
          :value="model.tags"
          @change="change('tags', ...arguments)"
        />
        <!--
        <smart-select
          label="Target"
          style="flex-basis: 300px;"
          :items="targetOptions"
          :value="model.target"
          :error-messages="errors.target"
          :menu-props="{auto: true, lazy: true}"
          @change="change('target', ...arguments)"
        />
        -->
        <div class="layout wrap">
          <computed-field
            label="Uses"
            hint="How many times this action can be used before needing to be reset"
            :model="model.uses"
            :error-messages="errors.uses"
            @change="({path, value, ack}) =>
              $emit('change', {path: ['uses', ...path], value, ack})"
          />
          <text-field
            label="Uses used"
            type="number"
            hint="How many times this action has already been used: should be 0 in most cases"
            style="flex-basis: 300px;"
            :value="model.usesUsed"
            :error-messages="errors.uses"
            @change="change('usesUsed', ...arguments)"
          />
        </div>
        <smart-select
          label="Reset"
          clearable
          hint="When number of uses used should be reset to zero"
          style="flex-basis: 300px;"
          :items="resetOptions"
          :value="model.reset"
          :error-messages="errors.reset"
          :menu-props="{auto: true, lazy: true}"
          @change="change('reset', ...arguments)"
        />
      </form-section>
    </form-sections>
  </div>
</template>

<script lang="js">
  import FormSection, {FormSections} from '/imports/ui/properties/forms/shared/FormSection.vue';
  import ResourcesForm from '/imports/ui/properties/forms/ResourcesForm.vue';
  import propertyFormMixin from '/imports/ui/properties/forms/shared/propertyFormMixin.js';

  export default {
    components: {
      FormSection,
      FormSections,
      ResourcesForm,
    },
    mixins: [propertyFormMixin],
    props: {
      attackForm: {
        type: Boolean,
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
