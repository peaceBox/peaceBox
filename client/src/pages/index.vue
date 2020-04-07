<template>
<defaultLayout>
        <v-row align="center" justify="center">
          <v-col align="center" fluid>
         <h1>Hello</h1>
         </v-col>
           <v-col align="center" fluid>
         <h1>Hola</h1>
         </v-col>
        </v-row>
         <v-row align="center" justify="center">
         <h1>Hello</h1>
        </v-row>
        
</defaultLayout>
</template>

<script>

import defaultLayout from "../layouts/default"
export default {
    props: {
        source: String,
    },
    components:{
      defaultLayout
    },
    data: () => ({
        drawer: null,
    }),
}
</script>
