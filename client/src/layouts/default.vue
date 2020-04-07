<template>
  <v-app id="inspire">
    <navigator v-model="drawer" />
    <v-app-bar app color="#0D90BA" dark>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
      <v-toolbar-title>peaceBox</v-toolbar-title>
    </v-app-bar>

     <main class="mainContainer">
        <v-container class="px-4 py-8">
          <nuxt />
        </v-container>
      </main>
    <v-footer color="#0D90BA" app>
      <span class="white--text">&copy; 2019</span>
    </v-footer>
  </v-app>
</template>

<script>
import navigator from "../components/navigator"
export default {
    data: () => ({
        drawer: false,
    }),
    components:{
      navigator
    }
}
</script>
