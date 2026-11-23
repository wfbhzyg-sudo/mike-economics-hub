// The downloaded report also runs this local-only print setup so a different
// device can measure its own font metrics before printing the same A4 sheet.
function installReportPrint() {
  const report = document.querySelector('main');
  const paper = document.getElementById('report-paper');
  const mobile = document.getElementById('report-mobile');

  function fitSheet() {
    const readingMedia = mobile.media;
    const paperMedia = paper.media;
    const scrollLeft = window.scrollX;
    const scrollTop = window.scrollY;
    const ruler = document.createElement('div');
    ruler.style.cssText = 'position:fixed;visibility:hidden;pointer-events:none;width:var(--paper-width);height:var(--paper-height)';

    try {
      mobile.media = 'not all';
      paper.media = 'all';
      document.body.append(ruler);
      const bounds = ruler.getBoundingClientRect();
      // Leave a fraction of a millimetre for rounding PDF points to CSS pixels.
      const width = Math.floor(bounds.width) - 1;
      const height = Math.floor(bounds.height) - 2;
      function fits(scale) {
        report.style.setProperty('--report-layout-width', Math.floor(width / scale) + 'px');
        report.style.setProperty('--report-zoom', String(scale));
        const size = report.getBoundingClientRect();
        return size.height <= height && size.width <= width + 0.5;
      }
      const largest = 1.25;
      if (fits(largest)) return;
      let high = largest;
      let low = high / 2;
      while (!fits(low) && low > 0.002) {
        high = low;
        low /= 2;
      }
      for (let step = 0; step < 9; step++) {
        const middle = (low + high) / 2;
        if (fits(middle)) low = middle;
        else high = middle;
      }
      fits(low);
    } finally {
      ruler.remove();
      mobile.media = readingMedia;
      paper.media = paperMedia;
      if (!window.matchMedia('print').matches && (window.scrollX !== scrollLeft || window.scrollY !== scrollTop)) {
        window.scrollTo(scrollLeft, scrollTop);
      }
    }
  }
  window.addEventListener('beforeprint', fitSheet);
  return fitSheet;
}

const fitSheet = installReportPrint();
document.getElementById('print').onclick = () => {
  fitSheet();
  window.print();
};
document.getElementById('save').onclick = () => {
  fitSheet();
  const snapshot = document.documentElement.cloneNode(true);
  snapshot.querySelector('.actions').remove();
  const offlinePrint = document.createElement('script');
  offlinePrint.textContent = '(' + installReportPrint.toString() + ')();';
  snapshot.querySelector('script').remove();
  snapshot.querySelector('body').append(offlinePrint);
  const url = URL.createObjectURL(new Blob(['<!doctype html>\n',snapshot.outerHTML],{type:'text/html;charset=utf-8'}));
  const link = document.createElement('a');
  link.download = document.title.replace(/[\\/:*?"<>|]/g,'-') + '.html';
  link.href = url;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(()=>URL.revokeObjectURL(url),60000);
};
