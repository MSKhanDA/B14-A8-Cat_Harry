# StudioSpace

StudioSpace is a creative-space marketplace for photographers, filmmakers, podcasters, musicians, and the people who host them.

## Project highlights

- Discover, search, and filter photo studios, film stages, podcast rooms, music suites, and creative workshops.
- Create, edit, and remove studio listings with image uploads, hourly pricing, capacity, amenities, and host profiles.
- Request studio bookings, cancel pending requests, and let hosts confirm or decline requests.
- Prevent overlapping confirmed reservations and protect server mutations with JWTs stored in HTTP-only cookies.
- Sign in with email/password or Google OAuth; password rules require uppercase and lowercase letters and at least six characters.
- Toggle light and dark themes; responsive layouts, branded loading states, custom empty states, dialogs, and toast notifications are included.
- Built with Next.js App Router, React, TypeScript, Express, MongoDB/Mongoose, Zod, Passport Google OAuth, and Sonner.

## Live site

Not deployed yet. The local client runs at [http://localhost:3000](http://localhost:3000); deploy the Next.js client and Express API to your hosting provider to publish a live URL.

## Local setup

1. Install Node.js 20 or newer and MongoDB, or create a MongoDB Atlas database.
2. Install project dependencies with `npm install`.
3. Copy `.env.example` to `.env` and set `MONGODB_URI` and a long, unique `JWT_SECRET`.
4. Set `CLIENT_URL=http://localhost:3000`, `API_URL=http://localhost:4000`, and `PORT=4000` for local development.
5. To enable Google sign-in, create OAuth credentials and set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`. Set the authorized callback URL to `http://localhost:4000/api/auth/google/callback`.
6. To enable image uploads, set an ImgBB API key in `IMGBB_API_KEY`.
7. Run both applications with `npm run dev`. The client is at `http://localhost:3000`; the API health check is at `http://localhost:4000/api/health`.
8. Run `npm run typecheck` and `npm run build` to validate the client and TypeScript sources.

## Examiner test account

There are no shared or hard-coded credentials. Create an account on `/register`, then sign in and use that account to list a space, create a second account to request a booking, and return to the host account to confirm it. This exercises the complete host and guest flows without publishing a default password.

## Environment variables

See `.env.example` for the server configuration. Set `NEXT_PUBLIC_API_URL` to the public API origin when deploying the client to a different host. Configure CORS `CLIENT_URL`, the Google OAuth callback URL, MongoDB access, and secure production secrets for the deployed environment.
