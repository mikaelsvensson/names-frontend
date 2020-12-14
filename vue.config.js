module.exports = {
    devServer: {
        https: true
    },
    chainWebpack: config => {
        config
            .plugin('html')
            .tap(args => {
                args[0].title = 'Namn'
                args[0].facebookAppId = process.env.VUE_APP_FACEBOOK_APP_ID
                return args
            })
    }
}
