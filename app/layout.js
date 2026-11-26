import './globals.css';

export const metadata = {
  title: 'Bedwars Packs – Minecraft Bedrock texture packs',
  description: 'Download Bedwars-ready Minecraft Bedrock texture packs (.mcpack).',
};

const TEAMS = ['#ff5555', '#5577ff', '#55dd55', '#ffdd33', '#44dddd', '#f0f0f0', '#ff77cc', '#9aa0a6'];

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Silkscreen:wght@400;700&family=Nunito:wght@400;600;800&display=swap" rel="stylesheet" />
      </head>
      <body>
        <div className="strip" aria-hidden="true">{TEAMS.map((c) => <i key={c} style={{ background: c }} />)}</div>
        <main>{children}</main>
        <footer className="foot">Not affiliated with Mojang, Microsoft or The Hive.</footer>
      </body>
    </html>
  );
}
