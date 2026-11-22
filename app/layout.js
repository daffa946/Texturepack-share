import './globals.css';
import Link from 'next/link';

export const metadata = {
  title: 'PackHub – Minecraft texture packs',
  description: 'Download and share Minecraft texture packs.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Silkscreen:wght@400;700&family=Nunito:wght@400;600;800&display=swap" rel="stylesheet" />
      </head>
      <body>
        <header className="bar">
          <Link href="/" className="logo">PackHub</Link>
          <nav><Link href="/upload">Add a pack</Link></nav>
        </header>
        <main>{children}</main>
        <footer className="foot">Not affiliated with Mojang or Microsoft.</footer>
      </body>
    </html>
  );
}
