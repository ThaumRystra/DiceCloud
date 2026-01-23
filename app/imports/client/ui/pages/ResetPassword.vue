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

        <template v-if="token">
          <v-text-field
            v-model="password"
            type="password"
            :label="$t('pages.resetPassword.password')"
            :rules="passwordRules"
            class="ma-2"
            outlined
            required
            @keyup.enter="submit"
          />
          <v-text-field
            v-model="password2"
            type="password"
            :label="$t('pages.resetPassword.password2')"
            :rules="password2Rules"
            class="ma-2"
            outlined
            required
            @keyup.enter="submit"
          />
        </template>
        <v-text-field
          v-else
          v-model="email"
          type="text"
          :label="$t('pages.resetPassword.email')"
          :rules="emailRules"
          class="ma-2"
          outlined
          required
          @keyup.enter="submit"
        />
        <v-expand-transition>
          <v-alert
            v-if="error"
            type="error"
          >
            {{ error }}
          </v-alert>
        </v-expand-transition>
        <v-expand-transition>
          <v-alert
            v-if="info"
            type="info"
          >
            {{ info }}
          </v-alert>
        </v-expand-transition>
        <v-layout>
          <v-btn
            :disabled="!valid"
            color="accent"
            @click="submit"
          >
            {{ $t('pages.resetPassword.resetPassword') }}
          </v-btn>
        </v-layout>
      </v-layout>
    </v-form>
  </div>
</template>

<script lang="js">
  export default {
    data() {
      return {
        valid: true,
        submitLoading: false,
        email: '',
        emailRules: [
          v => !!v || this.$t('pages.resetPassword.errors.emailIsRequired'),
          v => /.+@.+/.test(v) || this.$t('pages.resetPassword.errors.emailIsInvalid'),
        ],
        password: '',
        passwordRules: [
          v => !!v || this.$t('pages.resetPassword.errors.passwordIsRequired'),
        ],
        password2: '',
        password2Rules: [
          v => !!v || this.$t('pages.resetPassword.errors.passwordIsRequired'),
          v => v == this.password || this.$t('pages.resetPassword.errors.passwordsDontMatch'),
        ],
        error: '',
        info: '',
      }
    },
    computed: {
      token(){
        return this.$route.params.token;
      },
    },
    methods: {
      submit () {
        if (this.$refs.form.validate()) {
          if (this.token){
            this.submitLoading = true;
            Accounts.resetPassword(this.token, this.password, error => {
              this.submitLoading = false;
              this.error = error && error.message;
              this.info = '';
              if (!error){
                this.$router.push('/characterList');
              }
            });
          } else {
            this.submitLoading = true;
            Accounts.forgotPassword({email: this.email}, error => {
              this.submitLoading = false;
              this.error = error && error.message;
              this.info = '';
              if (!error){
                this.info = this.$t('pages.resetPassword.passwordResetLink', {email: this.email});
                this.email = '';
                this.valid = true;
              }
            });
          }
        }
      },
    },
  }
</script>
