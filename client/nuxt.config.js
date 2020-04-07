module.exports = {
    srcDir: './src',
    head: {
        titleTemplate: '%s - PeaceBox',
    },
    modules: ['@nuxtjs/vuetify'],
    vuetify: {
        customVariables: ['./src/assets/variables.scss'],
        treeShake: true,
    }
}