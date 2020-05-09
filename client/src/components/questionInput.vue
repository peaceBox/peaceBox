<template>
    <div style="width: 100%;">
        <v-card>
            <v-card-actions>
                <v-list-item class="grow">
                    <v-list-item-avatar color="grey darken-3">
                        <v-img class="elevation-6" :src="questioner.icon"></v-img>
                    </v-list-item-avatar>
                    <v-list-item-content>
                        <v-list-item-title>
                            {{ questioner.name }} ({{
                            questioner.screenName
                            }})
                        </v-list-item-title>
                    </v-list-item-content>
                </v-list-item>
            </v-card-actions>

            <v-card-text>
                <v-textarea success :placeholder="`${questioner.name}さんに質問しましょう!`" />
                <v-btn style="width: 100%;" color="success">送信</v-btn>
            </v-card-text>
        </v-card>
    </div>
</template>
<script>

import Cookies from 'js-cookie'

export default {
    data() {
        return {
            questioner: null,
            loggedIn:false
        }
    },
    mounted(){
        if (
            Cookies.get('userId') != undefined &&
            Cookies.get('screenName') != undefined
        ) {
            this.loggedIn = true

            this.questioner={
                screenName:Cookies.get('screenName'),
                icon:Cookies.get('profileImageUrl'),
                name:Cookies.get('screenName')
            }
        } else {
            
            
        }
    }
}
</script>
