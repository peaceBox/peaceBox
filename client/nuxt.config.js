module.exports = {
    srcDir: './src',
    head: {
        titleTemplate: '%s - PeaceBox',
    },
    modules: ['@nuxtjs/vuetify', 'nuxt-webfontloader'],
    vuetify: {
        customVariables: ['./src/assets/variables.scss'],
        treeShake: true,
    },
    webfontloader: {
        google: {
            families: ['Acme'],
        },
    },
};