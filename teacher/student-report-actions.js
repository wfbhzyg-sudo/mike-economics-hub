document.getElementById('print').onclick = () => window.print();
document.getElementById('save').onclick = () => {
  const snapshot = document.documentElement.cloneNode(true);
  snapshot.querySelector('.actions').remove();
  snapshot.querySelector('script').remove();
  const url = URL.createObjectURL(new Blob(['<!doctype html>\n',snapshot.outerHTML],{type:'text/html;charset=utf-8'}));
  const link = document.createElement('a');
  link.download = document.title.replace(/[\\/:*?"<>|]/g,'-') + '.html';
  link.href = url;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(()=>URL.revokeObjectURL(url),60000);
};
