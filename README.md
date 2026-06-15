This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Data Sync

Aztec Pulse stores developer activity and TVL snapshots in Postgres through Prisma.
Token and live network data are fetched at runtime.

Required environment variables:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require"
GITHUB_TOKEN="github_pat_or_gh_token_for_local_sync"
AZTEC_NODE_URL="optional_aztec_rpc_endpoint"
```

For GitHub Actions, add `DATABASE_URL` as an Actions secret. The workflow uses
GitHub's automatic `GITHUB_TOKEN`, so no manual GitHub token secret is needed.

Useful commands:

```bash
npm run pipeline:status
npm run pipeline:all
npm run pipeline:tvl
```

The scheduled sync runs daily at 06:00 UTC and can also be triggered manually
from the GitHub Actions tab.

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

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
