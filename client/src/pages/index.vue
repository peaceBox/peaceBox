<template>
    <div style="margin-top: 100px;">
        <v-row v-if="loggedIn" align="center" justify="center">
            <h1>Hello</h1>
        </v-row>

        <div v-else>
            <v-row align="center" justify="center">
                <p>
                    peaceBoxでの質問や回答はTwitterでログインしてのみご利用いただけます。
                </p>
            </v-row>
            <v-row align="center" justify="center" style="margin-top: 30px;">
                <v-btn
                    large
                    color="#4CBADD"
                    style="color: #ffffff;"
                    href="https://api.peacebox.shinbunbun.info/authorize?type=logIn"
                    >Twitterでログイン</v-btn
                >
            </v-row>
        </div>
    </div>
</template>

<script>
export default {
    data: () => {
        return { loggedIn: false };
    },
    mounted() {
        const param = this.$route.query;
        if (
            param.userId != undefined &&
            param.screenName !=
                undefined /*&&
            param.accessToken != undefined*/ //TODO:Implement accessToken
        ) {
            this.loggedIn = true;
        } else {
            //Error handler here
        }
    },
    methods: {},
};
</script>

<style>
p {
    size: 20px;
    font-weight: 600;
}
</style>
