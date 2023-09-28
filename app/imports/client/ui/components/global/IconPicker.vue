<template lang="html">
  <v-menu
    v-model="menu"
    :close-on-content-click="false"
    transition="slide-y-transition"
    min-width="290px"
    style="overflow-y: auto;"
    left
  >
    <template #activator="{ on }">
      <v-btn
        :loading="loading"
        :outlined="!!label"
        :icon="!label"
        :tile="!label"
        :min-width="label && 108"
        :height="height"
        :width="width"
        :style="buttonStyle"
        :disabled="context.editPermission === false"
        v-bind="$attrs"
        v-on="on"
      >
        {{ label }}
        <svg-icon
          v-if="safeValue && safeValue.shape"
          right
          :class="{'ml-2': !!label}"
          :shape="safeValue.shape"
        />
        <v-icon
          v-else
          :right="!!label"
        >
          mdi-select-search
        </v-icon>
      </v-btn>
    </template>
    <v-card>
      <v-card-text>
        <div class="layout row align-center">
          <text-field
            ref="iconSearchField"
            label="Search icons"
            append-icon="mdi-magnify"
            clearable
            hide-details
            class="ma-2"
            :value="searchString"
            @change="search"
          />
          <v-btn
            text
            @click="select()"
          >
            clear
          </v-btn>
        </div>
        <v-layout
          wrap
          style="max-height: 400px; overflow-y: auto;"
        >
          <v-scale-transition
            group
            hide-on-leave
          >
            <v-btn
              v-for="icon in icons"
              :key="icon._id"
              icon
              large
              @click="select(icon)"
            >
              <svg-icon
                :shape="icon.shape"
                x-large
              />
            </v-btn>
          </v-scale-transition>
        </v-layout>
      </v-card-text>
    </v-card>
  </v-menu>
</template>

<script lang="js">
import SvgIcon from '/imports/client/ui/components/global/SvgIcon.vue';
import SmartInput from '/imports/client/ui/components/global/SmartInputMixin';
import { findIcons } from '/imports/api/icons/Icons';

export default {
  components: {
    SvgIcon,
  },
  mixins: [SmartInput],
  inject: {
    context: { default: {} }
  },
  props: {
    label: {
      type: String,
      default: undefined,
    },
    buttonStyle: {
      type: String,
      default: undefined,
    },
    height: {
        type: Number,
        default: undefined,
    },
    width: {
      type: Number,
      default: undefined,
    },
  },
  data() {
    return {
      menu: false,
      searchString: '',
      icons: [],
    };
  },
  watch: {
    menu(value) {
      if (value) {
        setTimeout(() => {
          if (this.$refs.iconSearchField) {
            this.$refs.iconSearchField.$children[0].focus();
          }
        }, 100);
      }
    },
  },
  methods: {
    search(value, ack) {
      this.searchString = value;
      this.icons = [];
      findIcons.call({ search: value }, (error, result) => {
        ack(error);
        this.icons = result;
      });
    },
    select(icon) {
      this.menu = false;
      this.change(icon);
    },
  },
}
</script>

<style lang="css" scoped>

</style>
