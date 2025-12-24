<template>
  <div>
    <v-form
      ref="form"
      class="mt-4"
    >
      <v-layout
        column
        align-center
      >
        <v-img
          src="crown-dice-logo-cropped-transparent.png"
          width="120px"
          class="ma-3"
        />
        <v-text-field
          v-model="name"
          type="text"
          :label="$t('pages.signIn.usernameOrEmail')"
          :rules="nameRules"
          class="ma-2"
          outlined
          required
          @keyup.enter="submit"
        />
        <v-text-field
          v-model="password"
          type="password"
          :label="$t('pages.signIn.password')"
          :rules="passwordRules"
          class="ma-2"
          outlined
          required
          @keyup.enter="submit"
        />
        <v-btn
          text
          to="/reset-password"
        >
          {{ $t('pages.signIn.resetPassword') }}
        </v-btn>
        <div
          v-if="error"
          class="error--text"
        >
          {{ error }}
        </div>
        <v-layout>
          <v-btn
            :disabled="!valid"
            color="accent"
            class="ma-2"
            @click="submit"
          >
            {{ $t('pages.signIn.signIn') }}
          </v-btn>
          <v-btn
            color="accent"
            :to="{ name: 'register', query: { redirect: $route.query.redirect} }"
            class="ma-2"
          >
            {{ $t('pages.signIn.register') }}
          </v-btn>
        </v-layout>
        <div class="text-caption mt-4 px-4">
          <p>
            {{ $t('pages.signIn.diceV2') }}
          </p><p>
            {{ $t('pages.signIn.diceV1') }} <a href="https://v1.dicecloud.com">v1.dicecloud.com</a>
          </p>
        </div>
      </v-layout>
    </v-form>
    <v-divider class="ma-4" />
    <v-layout
      column
      align-center
    >
      <div class="error--text">
        {{ googleError }}
      </div>
      <v-btn
        color="accent"
        class="ma-2"
        @click="googleLogin"
      >
        {{ $t('pages.signIn.googleLogin') }}
      </v-btn>
      <div class="error--text">
        {{ patreonError }}
      </div>
      <v-btn
        color="accent"
        class="ma-2"
        @click="patreonLogin"
      >
        {{ $t('pages.signIn.signInPatreon') }}
      </v-btn>
    </v-layout>
  </div>
</template>

<script lang="js">
export default {
  data: () => ({
    valid: true,
    name: '',
    nameRules: [
      v => !!v || this.$t('pages.signIn.errors.nameIsRequired'),
    ],
    password: '',
    passwordRules: [
      v => !!v || this.$t('pages.signIn.errors.passwordIsRequired'),
    ],
    error: '',
    googleError: '',
    patreonError: '',
  }),
  methods: {
    submit() {
      if (this.$refs.form.validate()) {
        Meteor.loginWithPassword(this.name, this.password, error => {
          if (error) {
            this.error = error.reason;
          } else {
            this.$router.push(this.$route.query.redirect || 'characterList');
          }
        });
      }
    },
    googleLogin() {
      Meteor.loginWithGoogle(error => {
        if (error) {
          console.error(error);
          this.googleError = error.message;
        } else {
          this.$router.push(this.$route.query.redirect || 'characterList');
        }
      });
    },
    patreonLogin() {
      Meteor.loginWithPatreon(error => {
        if (error) {
          console.error(error);
          this.patreonError = error.message;
        } else {
          this.$router.push(this.$route.query.redirect || 'characterList');
        }
      });
    }
  },
}
</script>
