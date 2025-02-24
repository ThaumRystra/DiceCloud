<template>
  <div class="tabletop-form">
    <v-row dense>
      <v-col
        cols="12"
        md="6"
      >
        <text-field
          :label="$t('TabletopForm.ogp8pUXHP7GwzGUlEkqSF')"
          :value="model.name"
          :error-messages="errors.name"
          :disabled="!editPermission"
          @change="(value, ack) => change('name', value, ack)"
        />
      </v-col>
      <v-col
        cols="12"
        md="6"
      >
        <smart-image-input
          :label="$t('TabletopForm.Zg7wJZ4RUc2_phGc_LCWr')"
          :hint="$t('TabletopForm.quaePio9-ta0EePai')"
          :disabled="!editPermission"
          :value="model.imageUrl"
          :error-messages="errors.imageUrl"
          @change="(value, ack) => change('imageUrl', value, ack)"
        />
      </v-col>
      <v-col
        cols="12"
      >
        <text-area
          :label="$t('TabletopForm.nOLcz4YcyQNTwJKSAWI0K')"
          :value="model.description"
          :disabled="!editPermission"
          @change="(value, ack) => change('description', value, ack)"
        />
      </v-col>
    </v-row>

    <form-sections type="tabletop">
      <form-section :name="$t('ShareDialog.03VciIdW7WUj5zao5xU0A')">
        <v-row>
          <v-col
            cols="12"
            md="6"
          >
            <smart-select
              :label="$t('ShareDialog._g3AAll7JIJ6eKSezF40L')"
              :items="[
                {text: $t('TabletopForm.enRTOfb6gmE6wfvazG7tH'), value: 'false'},
                {text: $t('TabletopForm.UqVDG2MYiKNKrGoVeRF1l'), value: 'true'}
              ]"
              :value="!!model.public + ''"
              @change="(value, ack) => change('public', value === 'true', ack)"
            />
          </v-col>
          <v-col
            v-if="model.public" 
            cols="12"
            md="6"
          >
            <text-field
              readonly
              :label="$t('ShareDialog.JXIZsDoMWYIDczc39na2p')"
              :value="link"
            />
          </v-col>

          <v-col
            cols="12"
            class="mb-4 px-4"
          >
            <h3 class="mb-4">
              {{ $t('TabletopForm.bnTLZc-_n8le4z7FUD5sv') }}
            </h3>
            <text-field
              :label="$t('SignIn.9Hgx-SDsbxdrMu3MW63bY')"
              :value="userSearched"
              :debounce-time="300"
              :disabled="!editPermission"
              @change="(value, ack) => getUser({value, ack})"
            />
            <smart-select
              :label="$t('TabletopForm.UICbZ5qt1flJK6akgqxXH')"
              :items="[
                {text: $t('TabletopForm.fcVkX6ikAyHyFBZZoPlXG'), value: 'gameMaster'},
                {text: $t('TabletopForm.G8L9YTh_9mMnHLXaSg8-k'), value: 'player'},
                {text: $t('TabletopForm._iKgwOiSJu9koKv_dHRm9'), value: 'spectator'},
              ]"
              :value="newSharePermission"
              :disabled="!editPermission"
              @change="(value, ack) => { newSharePermission = value; ack();}"
            />
            <smart-btn
              class="ml-2 mt-2"
              single-click
              :disabled="userFoundState !== 'found' || !editPermission"
              @click="ack => updateSharing(userId, newSharePermission, ack)"
            >
              {{ $t('ShareDialog.8hLNrY3cfCjnHG8Ibg4S2') }}
            </smart-btn>
          </v-col>

          <property-field
            :name="$t('TabletopForm.Ye33lCxkLiuCk7ejTS-3B')"
            :cols="{cols: 12, md: 6}"
          >
            {{ users.owner.username || users.owner._id || '' }}
          </property-field>
          <v-col
            v-if="users.gameMasters.length"
            key="gameMasters"
            cols="12"
            md="6"
            class="mb-4"
          >
            <outlined-input :name="$t('TabletopForm.Dnp5nRtDPgzhw2HlU9CDw')">
              <tabletop-user-list
                :users="users.gameMasters"
                :edit-permission="editPermission"
                :owner="model.owner"
                role="gameMaster"
                @set-role="e => $emit('update-sharing', e)"
              />
            </outlined-input>
          </v-col>

          <v-col
            v-if="users.players.length"
            key="players"
            cols="12"
            md="6"
            class="mb-4"
          >
            <outlined-input :name="$t('TabletopForm.w8-3hmBIm0WX2f98I5Nrp')">
              <tabletop-user-list
                :users="users.players"
                :edit-permission="editPermission"
                :owner="model.owner"
                role="player"
                @set-role="e => $emit('update-sharing', e)"
              />
            </outlined-input>
          </v-col>

          <v-col
            v-if="users.spectators.length"
            key="spectators"
            cols="12"
            md="6"
            class="mb-4"
          >
            <outlined-input :name="$t('TabletopForm.j92FT1AXgEpXeD3KtPcQO')">
              <tabletop-user-list
                :users="users.spectators"
                :edit-permission="editPermission"
                :owner="model.owner"
                role="spectator"
                @set-role="e => $emit('update-sharing', e)"
              />
            </outlined-input>
          </v-col>
        </v-row>
      </form-section>
    </form-sections>
  </div>
