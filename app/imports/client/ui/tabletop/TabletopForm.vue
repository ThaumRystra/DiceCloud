<template>
  <div class="tabletop-form">
    <v-row dense>
      <v-col
        cols="12"
        md="6"
      >
        <text-field
          :label="$t('pages.tabletop.name')"
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
          :label="$t('pages.tabletop.pictureUrl')"
          :hint="$t('pages.tabletop.pictureUrlHint')"
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
          :label="$t('pages.tabletop.description')"
          :value="model.description"
          :disabled="!editPermission"
          @change="(value, ack) => change('description', value, ack)"
        />
      </v-col>
    </v-row>

    <form-sections type="tabletop">
      <form-section :name="$t('pages.tabletop.sharing')">
        <v-row>
          <v-col
            cols="12"
            md="6"
          >
            <smart-select
              :label="$t('pages.tabletop.whoCanView')"
              :items="[
                {text: $t('pages.tabletop.onlyPeopleIShareWith'), value: 'false'},
                {text: $t('pages.tabletop.anyoneWithLink'), value: 'true'}
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
              :label="$t('pages.tabletop.link')"
              :value="link"
            />
          </v-col>

          <v-col
            cols="12"
            class="mb-4 px-4"
          >
            <h3 class="mb-4">
              {{ $t('pages.tabletop.addUser') }}
            </h3>
            <text-field
              :label="$t('pages.tabletop.usernameOrEmail')"
              :value="userSearched"
              :debounce-time="300"
              :disabled="!editPermission"
              @change="(value, ack) => getUser({value, ack})"
            />
            <smart-select
              :label="$t('pages.tabletop.permission')"
              :items="[
                {text: $t('pages.tabletop.gameMaster'), value: 'gameMaster'},
                {text: $t('pages.tabletop.player'), value: 'player'},
                {text: $t('pages.tabletop.spectator'), value: 'spectator'},
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
              {{ $t('pages.tabletop.share') }}
            </smart-btn>
          </v-col>

          <property-field
            :name="$t('pages.tabletop.owner')"
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
            <outlined-input :name="$t('pages.tabletop.gameMasters')">
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
            <outlined-input :name="$t('pages.tabletop.players')">
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
            <outlined-input :name="$t('pages.tabletop.spectators')">
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
              ack(this.$t('pages.tabletop.userAlreadyGameMaster'));
            } else if (this.users.players.includes(result)) {
              this.userFoundState = 'failed';
              ack(this.$t('pages.tabletop.userAlreadyPlayer'));
            } else if (this.users.spectators.includes(result)) {
              this.userFoundState = 'failed';
              ack(this.$t('pages.tabletop.userAlreadySpectator'));
            } else {
              this.userFoundState = 'found';
              ack();
            }
          } else {
            this.userFoundState = 'notFound';
            ack(this.$t('pages.tabletop.userNotFound'));
          }
        }
      });
    },
  }
}
</script>

