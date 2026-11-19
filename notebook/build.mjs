import {build} from 'esbuild';
import {writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const project = file => fileURLToPath(new URL(file, import.meta.url));
const {outputFiles}=await build({
  entryPoints:[project('./preview.js')],
  write:false,
  bundle:true,minify:true,format:'esm',target:'es2020',
  loader:{'.svg':'text','.webp':'dataurl'},
  // Optional dependency location for isolated build runners.
  nodePaths:process.env.NOTEBOOK_NODE_PATH?[process.env.NOTEBOOK_NODE_PATH]:[],
});
// Normalize trailing spaces in the bundled shader templates.
await writeFile(project('../assets/notebook/scene-v1.js'),outputFiles[0].text.replace(/[ \t]+$/gm,''));
