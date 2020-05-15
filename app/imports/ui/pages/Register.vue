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
          label="Email"
          :rules="emailRules"
          required
          @keyup.enter="submit"
        />
        <v-text-field
          v-model="username"
          type="text"
          label="Username"
          :rules="usernameRules"
          required
          @keyup.enter="submit"
        />
        <v-text-field
          v-model="password"
          type="password"
          label="Password"
          :rules="passwordRules"
          required
          @keyup.enter="submit"
        />
        <v-text-field
          v-model="password2"
          type="password"
          label="Password Again"
          :rules="password2Rules"
          required
          @keyup.enter="submit"
        />
        <div class="error--text">
          {{ error }}
        </div>
        <v-layout row>
          <v-btn
            :disabled="!valid"
            color="accent"
            @click="submit"
          >
            Register
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
        Register in with Google
      </v-btn>
    </v-layout>
  </div>
</template>

<script>
  export default{
    data() {
      return {
        valid: true,
        username: '',
        usernameRules: [
          v => !!v || 'Name is required',
        ],
        email: '',
        emailRules: [
          v => !!v || 'Name is required',
          v => /.+@.+/.test(v) || 'E-mail must be valid',
        ],
        password: '',
        passwordRules: [
          v => !!v || 'Password is required',
        ],
        password2: '',
        password2Rules: [
          v => !!v || 'Password is required',
          v => v == this.password || 'Passwords don\'t match',
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
