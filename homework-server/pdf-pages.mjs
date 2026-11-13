import {createCanvas,DOMMatrix,ImageData,Path2D} from '@napi-rs/canvas';
globalThis.DOMMatrix??=DOMMatrix;globalThis.ImageData??=ImageData;globalThis.Path2D??=Path2D;
const {getDocument}=await import('pdfjs-dist/legacy/build/pdf.mjs');
export async function openPDF(bytes){return getDocument({data:new Uint8Array(bytes),useSystemFonts:true,isEvalSupported:false,disableFontFace:true}).promise;}
export async function renderPage(pdf,number){const page=await pdf.getPage(number),v=page.getViewport({scale:Math.min(2,1800/page.getViewport({scale:1}).width)}),canvas=createCanvas(Math.ceil(v.width),Math.ceil(v.height));await page.render({canvasContext:canvas.getContext('2d'),viewport:v}).promise;const text=(await page.getTextContent()).items.map(x=>x.str).join(' ');return {bytes:canvas.toBuffer('image/png'),text,width:canvas.width,height:canvas.height};}
