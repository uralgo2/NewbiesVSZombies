import { defineConfig } from 'vite';
import replace from '@rollup/plugin-replace';
import mkcert from 'vite-plugin-mkcert'
import ViteMinifyPlugin from "vite-plugin-minify";
import viteCompression from 'vite-plugin-compression';

export default defineConfig({
  server: {https: true, port: 8080},
  plugins: [mkcert()],
  base: '',
  build: {
    rollupOptions: {
      plugins: [
        ViteMinifyPlugin({}),
        viteCompression(),
        //  Toggle the booleans here to enable / disable Phaser 3 features:
        replace({
          'typeof CANVAS_RENDERER': "'true'",
          'typeof WEBGL_RENDERER': "'true'",
          'typeof EXPERIMENTAL': "'true'",
          'typeof PLUGIN_CAMERA3D': "'false'",
          'typeof PLUGIN_FBINSTANT': "'false'",
          'typeof FEATURE_SOUND': "'true'"
        })
      ]
    }
  }
});
