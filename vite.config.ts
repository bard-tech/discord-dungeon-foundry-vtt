import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import fg from 'fast-glob';

import { PluginOption } from "vite";

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


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), WatchPublic()],
  build: {
    lib: {"entry": "src/module/main.ts", "formats": ["iife"], "name": "main", "fileName": "main"},
    watch: {
      buildDelay: 1000,
    }
  }
})
