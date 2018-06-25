<template>
  <v-container fluid>
    <v-layout row wrap>
      <v-flex xs12 class="text-xs-center" mt-5>
        <h1>Sign In</h1>
      </v-flex>
      <v-flex xs12 sm2 offset-sm5 mt-3>
        <form @submit.prevent="onSubmit">
          <v-layout column>
            <v-flex>
              <v-alert v-for="(error, index) in errors" :key="index" type="error" dismissible>
                {{ error }}
              </v-alert>
            </v-flex>
            <v-flex>
              <v-text-field
                name="username"
                label="Username"
                id="username"
                v-model.trim="login.username"
                required></v-text-field>
            </v-flex>
            <v-flex>
              <v-text-field
                name="password"
                label="Password"
                id="password"
                type="password"
                v-model.trim="login.password"
                required></v-text-field>
            </v-flex>
            <v-flex class="text-xs-center" mt-5>
              <v-btn color="primary" type="submit">Sign In</v-btn>
            </v-flex>
          </v-layout>
        </form>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import axios from 'axios'

import { store } from '../store.js'

export default {
  name: 'Login',
  data () {
    return {
      login: {},
      errors: []
    }
  },
  methods: {
    onSubmit (e) {
      e.preventDefault()

      var params = new URLSearchParams();

      params.append('username', this.login.username);
      params.append('password', this.login.password);

      axios.post('/api/auth/login/', params)
        .then(response => {
          localStorage.setItem('jwtToken', response.data.token)
          store.loggedIn = true;
          this.$router.push({
            name: 'Home'
          })
        })
        .catch(e => {
          this.errors.push(e)
        })
    },
    register () {
      this.$router.push({
        name: 'Register'
      })
    }
  }
}
</script>
