<template>
    <div style="margin: 10px;">
        <v-card>
            <v-card-actions>
                <v-list-item class="grow">
                    <v-list-item-avatar color="grey darken-3">
                        <v-img
                            class="elevation-6"
                            :src="questioner.icon"
                        ></v-img>
                    </v-list-item-avatar>
                    <v-list-item-content>
                        <v-list-item-title
                            >{{ questioner.name }} ({{
                                questioner.screenName
                            }})</v-list-item-title
                        >
                    </v-list-item-content>
                </v-list-item>
            </v-card-actions>
            <v-card-text class="headline font-weight-bold">{{
                question
            }}</v-card-text>

            <v-divider></v-divider>

            <v-card-text v-if="answer != ''" class="headline">
                {{ answer }}
            </v-card-text>
            <v-card-actions v-else>
                <answer-input />
            </v-card-actions>
        </v-card>
    </div>
</template>
<script>
import answerInput from '../components/answerInput';
export default {
    props: ['question', 'answer', 'questioner'],
    components: {
        answerInput,
    },
};
</script>
