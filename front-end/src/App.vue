<template>
  <v-app id="inspire">
    <v-toolbar color="indigo" dark fixed app>
      <v-toolbar-title>{{ $router.currentRoute.name }}</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn color="white" dark @click="logout" flat v-if="store.loggedIn">
        Log out
        <v-icon dark right>input</v-icon>
      </v-btn>

    </v-toolbar>
    <v-content>

      <router-view></router-view>

    </v-content>
  </v-app>
</template>

<script>
import { store } from './store.js'

export default {
  name: 'app',
  components: {},
  data() {
    return {
      drawer: false,
      store
    }
  },
  methods: {
    logout() {
      localStorage.removeItem('jwtToken')
      store.isLoggedIn = false;
      this.$router.push({
        name: 'Login'
      })
    }
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
