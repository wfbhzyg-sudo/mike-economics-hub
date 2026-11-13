import {rgb} from 'pdf-lib';

// Keep overflow in labelled continuation pages rather than clipping a student's answer.
export function drawTypedAnnotations(pdf, font, annotations) {
  const originalPages = pdf.getPages();
  for (const annotation of annotations || []) {
    let page = originalPages[annotation.page];
    let x = 25 + Math.min(annotation.x, .9) * 545;
    let y = 790 - annotation.y * 755;
    let width = Math.max(40, Math.min(annotation.width * 545, 570 - x));
    let line = '';
    const flush = () => {
      if (y < 35) {
        page = pdf.addPage([595, 842]);
        page.drawText(`Text annotation continued from page ${annotation.page + 1}`, {x:25,y:815,size:10});
        x = 25; y = 785; width = 545;
      }
      if (line) page.drawText(line, {x,y,font,size:11,color:rgb(.07,.16,.25)});
      line = ''; y -= 15;
    };
    for (const char of annotation.text.replace(/\r/g, '')) {
      if (char === '\n') { flush(); continue; }
      if (char.charCodeAt(0) < 32) continue;
      if (line && font.widthOfTextAtSize(line + char, 11) > width) flush();
      line += char;
    }
    if (line) flush();
  }
}
