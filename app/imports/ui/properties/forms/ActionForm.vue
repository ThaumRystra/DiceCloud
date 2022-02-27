<template lang="html">
  <div class="action-form">
    <v-row
      justify="center"
      class="mb-3"
    >
      <v-col cols="12">
        <icon-color-menu
          :model="model"
          :errors="errors"
          @change="e => $emit('change', e)"
        />
      </v-col>
    </v-row>
    <v-row dense>
      <v-col
        cols="12"
        md="6"
      >
        <text-field
          ref="focusFirst"
          label="Name"
          :value="model.name"
          :error-messages="errors.name"
          @change="change('name', ...arguments)"
        />
      </v-col>
      <v-col
        cols="12"
        md="6"
      >
        <smart-select
          label="Action type"
          :items="actionTypes"
          :value="model.actionType"
          :error-messages="errors.actionType"
          :menu-props="{auto: true, lazy: true}"
          :hint="actionTypeHints[model.actionType]"
          @change="change('actionType', ...arguments)"
        />
      </v-col>
    </v-row>

    <v-slide-x-transition mode="out-in">
      <v-switch
        v-if="!isAttack"
        label="Attack roll"
        :value="attackSwitch"
        @change="e => attackSwitch = e"
      />
      <computed-field
        v-else
        label="To Hit"
        prefix="1d20 + "
        hint="The bonus to attack if this action has an attack roll"
        :model="model.attackRoll"
        :error-messages="errors.attackRoll"
        @change="({path, value, ack}) =>
          $emit('change', {path: ['attackRoll', ...path], value, ack})"
      />
    </v-slide-x-transition>

    <inline-computation-field
      label="Summary"
      hint="This will appear in the action card in the character sheet, summarise what the action does"
      :model="model.summary"
      :error-messages="errors.summary"
      @change="({path, value, ack}) =>
        $emit('change', {path: ['summary', ...path], value, ack})"
    />

    <inline-computation-field
      label="Description"
      hint="This text will be displayed in the log when the action is taken"
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
        <smart-select
          label="Target"
          style="flex-basis: 300px;"
          :items="targetOptions"
          :value="model.target"
          :error-messages="errors.target"
          :menu-props="{auto: true, lazy: true}"
          @change="change('target', ...arguments)"
        />
        <v-row dense>
          <v-col
            cols="12"
            md="6"
          >
            <computed-field
              label="Uses"
              hint="How many times this action can be used before needing to be reset"
              class="mr-2"
              :model="model.uses"
              :error-messages="errors.uses"
              @change="({path, value, ack}) =>
                $emit('change', {path: ['uses', ...path], value, ack})"
            />
          </v-col>
          <v-col
            cols="12"
            md="6"
          >
            <text-field
              label="Uses used"
              type="number"
              hint="How many times this action has already been used: should be 0 in most cases"
              style="flex-basis: 300px;"
              :value="model.usesUsed"
              :error-messages="errors.uses"
              @change="change('usesUsed', ...arguments)"
            />
          </v-col>
        </v-row>
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
  import IconColorMenu from '/imports/ui/properties/forms/shared/IconColorMenu.vue';

  export default {
    components: {
      FormSection,
      FormSections,
      ResourcesForm,
      IconColorMenu,
    },
    mixins: [propertyFormMixin],
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
        attackSwitch: false,
      };
      data.actionTypeHints = {};
      data.actionTypes.forEach(type => {
        data.actionTypeHints[type.value] = type.help;
      });
      return data;
    },
    computed: {
      isAttack(){
        return this.attackSwitch || !!this.model.attackRoll?.calculation
      }
    }
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
