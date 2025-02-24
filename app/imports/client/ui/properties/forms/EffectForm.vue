<template lang="html">
  <div class="effect-form">
    <v-row dense>
      <v-col
        cols="12"
        md="6"
      >
        <smart-select
          :label="$t('AdjustmentForm.a3GneFZJ3MOMwzxGWJgMq')"
          append-icon="mdi-menu-down"
          :hint="operationHint"
          :error-messages="errors.operation"
          :menu-props="{transition: 'slide-y-transition', lazy: true}"
          :items="operations"
          :value="model.operation"
          @change="change('operation', ...arguments)"
        >
          <v-icon
            slot="prepend-inner"
            class="icon ml-0"
            :class="iconClass"
          >
            {{ displayedIcon }}
          </v-icon>
          <template
            slot="item"
            slot-scope="item"
          >
            <v-icon class="icon mr-2">
              {{ getEffectIcon(item.item.value, 1) }}
            </v-icon>
            {{ item.item.text }}
          </template>
        </smart-select>
      </v-col>
      <v-col
        cols="12"
        md="6"
      >
        <text-field
          v-if="model.operation === 'conditional'"
          :label="$t('TreeSearchInput.n00nuv-ruVz9Ug_Vv51wY')"
          :hint="$t('EffectForm.SHtnMBKpVFp2Ihfkrztt2')"
          :value="model.text"
          :error-messages="errors.text"
          @change="change('text', ...arguments)"
        />
        <computed-field
          v-else
          :label="$t('ConstantForm.aEv2NC1UXKBC9Z63kT9Jb')"
          :hint="$t('EffectForm.gboBBKj7YU4dALGd2TiDh')"
          :disabled="!needsValue"
          :model="model.amount"
          :error-messages="errors.amount"
          @change="({path, value, ack}) =>
            $emit('change', {path: ['amount', ...path], value, ack})"
        />
      </v-col>
    </v-row>

    <smart-toggle
      :label="$t('EffectForm.qP3ZqRZPSY87NPXcxXgsk')"
      :value="radioGroup"
      :options="[
        {name: 'Target by variable name', value: 'stats'},
        {name: 'Target by tags', value: 'tags'},
      ]"
      @change="changeTargetByTags"
    />

    <v-slide-y-transition hide-on-leave>
      <smart-combobox
        v-if="!model.targetByTags"
        :label="$t('CharacterSheetDialog.NnBUF4ZwE2sxY2H9laU5t')"
        class="mr-2"
        multiple
        small-chips
        deletable-chips
        :hint="$t('EffectForm.YDbS6tLL9tGQssAHzz--u')"
        persistent-hint
        :value="model.stats"
        :items="attributeList"
        :error-messages="errors.stats"
        @change="change('stats', ...arguments)"
      />
      <tag-targeting
        v-if="model.targetByTags"
        :model="model"
        :errors="errors"
        @change="e => $emit('change', e)"
        @push="e => $emit('push', e)"
        @pull="e => $emit('pull', e)"
      />
    </v-slide-y-transition>
    <v-expand-transition>
      <v-col
        v-if="model.targetByTags"
        cols="12"
      >
        <text-field
          :label="$t('EffectForm.-IBot5cFFVU_fExJi4xIA')"
          :value="model.targetField"
          :hint="$t('EffectForm.C7bO5_RlI0jtDfzqVqgnE')"
          :placeholder="$t('EffectForm.snD8tCJau7JV3nHgF0GuU')"
          persistent-placeholder
          :error-messages="errors.targetField"
          @change="change('targetField', ...arguments)"
        />
      </v-col>
    </v-expand-transition>
    <form-sections
      v-if="$slots.default"
      type="effect"
    >
      <slot />
    </form-sections>
  </div>
</template>

<script lang="js">
import getEffectIcon from '/imports/client/ui/utility/getEffectIcon';
import propertyFormMixin from '/imports/client/ui/properties/forms/shared/propertyFormMixin';
import attributeListMixin from '/imports/client/ui/properties/forms/shared/lists/attributeListMixin';
import TagTargeting from '/imports/client/ui/properties/forms/shared/TagTargeting.vue';

