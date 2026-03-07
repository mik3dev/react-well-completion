import { toPng, toSvg } from 'html-to-image';

export function useExport() {
  const getNode = () => document.getElementById('well-diagram');

  const exportPng = async () => {
    const node = getNode();
    if (!node) return;
    const dataUrl = await toPng(node, { backgroundColor: 'white' });
    const link = document.createElement('a');
    link.download = 'well-diagram.png';
    link.href = dataUrl;
    link.click();
  };

  const exportSvg = async () => {
    const node = getNode();
    if (!node) return;
    const dataUrl = await toSvg(node, { backgroundColor: 'white' });
    const link = document.createElement('a');
    link.download = 'well-diagram.svg';
    link.href = dataUrl;
    link.click();
  };

  const copyToClipboard = async () => {
    const node = getNode();
    if (!node) return;
    const dataUrl = await toPng(node, { backgroundColor: 'white' });
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    await navigator.clipboard.write([
      new ClipboardItem({ 'image/png': blob }),
    ]);
  };

  return { exportPng, exportSvg, copyToClipboard };
}
