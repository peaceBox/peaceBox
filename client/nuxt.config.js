module.exports = {
    srcDir: './src',
    head: {
        titleTemplate: '%s - PeaceBox',
        meta: [
            { charset: 'utf-8' },
            {
                name: 'viewport',
                content: 'width=device-width, initial-scale=1',
            },
        ],
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