<template>
  <v-card width="100%" class="month-card">
    <v-toolbar flat>
      <v-toolbar-title>{{ month.name }}</v-toolbar-title>
      <v-spacer></v-spacer>

      <v-btn icon @click.native.stop="monthDialog = true">
        <v-icon>delete</v-icon>
      </v-btn>
      
      <v-dialog v-model="monthDialog" max-width="350">
        <v-card>
          <v-card-title class="headline">Are you sure?</v-card-title>
          <v-card-text>The data will be gone forever! Make sure you first download the data.</v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="grey" 
              flat="flat" 
              @click.native="weekDialog = false"
              v-if="!awaitingResponse"
            >Cancel</v-btn>
            <v-btn
              color="red" 
              flat="flat" 
              @click="removeData(month.startDate, month.endDate)"
              :disabled="awaitingResponse"
              :loading="awaitingResponse"
            >Delete</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-btn :href="`/api/dump?startdate=${month.startDate}&enddate=${month.endDate}`" icon>
        <v-icon>cloud_download</v-icon>
      </v-btn>
    </v-toolbar>
    <v-divider></v-divider>
    <v-list dense class="pt-0">
      <WeekRow 
        v-for="week in month.weeks" 
        :key="week.name" 
        :week="week"
        @removeData="({ weekNumber }) => {
          $emit('removeData', { monthName: month.name, weekNumber })
        }"
      />
    </v-list>
  </v-card>
</template>

<script>
  import axios from 'axios';
  import WeekRow from './WeekRow.vue';

  export default {
    components: {
      WeekRow
    },
    props: ["month"],
    data () {
      return {
        right: null,
        monthDialog: false,
        awaitingResponse: false
      }
    },
    methods: {
      removeData(startDate, endDate) {
        this.awaitingResponse = true

        axios.get(`/api/delete?startdate=${startDate}&enddate=${endDate}`)
          .then(res => {
            this.monthDialog = false
            this.weekDialog = false
            this.awaitingResponse = false

            this.$emit('removeData', { monthName: this.month.name })
          })
          .catch(error => {
            console.log(error)
          })
      }
    }
  }
</script>

<style>
  .month-card .list__tile {
    padding-right: 0;
  }

  .month-card .btn--icon {
    margin-left: 0;
  }

  .month-card .btn--icon:not(:last-child) {
    margin-right: 0;
  }
</style>