</template>

<script lang="js">
import OutlinedInput from '/imports/client/ui/properties/viewers/shared/OutlinedInput.vue';
import TabletopUserList from '/imports/client/ui/tabletop/TabletopUserList.vue';
import PropertyField from '/imports/client/ui/properties/viewers/shared/PropertyField.vue';
import FormSection, { FormSections } from '/imports/client/ui/properties/forms/shared/FormSection.vue';
import SmartImageInput from '/imports/client/ui/components/global/SmartImageInput.vue';

export default {
  name: 'TabletopViewer',
  components: {
    OutlinedInput,
    TabletopUserList,
    PropertyField,
    FormSection,
    FormSections,
    SmartImageInput,
  },
  props: {
    model: {
      type: Object,
      required: true,
    },
    errors: {
      type: Object,
      default: () => ({}),
    },
    editPermission: {
      type: Boolean,
      required: true,
    },
    users: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      newSharePermission: 'player',
      userSearched: undefined,
      userFoundState: 'idle',
      userId: undefined,
    };
  },
  computed: {
    link() {
      return window.location.origin + this.$router.resolve({
        name: 'tabletop',
        params: { id: this.model._id },
      }).href
    }
  },
  methods: {
    change(path, value, ack) {
      this.$emit('change', { path, value, ack });
    },
    updateSharing(userId, role, ack) {
      this.$emit('update-sharing', { userId, role, ack});
    },
    getUser({ value, ack }) {
      this.userSearched = value;
      if (!value) {
        this.userFoundState = 'idle';
        ack();
        return;
      }
      Meteor.users.findUserByUsernameOrEmail.call({
        usernameOrEmail: value
      }, (error, result) => {
        if (error) {
          ack(error && error.reason || error);
          this.userFoundState = 'failed';
        } else {
          this.userId = result;
          if (result) {
            if (this.users.gameMasters.includes(result)) {
              this.userFoundState = 'failed';
              ack(this.$t('TabletopForm.hagY-T8U6Kq54Bk3JKhQJ'));
            } else if (this.users.players.includes(result)) {
              this.userFoundState = 'failed';
              ack(this.$t('TabletopForm.E6_8VX8CoYPr1EYRCQoFy'));
            } else if (this.users.spectators.includes(result)) {
              this.userFoundState = 'failed';
              ack(this.$t('TabletopForm.T2eR8xKcGEaypPkX92TsU'));
            } else {
              this.userFoundState = 'found';
              ack();
            }
          } else {
            this.userFoundState = 'notFound';
            ack(this.$t('ShareDialog.VqkQCmxb_c2wDNm0F8BEF'));
          }
        }
      });
    },
  }
}
</script>

