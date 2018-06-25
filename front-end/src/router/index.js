import Vue from 'vue'
import Router from 'vue-router'
import axios from 'axios'

import { store } from '../store.js'

import Home from '../components/Home.vue'
import About from '../components/About.vue'
import Login from '../components/Login.vue'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: Login
    },
    {
      path: '/',
      name: 'Home',
      component: Home
    }
  ]
})

// Add a request interceptor
axios.interceptors.request.use(function (config) {
  config.headers.common['Authorization'] = localStorage.getItem('jwtToken')

  return config;
}, function (error) {
  return Promise.reject(error);
});

axios.interceptors.response.use(function (response) {
  store.loggedIn = true

  // Do something with response data
  return response;
}, function (error) {
  if (error.response.status === 401) {
    store.loggedIn = true

    window.location.href = '/#/login'
  }

  // Do something with response error
  return Promise.reject(error);
});