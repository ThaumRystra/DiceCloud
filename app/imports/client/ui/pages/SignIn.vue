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
          label="Username or email"
          :rules="nameRules"
          class="ma-2"
          outlined
          required
          @keyup.enter="submit"
        />
        <v-text-field
          v-model="password"
          type="password"
          label="Password"
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
          Reset Password
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
            Sign In
          </v-btn>
          <v-btn
            color="accent"
            :to="{ name: 'register', query: { redirect: $route.query.redirect} }"
            class="ma-2"
          >
            Register
          </v-btn>
        </v-layout>
        <div class="text-caption mt-4 px-4">
          <p>
            DiceCloud Version 2 requires a new account to use.
          </p><p>
            Version 1 is still available at <a href="https://v1.dicecloud.com">v1.dicecloud.com</a>
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
        Sign in with Google
      </v-btn>
      <div class="error--text">
        {{ patreonError }}
      </div>
      <v-btn
        color="accent"
        class="ma-2"
        @click="patreonLogin"
      >
        Sign in with Patreon
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
      v => !!v || 'Name is required',
    ],
    password: '',
    passwordRules: [
      v => !!v || 'Password is required',
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
