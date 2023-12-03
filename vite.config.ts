import { Plugin, ResolvedConfig, defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import fg from 'fast-glob';

import { PluginOption } from "vite";
import Mustache from 'mustache';
import { writeFile, readFile } from 'fs/promises';

function WatchPublic(): PluginOption {
  return {
    name: 'custom-hmr',
    enforce: 'post',
    async buildStart() {
      const files = await fg('public/**/*');
      for(let file of files){
          this.addWatchFile(file);
      }
    },
  }
}

const fileRegex = /\.(my-file-ext)$/

function BuildMoustacheTemplate(): Plugin {
  let config: ResolvedConfig
  let output = false
  
  return {
    name: 'transform-file',
    apply: 'build',
    configResolved(_config) {
      config = _config
    },
    buildEnd() {
      // reset for watch mode
      output = false
    },

    async writeBundle() {
      // run copy only once even if multiple bundles are generated
      if (output) return;
      output = true

      console.log("Writing module.json");
      const template = await readFile(`${config.root}/src/assets/module.json`);
      const templateVars = { 
        VERSION: process.env.VERSION ?? '1.0.0',
        URL: process.env.URL ?? 'http://example.com',
        MANIFEST: process.env.MANIFEST ?? 'manifest.json',
        DOWNLOAD: process.env.DOWNLOAD ?? 'download.json' 
      };
      const renderedContent = Mustache.render(template.toString("utf8"), templateVars);
      await writeFile(`${config.build.outDir}/module.json`, renderedContent);
    },
  }
}


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), WatchPublic(), BuildMoustacheTemplate()],
  build: {
    lib: {"entry": "src/module/main.ts", "formats": ["iife"], "name": "main", "fileName": "main"},
    watch: {
      buildDelay: 1000,
    }
  }
})
