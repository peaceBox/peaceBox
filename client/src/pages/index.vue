<template>
    <div style="margin-top: 100px;">
        <div v-if="loggedIn">
            <inbox />
        </div>
        <div v-else>
            <v-row align="center" justify="center">
                <p>peaceBoxでの質問や回答はTwitterでログインしてのみご利用いただけます</p>
            </v-row>
            <v-row align="center" justify="center" style="margin-top: 30px;">
                <v-btn
                    large
                    color="#4CBADD"
                    style="color: #ffffff;"
                    href="https://api.peacebox.sugokunaritai.dev/authorize"
                >Twitterでログイン</v-btn>
            </v-row>
        </div>
    </div>
</template>

<script>
import inbox from '../components/inbox'
import Cookies from 'js-cookie'

export default {
    data: () => {
        return { loggedIn: false }
    },
    mounted() {
        if (
            Cookies.get('userId') != undefined &&
            Cookies.get('screenName') != undefined
        ) {
            this.loggedIn = true
        } else {
            // Error handler here

            console.log(`False Handler: ${Cookies.get('userId') }  :  ${ Cookies.get('screenName')}`)
        }
    },
    methods: {},
    components: {
        inbox,
    },
}
</script>

<style>
p {
    size: 20px;
    font-weight: 600;
}
</style>
