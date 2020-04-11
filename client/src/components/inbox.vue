<template>
    <div>
        <questionCard
            v-for="(item, index) in questions"
            :key="index"
            :question="item.question"
            :answer="item.answer"
            :questioner="item.questioner"
        />
    </div>
</template>
<script>
import questionCard from '../components/questionCard';
export default {
    components: {
        questionCard,
    },
    data() {
        const questionDummyText =
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do\
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim\
            ad minim veniam, quis nostrud';
        const answerDummyText =
            'あのイーハトーヴォのすきとおった風、夏でも底に冷たさをもつ青いそら、うつくしい森で飾られたモリーオ市、郊外のぎらぎらひかる草の波。\
            またそのなかでいっしょになったたくさんのひとたち、ファゼーロとロザーロ、羊飼のミーロや、顔の赤いこどもたち、地主のテーモ、山猫博士\
            のボーガント・デストゥパーゴなど、いまこの暗い';
        const questionerDummyObj = {
            screenName: 'ItyuJ',
            icon:
                'https://avataaars.io/?avatarStyle=Transparent&topType=ShortHairShortCurly&accessoriesType=Prescription02&hairColor=Black&facialHairType=Blank&clotheType=Hoodie&clotheColor=White&eyeType=Default&eyebrowType=DefaultNatural&mouthType=Default&skinColor=Light',
            name: 'Yusei Ito',
        };

        return {
            questions: [
                {
                    question: questionDummyText,
                    answer: answerDummyText,
                    questioner: questionerDummyObj,
                },
                {
                    question: questionDummyText,
                    answer: '',
                    questioner: questionerDummyObj,
                },
            ],
        };
    },
};
</script>
