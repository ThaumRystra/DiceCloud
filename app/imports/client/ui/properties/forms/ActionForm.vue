<template lang="html">
  <div class="action-form">
    <v-row dense>
      <v-col
        cols="12"
        md="8"
      >
        <v-slide-x-transition mode="out-in">
          <v-switch
            v-if="!isAttack"
            class="ml-4"
            label="Attack roll"
            :value="attackSwitch"
            @change="e => attackSwitch = e"
          />
          <computed-field
            v-else
            label="Base attack roll bonus"
            hint="Must be set for the action to have an attack roll"
            :model="model.attackRoll"
            :error-messages="errors.attackRoll"
            @change="({path, value, ack}) =>
              $emit('change', {path: ['attackRoll', ...path], value, ack})"
          >
            <template #prepend>
              <v-btn
                :disabled="!!(model.attackRoll && model.attackRoll.calculation)"
                icon
                style="margin-top: -12px;"
                @click="attackSwitch = false"
              >
                <v-icon>mdi-close</v-icon>
              </v-btn>
            </template>
          </computed-field>
        </v-slide-x-transition>
      </v-col>
      <v-col
        cols="12"
        md="4"
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
      <text-field
        v-if="model.actionType === 'event'"
        label="Event variable name"
        :value="model.variableName"
        hint="Variable name of the event that this action represents"
        :error-messages="errors.variableName"
        @change="change('variableName', ...arguments)"
      />
    </v-slide-x-transition>

    <smart-toggle
      label="Target creature"
      :value="model.target"
      :options="[
        {name: 'Single Target', value: 'singleTarget'},
        {name: 'Multiple Targets', value: 'multipleTargets'},
        {name: 'Self', value: 'self'},
      ]"
      :error-messages="errors.target"
      @change="change('target', ...arguments)"
    />

    <inline-computation-field
      label="Summary"
      hint="This will appear in the action card in the character sheet, summarize what the action does"
      :model="model.summary"
      :error-messages="errors['summary.text']"
      @change="({path, value, ack}) =>
        $emit('change', {path: ['summary', ...path], value, ack})"
    />

    <inline-computation-field
      label="Description"
      hint="This text will be displayed in the log when the action is taken"
      :model="model.description"
      :error-messages="errors['description.text']"
      @change="({path, value, ack}) =>
        $emit('change', {path: ['description', ...path], value, ack})"
    />

    <form-sections type="action">
      <form-section name="Resources Consumed">
        <resources-form
          :model="model.resources"
          @change="({path, value, ack}) => $emit('change', {path: ['resources', ...path], value, ack})"
          @push="({path, value, ack}) => $emit('push', {path: ['resources', ...path], value, ack})"
          @pull="({path, ack}) => $emit('pull', {path: ['resources', ...path], ack})"
        />
      </form-section>
      <form-section name="Limit Uses">
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
        <reset-selector
          hint="When number of uses used should be reset to zero"
          :value="model.reset"
          :error-messages="errors.reset"
          @change="change('reset', ...arguments)"
        />
      </form-section>
      <form-section name="Log">
        <smart-switch
          label="Don't show in log"
          class="ml-4 mt-0 mb-4"
          :value="model.silent"
          :error-messages="errors.silent"
          @change="change('silent', ...arguments)"
        />
      </form-section>
      <slot />
    </form-sections>
  </div>
</template>

<script lang="js">
import ResourcesForm from '/imports/client/ui/properties/forms/ResourcesForm.vue';
import propertyFormMixin from '/imports/client/ui/properties/forms/shared/propertyFormMixin.js';
import ResetSelector from '/imports/client/ui/components/ResetSelector.vue';

export default {
  components: {
    ResourcesForm,
    ResetSelector,
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
        }, {
          text: 'Event',
          value: 'event',
          help: 'Events are actions that happen to the character like rests or dawn'
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
