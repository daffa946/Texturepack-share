import { getPacks } from './lib/packs';
import Gallery from './Gallery';

export const dynamic = 'force-dynamic';

function Bed() {
  return (
    <svg viewBox="0 0 64 40" shapeRendering="crispEdges" role="img" aria-label="Bed">
      <rect x="0" y="8" width="6" height="30" fill="#6b3f1a" />
      <rect x="58" y="22" width="6" height="16" fill="#6b3f1a" />
      <rect x="0" y="24" width="64" height="8" fill="#8a5527" />
      <rect x="6" y="14" width="16" height="10" fill="#f4f4f4" />
      <rect x="22" y="14" width="36" height="10" fill="#e03a3a" />
      <rect x="22" y="14" width="36" height="3" fill="#ff6b6b" />
      <rect x="6" y="14" width="16" height="2" fill="#ffffff" />
    </svg>
  );
}

export default async function Home() {
  const { packs, error } = await getPacks();
  return (
    <>
      <section className="hero">
        <Bed />
        <div>
          <h1>BEDWARS <em>PACKS</em></h1>
          <p className="sub">Texture packs for Minecraft Bedrock. Download the .mcpack, open it, and Minecraft imports it for you.</p>
          <div className="chips">
            <span className="chip"><b>{packs.length}</b> packs</span>
            <span className="chip">Bedrock</span>
            <span className="chip">.mcpack</span>
          </div>
        </div>
      </section>
      {error ? <div className="errbox">Could not load packs: {error}</div> : <Gallery packs={packs} />}
    </>
  );
}
