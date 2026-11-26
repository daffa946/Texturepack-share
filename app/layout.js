import './globals.css';

export const metadata = {
  title: 'PackHub – Minecraft packs',
  description: 'Download Minecraft Bedrock packs (.mcpack).',
  robots: { index: false },
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
        <main>{children}</main>
      </body>
    </html>
  );
}
