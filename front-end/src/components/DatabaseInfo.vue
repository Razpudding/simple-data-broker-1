<template>
  <div class="database-info">
    <span>Database usage: </span>
    <span
      :class="`status ${statusClass}`"
      v-if="current && max"
    >{{ current }} / {{ max }}</span>
    <span v-else>Loading...</span>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  data() {
    return {
      current: null,
      max: null,
      status: 0
    }
  },
  created() {
    axios.get('/api/stats')
      .then(({ data }) => {
        this.current = data.current;
        this.max = data.max;
        // this.status = data.status;
      })
  },
  computed: {
    statusClass() {
      if (this.status === 0) {
        return 'good'
      } else if (this.status === 1) {
        return 'critical'
      } else if (this.status === 2) {
        return 'danger'
      }
    }
  }
}
</script>

<style scoped>
  .database-info {
    margin-left: auto;
  }

  .status:after {
    content: '';
    display: inline-block;
    height: 1rem;
    width: 1rem;
    background-color: grey;
    margin-left: 0.5rem;
    margin-right: 0.5rem;
    border-radius: 50%;
    margin-bottom: -0.1rem;
  }

  .status.good:after {
    background-color: #00C853;
  }
  
  .status.critical:after {
    background-color: #FF9100;
  }
  
  .status.danger:after {
    background-color: #DD2C00;
  }
</style>
