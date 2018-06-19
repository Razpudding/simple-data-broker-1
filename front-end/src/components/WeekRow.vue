<template>
  <v-list-tile>
    <v-list-tile-content>
      <v-list-tile-title>Week {{ week.name }}</v-list-tile-title>
    </v-list-tile-content>

    <v-btn icon @click.native.stop="weekDialog = true">
      <v-icon>delete</v-icon>
    </v-btn>

    <v-dialog v-model="weekDialog" max-width="350">
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
            @click="removeData(week.startDate, week.endDate)"
            :disabled="awaitingResponse"
            :loading="awaitingResponse"
          >Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-btn :href="`/api/dump?startdate=${week.startDate}&enddate=${week.endDate}`" icon>
      <v-icon>cloud_download</v-icon>
    </v-btn>
  </v-list-tile>
</template>

<script>
import axios from 'axios';

export default {
  props: ["week"],
  data() {
    return {
      weekDialog: false,
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

          this.$emit('removeData', { weekNumber: this.week.name })
        })
        .catch(error => {
          console.log(error)
        })
    }
  }
}
</script>
