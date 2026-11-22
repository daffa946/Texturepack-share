# PackHub – Minecraft texture pack sharing site

## Deploy on Vercel
1. Push this folder to a GitHub repo (or run `npx vercel` inside it).
2. In Vercel: Import the repo → Deploy.
3. Project → **Storage** → Create **Blob** store → connect it to the project
   (this adds BLOB_READ_WRITE_TOKEN automatically).
4. Project → **Settings → Environment Variables** → add `ADMIN_PASSWORD` (your own secret).
5. Redeploy. Open `/upload` on your site to add packs.

## Local run
npm install
echo "ADMIN_PASSWORD=secret" >> .env.local
echo "BLOB_READ_WRITE_TOKEN=..." >> .env.local   # from the Vercel Blob store
npm run dev
