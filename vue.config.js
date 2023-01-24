const { defineConfig } = require('@vue/cli-service');

process.env.VUE_APP_VERSION = require('./package.json').version;

module.exports = defineConfig({
  transpileDependencies: true,
  assetsDir: './assets',

  chainWebpack: config => {
    config.module.rule('vue').use('vue-svg-inline-loader').loader('vue-svg-inline-loader').options({});
  },

  css: {
    loaderOptions: {
      scss: {
        additionalData: '@import "@/assets/styles/_variables.scss";',
      },
    },
  },
});
