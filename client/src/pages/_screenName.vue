<template>
    <div style="margin-top: 100px;">
        <v-row v-if="loggedIn" align="center" justify="center">
            <h1>Hello</h1>
        </v-row>
        <v-card>
            <v-card-title></v-card-title>
        </v-card>
    </div>
</template>

<script>
export default {
    data: () => {
        return { loggedIn: false, isRegisterd: true };
    },
};
</script>

<style>
p {
    size: 20px;
    font-weight: 600;
}
</style>
