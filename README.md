# StudioSpace

StudioSpace is a creative-space marketplace connecting photographers, filmmakers, podcasters, musicians, and creative studio hosts.

## Live project

**Live site:** [https://b14-five.vercel.app](https://b14-five.vercel.app)

The Next.js website is deployed on Vercel. The Express API must also be running for registration, sign-in, studio data, and bookings to work. Follow the API deployment steps below and set the Vercel `NEXT_PUBLIC_API_URL` to that API's origin.

## Project highlights

- Discover and filter creative studios, film stages, podcast rooms, music suites, and workshops.
- Create and manage studio listings, upload images, and handle guest booking requests.
- Secure accounts with password authentication and HTTP-only session cookies; optional Google sign-in.
- Browse studio photo galleries, read guest reviews, and prevent overlapping confirmed bookings.
- Manage listings and bookings as a host or guest, with responsive light and dark themes.
- Responsive Next.js and TypeScript client, Express API, MongoDB, and Sonner notifications.

## Local setup

1. Install Node.js 20.9 or newer and make a MongoDB database available locally or through Atlas.
2. Run `npm install` from the project root.
3. Copy `.env.example` to `.env`. Set `MONGODB_URI` and a long random `JWT_SECRET`; keep the file private. Google OAuth and ImgBB are optional.
4. Run `npm run dev`. The Next.js client starts at `http://localhost:3000` and the Express API at `http://localhost:4000`.
5. Use `npm run typecheck` and `npm run build` to validate the client before deployment.

### Examiner access

There is no shared or pre-seeded demo account. Create an account on `/register` with an email you can use and a password containing at least six characters, one uppercase letter, and one lowercase letter. To test hosting and booking, register a second account; after the booking ends, mark it complete as its host to enable the guest review form.

## Deploy the project

The website uses Next.js for the client and a separate Express API for authentication, studios, and bookings. Deploy the client to Vercel and the API to a Node.js host such as Render; Vercel does not start `server/index.ts` as part of the Next.js deployment.

### 1. Set up MongoDB

Create a MongoDB Atlas cluster and database.

**Secure the credentials:** the password generated during setup was shared in chat, so treat it as compromised. In Atlas, open **Security → Database Access**, change or replace that password, and use only the new password. Do not commit credentials or paste them into chat.

Create a dedicated database user for StudioSpace with the **readWrite** role on the `studiospace` database. Do not use the setup user's `atlasAdmin` permissions for the application.

In **Security → Network Access**, your current IP allows your local computer to connect; it does not automatically allow the deployed API. Add the outbound IP addresses shown for your API host (Render lists these for the service/region). Avoid allowing `0.0.0.0/0` if your host provides IP ranges; that setting allows connections from any IP and should only be a temporary fallback.

In Atlas, select **Connect → Drivers** and copy the Node.js connection string. Replace its password placeholder with the new database-user password and set the completed URI as the API service's `MONGODB_URI` environment variable. Keep the URI private.

### 2. Deploy the API

Create a Render Blueprint from this GitHub repository and select the `render.yaml` file. It provisions the Express API as its own Render Web Service; it does not replace the Vercel website. Set `MONGODB_URI` to the rotated Atlas connection string when prompted. Render generates `JWT_SECRET` automatically.

If creating the service manually instead, use the repository root with build command `npm install`, start command `npm run start:server`, and health check path `/api/health`.

Ensure these environment variables are set on the API service:

| Variable | Value |
|---|---|
| `MONGODB_URI` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | A long, random secret; do not commit it |
| `CLIENT_URL` | Your Vercel site origin, for example `https://your-site.vercel.app` |
| `API_URL` | Optional. The Google OAuth callback uses Render's service hostname automatically if this is omitted. |
| `GOOGLE_CLIENT_ID` | Optional; your Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Optional; your Google OAuth client secret |
| `IMGBB_API_KEY` | Optional; enables studio image uploads |

Render supplies `PORT` automatically. After deployment, check `https://your-api.onrender.com/api/health`.

### 3. Deploy the website to Vercel

1. In Vercel, choose **Add New → Project** and import `MSKhanDA/B14-A8-Cat_Harry`.
2. Keep the project root at the repository root and use the detected **Next.js** framework settings. The build command is `npm run build`.
3. Add `NEXT_PUBLIC_API_URL` with the new API service's origin, such as `https://studiospace-api.onrender.com` (no path or trailing slash). This value is public, so it must not contain secrets.
4. Deploy. Set the API service's `CLIENT_URL` to the exact Vercel origin shown after deployment, then redeploy the API.

### 4. Optional sign-in and image uploads

For Google sign-in, add a Google OAuth Web client. Set its authorized redirect URI to `https://your-api.onrender.com/api/auth/google/callback`, then add the client ID and secret to the API service. Set the authorized JavaScript origin to your Vercel site.

Add `IMGBB_API_KEY` to the API environment to enable image uploads. Without it, hosts can still provide a direct image URL.

### Cookie note

The client and API need to send credentials across origins. The API enables credentialed CORS and uses secure cookies in production. Browsers may restrict cookies when the Vercel and API hosts are on different sites. For reliable production sign-in, use custom domains on the same site, such as `studiospace.example.com` and `api.studiospace.example.com`, and update the Vercel API URL, API `CLIENT_URL`, and Google OAuth URLs to match.
