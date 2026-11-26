import JSZip from 'jszip';

// Removes // and /* */ comments and trailing commas (some Bedrock manifests have them).
function stripComments(s) {
  let o = '', inStr = false;
  for (let i = 0; i < s.length; i++) {
    const c = s[i], n = s[i + 1];
    if (inStr) { o += c; if (c === '\\') { o += n; i++; } else if (c === '"') inStr = false; continue; }
    if (c === '"') { inStr = true; o += c; }
    else if (c === '/' && n === '/') { while (i < s.length && s[i] !== '\n') i++; o += '\n'; }
    else if (c === '/' && n === '*') { i += 2; while (i < s.length && !(s[i] === '*' && s[i + 1] === '/')) i++; i++; }
    else o += c;
  }
  return o.replace(/,\s*([}\]])/g, '$1');
}

// Many packs put the author in the description, e.g. "edited by mop/krystal".
const guessAuthor = (d) => {
  const m = [...String(d || '').matchAll(/\b(?:made by|edited by|created by|credits?:?|by)\s+([^.\n,;]+)/gi)].pop();
  return m ? m[1].trim() : '';
};
const clean = (s) => String(s || '').replace(/§./g, '').trim();

// Reads a .mcpack (a zip): manifest.json for name/author/version, pack_icon.png for the icon.
export async function readPack(file) {
  const zip = await JSZip.loadAsync(file);
  const names = Object.keys(zip.files).filter((n) => !zip.files[n].dir);
  const shallowest = (re) =>
    names.filter((n) => re.test(n)).sort((a, b) => a.split('/').length - b.split('/').length)[0];

  const mPath = shallowest(/(^|\/)manifest\.json$/i);
  if (!mPath) throw new Error('No manifest.json found. Is this a Minecraft Bedrock .mcpack?');
  const base = mPath.slice(0, -'manifest.json'.length);
  const manifest = JSON.parse(stripComments((await zip.file(mPath).async('string')).replace(/^\uFEFF/, '')));

  // Names can be translation keys like "pack.name": look them up in texts/en_US.lang.
  const langFile = zip.file(base + 'texts/en_US.lang');
  const lang = {};
  if (langFile) {
    (await langFile.async('string')).split(/\r?\n/).forEach((line) => {
      const m = line.replace(/\s+#.*$/, '').match(/^([^=#]+)=(.*)$/);
      if (m) lang[m[1].trim()] = m[2].trim();
    });
  }
  const tr = (v) => (v && lang[v] ? lang[v] : v);

  const h = manifest.header || {};
  const iconEntry = zip.file(base + 'pack_icon.png') || zip.file(base + 'pack_icon.jpg') || zip.file(base + 'pack_icon.jpeg');
  let iconFile = null;
  if (iconEntry) {
    const blob = await iconEntry.async('blob');
    const type = /png$/i.test(iconEntry.name) ? 'image/png' : 'image/jpeg';
    iconFile = new File([blob], iconEntry.name.split('/').pop(), { type });
  }
  const authors = manifest.metadata?.authors;
  return {
    iconFile,
    meta: {
      name: clean(tr(h.name)) || file.name.replace(/\.\w+$/, ''),
      author: Array.isArray(authors) ? authors.join(', ') : clean(authors) || guessAuthor(clean(tr(h.description))),
      version: Array.isArray(h.version) ? h.version.join('.') : '',
      description: clean(tr(h.description)),
      minEngine: Array.isArray(h.min_engine_version) ? h.min_engine_version.join('.') : '',
      packType: manifest.modules?.[0]?.type || '',
    },
  };
}
