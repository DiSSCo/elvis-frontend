process.env.VUE_APP_VERSION = require('./package.json').version;

module.exports = {
  transpileDependencies: ['buefy'],
  assetsDir: './assets',

  chainWebpack: config => {
    config.module.rule('vue').use('vue-svg-inline-loader').loader('vue-svg-inline-loader').options({});
  },

  configureWebpack: () => ({
    resolve: {
      alias: {
        vue$: 'vue/dist/vue.esm.js'
      }
    }
  }),
  css: {
    loaderOptions: {
      scss: {
        prependData: '@import "@/assets/styles/_variables.scss";'
      }
    }
  },
  devServer: {
    host: '0.0.0.0',
    public: '0.0.0.0:8081',
    disableHostCheck: true
  }
};
