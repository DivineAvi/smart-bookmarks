This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## PROBLEM FACED

One Good problem , I faced was when adding bookmarks, they wouldn't appear in the list without refreshing and the Supabase realtime channel kept disconnecting and reconnecting.
The issue was that supabase client was being recreated on every render (I passed it as a dependency to useEffect) and I fixed it by wrapping the client in useRef to maintain a stable reference like this `const supabase = useRef(createClient()).current;`

