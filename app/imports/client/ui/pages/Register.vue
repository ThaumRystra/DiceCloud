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
          v-model="email"
          type="text"
          :label="$t('pages.register.email')"
          :rules="emailRules"
          class="ma-2"
          outlined
          required
          @keyup.enter="submit"
        />
        <v-text-field
          v-model="username"
          type="text"
          :label="$t('pages.register.username')"
          :rules="usernameRules"
          class="ma-2"
          outlined
          required
          @keyup.enter="submit"
        />
        <v-text-field
          v-model="password"
          type="password"
          :label="$t('pages.register.password')"
          :rules="passwordRules"
          class="ma-2"
          outlined
          required
          @keyup.enter="submit"
        />
        <v-text-field
          v-model="password2"
          type="password"
          :label="$t('pages.register.password2')"
          :rules="password2Rules"
          class="ma-2"
          outlined
          required
          @keyup.enter="submit"
        />
        <div class="error--text">
          {{ error }}
        </div>
        <v-layout>
          <v-btn
            :disabled="!valid"
            color="accent"
            @click="submit"
          >
            {{ $t('pages.register.register') }}
          </v-btn>
        </v-layout>
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
        @click="googleLogin"
      >
        {{ $t('pages.register.googleLogin') }}
      </v-btn>
    </v-layout>
  </div>
</template>

<script lang="js">
  export default {
    data() {
      return {
        valid: true,
        username: '',
        email: '',
        password: '',
        password2: '',
        error: '',
        googleError: '',
      }
    },
    computed: {
      usernameRules() {
        return [
          v => !!v || this.$t('pages.register.errors.nameIsRequired'),
        ];
      },
      emailRules() {
        return [
          v => !!v || this.$t('pages.register.errors.emailIsRequired'),
          v => /.+@.+/.test(v) || this.$t('pages.register.errors.emailIsInvalid'),
        ];
      },
      passwordRules() {
        return [
          v => !!v || this.$t('pages.register.errors.passwordIsRequired'),
        ];
      },
      password2Rules() {
        return [
          v => !!v || this.$t('pages.register.errors.passwordIsRequired'),
          v => v === this.password || this.$t('pages.register.errors.passwordsDontMatch'),
        ];
      },
    },
    methods: {
      submit () {
        if (this.$refs.form.validate()) {
          Accounts.createUser({
            username: this.username,
            password: this.password,
            email: this.email,
          }, error => {
            if (error){
              this.error = error.reason;
            } else {
              this.$router.push(this.$route.query.redirect || 'characterList');
            }
          });
        }
      },
      googleLogin() {
        Meteor.loginWithGoogle(error => {
          if (error) this.googleError = error.reason;
        });
      },
    },
  }
</script>
