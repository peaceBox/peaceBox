<template>
    <canvas width="1462" height="900"> </canvas>
</template>
<script>
export default {
    props: ['text'],
    data() {
        return {
            ctx: null,
        };
    },
    methods: {
        draw(text) {
            const img = new Image();
            img.src = 'https://peacebox.sugokunaritai.dev/templateImg.png';

            img.onload = () => {
                this.ctx.drawImage(img, 0, 0);

                this.ctx.textAlign = 'center';
                this.ctx.font = '40px sans-serif';
                this.ctx.fillText(text, 731, 450);
            };
        },
        save() {
            return new Promise((resolve) => {
                const str = this.$el.toDataURL('image/jpeg', 1.0);
                const pos = str.indexOf(',');

                resolve(str.slice(pos + 1));
            });
        },
    },
    watch: {
        text: function (val) {
            this.draw(val);
        },
    },
    mounted() {
        this.ctx = this.$el.getContext('2d');
        this.draw(this.text);
    },
};
</script>
<style>
canvas {
    width: 731px;
    height: 450px;
    border: #333333 solid 2px;
}
</style>