const ICON_SPIN_DURATION = 300;
export default {
  components: {
    TagTargeting,
  },
  mixins: [propertyFormMixin, attributeListMixin],
  data() {
    return {
      displayedIcon: 'add',
      iconClass: '',
      oldOperation: undefined,
      operations: [
        { value: 'base', text: this.$t('AttributeForm.sg1vCF4ceatDzU2Y3bUbw') },
        { value: 'add', text: this.$t('AttributeEffect.9iZBUqNtV818puHQ9S5mA') },
        { value: 'mul', text: this.$t('AttributeEffect.Y45EOUc4qxDGlx5Xzle92') },
        { value: 'min', text: this.$t('AttributeEffect.PWglsxP8zZNtoVCZtbg-l') },
        { value: 'max', text: this.$t('AttributeEffect.dEk96gl0uh7EJIwSh--a6') },
        { value: 'set', text: this.$t('EffectForm.WEtHJEmy9l5UiGuanUysJ') },
        { value: 'advantage', text: this.$t('AdvantageInput.GOVw9p7PQMyvg1W3QMv1h') },
        { value: 'disadvantage', text: this.$t('AdvantageInput.sN61sdTDUmZNRJhgdk3FT') },
        { value: 'passiveAdd', text: this.$t('EffectForm.ZuLYLB4j2cuBWCdUzyy6a') },
        { value: 'fail', text: this.$t('EffectForm.iT7omfOfVjW5aAj9kCC7D') },
        { value: 'conditional', text: this.$t('EffectForm.YMSdBEq2wJCbQq7Aor9uZ') },
      ],
    }
  },
  computed: {
    radioGroup() {
      return this.model.targetByTags ? 'tags' : 'stats';
    },
    needsValue() {
      switch (this.model.operation) {
        case 'base': return true;
        case 'add': return true;
        case 'mul': return true;
        case 'min': return true;
        case 'max': return true;
        case 'set': return true;
        case 'advantage': return false;
        case 'disadvantage': return false;
        case 'passiveAdd': return true;
        case 'fail': return false;
        case 'conditional': return false;
        default: return true;
      }
    },
    operationHint() {
      switch (this.model.operation) {
        case 'base': return this.$t('EffectForm.iwKzgNYrj70WgRM1Xoc5_');
        case 'add': return this.$t('EffectForm.-Joha5EoEp6cwj-ASgV6M');
        case 'mul': return this.$t('EffectForm.NWwR2iYKigbP-fB4v7vLO');
        case 'min': return this.$t('EffectForm.FdsMEJRSYVdWsUasjpYJT');
        case 'max': return this.$t('EffectForm.YiU5qaeVVCZsEO5UlwF09');
        case 'set': return this.$t('EffectForm.xMY-6t6rOKYhJ9zLKbxjw');
        case 'advantage': return this.$t('EffectForm.4OEUhBe2V-9J_ugMReImf');
        case 'disadvantage': return this.$t('EffectForm.gpZPc3mE5Auwup0o2E7as');
        case 'passiveAdd': return this.$t('EffectForm.xp_04nGt0LMA-JD9SJipV');
        case 'fail': return this.$t('EffectForm.JMxHUgMOu5XlMqqlHiLNn');
        case 'conditional': return this.$t('EffectForm.ALsVM2wCgI2BZU9bY8v9N');
        default: return '';
      }
    },
  },
  watch: {
    'model.operation': {
      immediate: true,
      handler(newValue, oldValue) {
        let newIcon = getEffectIcon(newValue, 1);
        if (!oldValue) {
          // Skip animation
          this.displayedIcon = newIcon;
        } else {
          this.iconClass = 'leaving';
          setTimeout(() => {
            this.displayedIcon = newIcon;
            this.iconClass = 'arriving';
            requestAnimationFrame(() => {
              this.iconClass = '';
            });
          }, ICON_SPIN_DURATION / 2);
        }
      },
    },
  },
  methods: {
    getEffectIcon,
    changeTargetByTags(value, ack) {
      if (value === 'stats') {
        this.$emit('change', { path: ['targetByTags'], value: undefined, ack });
      } else if (value === 'tags') {
        this.$emit('change', { path: ['targetByTags'], value: true, ack });
      }
    },
  }
};
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

.effect-form>div {
  flex-basis: 220px;
}
</style>
