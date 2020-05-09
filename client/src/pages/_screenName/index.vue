<template>
    <div style="margin-top: 100px;">
        <v-container>
            <v-card class="header-card">
                <h1>{{ targetUser.name }} のpeaceBox</h1>
            </v-card>

            <question-input />
        </v-container>
    </div>
</template>

<script>
import questionInput from '~/components/questionInput'

const targetDummyObj = {
    screenName: 'shinbunbun_',
    icon:
        'https://avataaars.io/?avatarStyle=Transparent&topType=ShortHairShortCurly&accessoriesType=Prescription02&hairColor=Black&facialHairType=Blank&clotheType=Hoodie&clotheColor=White&eyeType=Default&eyebrowType=DefaultNatural&mouthType=Default&skinColor=Light',
    name: 'しんぶんぶん',
}

export default {
    components: {
        questionInput,
    },
    data: () => {
        return { loggedIn: true, targetUser: targetDummyObj }
    },
}
</script>

<style>
p {
    size: 20px;
    font-weight: 600;
}

.header-card {
    margin-bottom: 20px;
    padding: 20px;
}

.header-card h1 {
    color: #555555;
}
</style>
