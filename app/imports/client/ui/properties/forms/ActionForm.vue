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
            :label="$t('ActionForm.xmMtf1B_9pQbs427sDgXe')"
            :value="attackSwitch"
            @change="e => attackSwitch = e"
          />
          <computed-field
            v-else
            :label="$t('ActionForm.qRNU4yeoGNycWekPlSaVt')"
            :hint="$t('ActionForm.AzFSRHVXHkOjHwzEBpW1S')"
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
          :label="$t('ActionForm.Swu-7z8ZpCzf1wlyF0m3F')"
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
        :label="$t('ActionForm.0I_y_C73SJXvF96894Q5d')"
        :value="model.variableName"
        :hint="$t('ActionForm.YYTI642lXA_BdgxMerFqU')"
        :error-messages="errors.variableName"
        @change="change('variableName', ...arguments)"
      />
    </v-slide-x-transition>

    <smart-toggle
      :label="$t('ActionForm.IwoGz7GsJv8SJpY4hizQ8')"
      :value="model.target"
      :options="[
        {name: $t('ActionForm.X-T-bN6vOll6c4GJ09EpL'), value: 'singleTarget'},
        {name: $t('ActionForm.cZ7n7frApR4M5NF_lVStR'), value: 'multipleTargets'},
        {name: $t('ActionForm.wvr48hnF1DbxApmRDC3R0'), value: 'self'},
      ]"
      :error-messages="errors.target"
      @change="change('target', ...arguments)"
    />

    <inline-computation-field
      :label="$t('ActionForm.uMqJz6So1tbWiONiw7coZ')"
      :hint="$t('ActionForm.ji0n_ZaizHaR9NIcbiNYK')"
      :model="model.summary"
      :error-messages="errors['summary.text']"
      @change="({path, value, ack}) =>
        $emit('change', {path: ['summary', ...path], value, ack})"
    />

    <inline-computation-field
      :label="$t('TabletopForm.nOLcz4YcyQNTwJKSAWI0K')"
      :model="model.description"
      :error-messages="errors['description.text']"
      @change="({path, value, ack}) =>
        $emit('change', {path: ['description', ...path], value, ack})"
    />

    <form-sections type="action">
      <form-section :name="$t('ActionForm.cpAHLXjqzucwbDadtCQum')">
        <resources-form
          :model="model.resources"
          @change="({path, value, ack}) => $emit('change', {path: ['resources', ...path], value, ack})"
          @push="({path, value, ack}) => $emit('push', {path: ['resources', ...path], value, ack})"
          @pull="({path, ack}) => $emit('pull', {path: ['resources', ...path], ack})"
        />
      </form-section>
      <form-section :name="$t('ActionForm.UDRHVbObbwgfNGTG86O9l')">
        <v-row dense>
          <v-col
            cols="12"
            md="6"
          >
            <computed-field
              :label="$t('ActionForm.kIN6lH7jJTD3RaF7WkyUy')"
              :hint="$t('ActionForm.7SSJSK3GiHrpECAN5kVK7')"
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
              :label="$t('ActionForm.HTFEl9P4nWPzp5aVQmtz4')"
              type="number"
              :hint="$t('ActionForm.WRR0YxFykMD9mmYmqe5no')"
              style="flex-basis: 300px;"
              :value="model.usesUsed"
              :error-messages="errors.uses"
              @change="change('usesUsed', ...arguments)"
            />
          </v-col>
        </v-row>
        <reset-selector
          :hint="$t('ActionForm.dHGbl2jpHpaOGOSg3oGeJ')"
          :value="model.reset"
          :error-messages="errors.reset"
          @change="change('reset', ...arguments)"
        />
      </form-section>
      <form-section :name="$t('ActionForm.7JkrChA5Oz7n_-wF0QxsW')">
        <smart-switch
          :label="$t('ActionForm.pTOkAuMdrx_hGI0E1xQl2')"
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
import propertyFormMixin from '/imports/client/ui/properties/forms/shared/propertyFormMixin';
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
          text: this.$t('PrintedAction.IrhNSkzJSRi84GhcibaA6'),
          value: 'action',
        }, {
          text: this.$t('ActionForm.t_rdlLehNy3iLM13m8KHi'),
          value: 'bonus',
        }, {
          text: this.$t('ActionForm.kPjD8rr_PnXqy-pMLGLXp'),
          value: 'attack',
          help: this.$t('ActionForm.p7OvsLgcWG2GjhPpfy4aZ'),
        }, {
          text: this.$t('PrintedAction.mfg8w8IEyp7lqOtrKA716'),
          value: 'reaction',
        }, {
          text: this.$t('ActionForm.L7CIoiuGHz6rNUNfQR0x1'),
          value: 'free',
          help: this.$t('ActionForm.DGVwhkixMi9ZS_UugfZrR')
        }, {
          text: this.$t('ActionForm.pW9GN3ykvnJUE5ozpy0zR'),
          value: 'long',
          help: this.$t('ActionForm.RTgX4kDybPn7w6k1h-xQU')
        }, {
          text: this.$t('ActionForm.3ylc2njgCKwqOiWNQLFrF'),
          value: 'event',
          help: this.$t('ActionForm.hV4fQBRRTxnnMDEbFthkM')
        },
      ],
      targetOptions: [
        {
          text: this.$t('ActionForm.wvr48hnF1DbxApmRDC3R0'),
          value: 'self',
        }, {
          text: this.$t('ActionCard.5IbE7yubecegAHFjeu4mr'),
          value: 'singleTarget',
        }, {
          text: this.$t('ActionForm.SPian0NX_8UamXDgapfmE'),
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
