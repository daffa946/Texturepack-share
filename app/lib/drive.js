// Turns any Google Drive share link into a direct-download link.
export function driveInfo(link) {
  const m = link.match(/\/file\/d\/([\w-]+)/) || link.match(/[?&]id=([\w-]+)/);
  if (!m) return null;
  return {
    id: m[1],
    download: `https://drive.google.com/uc?export=download&id=${m[1]}`,
    view: `https://drive.google.com/file/d/${m[1]}/view`,
  };
}
