Talé Hotel frontend — Next.js App Router with bilingual (English / Arabic)
localization, RTL-aware layout, and locale-specific SEO metadata.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) (auto-redirects to the
preferred locale, `/en` or `/ar`).

## Route structure

```
src/app/
├── (site)/[locale]/        # public brochure, property detail, auth/success
│   ├── layout.tsx          # <html lang+dir>, fonts, SEO metadata, JSON-LD
│   ├── page.tsx            # home (renders HomeClient + Hotel schema)
│   ├── properties/[id]/    # suite detail
│   └── auth/success/       # OAuth callback
├── (portal)/portal/        # guest portal (English only, noindex)
├── (admin)/admin/          # admin console (English only, noindex)
├── sitemap.ts              # locale-aware sitemap with hreflang alternates
└── robots.ts               # disallows /admin, /portal, /auth
```

Supported locales: `en` (default), `ar`. See `src/i18n/routing.ts`.
Message dictionaries live in `src/i18n/messages/{en,ar}.json`.

## Environment variables

Copy `.env.example` to `.env.local` and fill in what applies:

| Variable                          | Purpose                                           |
| --------------------------------- | ------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`            | Canonical origin for SEO (sitemap, hreflang, OG). |
| `BACKEND_URL`                     | Dev-only API proxy target (default `:5000`).      |
| `NEXT_PUBLIC_API_URL`             | Public API base; blank uses same-origin `/api`.   |
| `NEXT_PUBLIC_SOCIAL_INSTAGRAM_URL`| Footer + JSON-LD sameAs.                          |
| `NEXT_PUBLIC_SOCIAL_FACEBOOK_URL` | Footer + JSON-LD sameAs.                          |

`NEXT_PUBLIC_SITE_URL` must be set in production so canonical URLs and
hreflang tags resolve to the real origin.

## i18n notes

- Use the `Link`, `useRouter`, and `usePathname` exports from
  `@/i18n/navigation` in client components to preserve locale on navigation.
- Use logical Tailwind utilities (`ms-`, `me-`, `ps-`, `pe-`, `start-`,
  `end-`, `text-start`) instead of left/right variants.
- Mirror directional icons in RTL with `rtl:-scale-x-100`.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
