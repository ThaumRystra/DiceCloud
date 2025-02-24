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
          :label="$t('Account.1CjTMGr4G6PAUTuIV-0u1')"
          :rules="emailRules"
          class="ma-2"
          outlined
          required
          @keyup.enter="submit"
        />
        <v-text-field
          v-model="username"
          type="text"
          :label="$t('Account.xdRICWNnL1zKFqlLV1YVe')"
          :rules="usernameRules"
          class="ma-2"
          outlined
          required
          @keyup.enter="submit"
        />
        <v-text-field
          v-model="password"
          type="password"
          :label="$t('Register.i7xi3kzHqYrsjmgPGbpqz')"
          :rules="passwordRules"
          class="ma-2"
          outlined
          required
          @keyup.enter="submit"
        />
        <v-text-field
          v-model="password2"
          type="password"
          :label="$t('Register.mG7vo0cKtZOsVnLF4MJFc')"
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
            {{ $t('Home.Y7uTRbv5hbEkIplOp6-XF') }}
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
        {{ $t('Register.avHsf7o8zL3P_N7ma_IdP') }}
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
        usernameRules: [
          v => !!v || this.$t('Register.yfTv252rVq9SqVdTJ3Yks'),
        ],
        email: '',
        emailRules: [
          v => !!v || this.$t('Register.W_CdFLZLh_HrlUiFd9T6G'),
          v => /.+@.+/.test(v) || this.$t('Register.9zW2GcUch66RUVP8KvNdN'),
        ],
        password: '',
        passwordRules: [
          v => !!v || this.$t('Register.pjj23oD2_4P9_mRgSGFFy'),
        ],
        password2: '',
        password2Rules: [
          v => !!v || this.$t('Register.eT-l-HBPTmti3zIhNNzhX'),
          v => v == this.password || this.$t('Register.1S2ehjyrUG5gkDTpEGCBw'),
        ],
        error: '',
        googleError: '',
      }
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
