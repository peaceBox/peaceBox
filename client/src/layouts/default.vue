<template>
    <v-app id="inspire">
        <v-app-bar app color="#0D90BA" dark>
            <v-btn icon href="/">
                <v-icon>mdi-home</v-icon>
            </v-btn>
            <v-spacer></v-spacer>
            <v-toolbar-title href="/">
                <span class="head_title">peaceBox</span>
            </v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn icon href="inbox">
                <v-icon>mdi-inbox</v-icon>
            </v-btn>
        </v-app-bar>

        <main class="mainContainer">
            <v-container class="px-4 py-8">
                <nuxt />
            </v-container>
        </main>
    </v-app>
</template>

<script>
export default {
    data: () => ({
        drawer: false,
    }),
};
</script>
<style>
.head_title {
    font-family: 'Acme', sans-serif;
}
</style>
