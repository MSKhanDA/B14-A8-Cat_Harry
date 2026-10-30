# StudioSpace

StudioSpace is a creative-space marketplace connecting photographers, filmmakers, podcasters, musicians, and creative studio hosts.

## Live project

**Live site:** Not deployed yet. Follow the deployment steps below to publish it.

## Project highlights

- Discover and filter creative studios, film stages, podcast rooms, music suites, and workshops.
- Create and manage studio listings, upload images, and handle guest booking requests.
- Secure accounts with password authentication and HTTP-only session cookies; optional Google sign-in.
- Prevent overlapping confirmed bookings, and manage bookings as a guest or host.
- Responsive Next.js and TypeScript client, Express API, MongoDB, and Sonner notifications.

## Deploy the project

The website uses Next.js for the client and a separate Express API for authentication, studios, and bookings. Deploy the client to Vercel and the API to a Node.js host such as Render; Vercel does not start `server/index.ts` as part of the Next.js deployment.

### 1. Set up MongoDB

Create a MongoDB Atlas cluster and database.

**Secure the credentials:** the password generated during setup was shared in chat, so treat it as compromised. In Atlas, open **Security → Database Access**, change or replace that password, and use only the new password. Do not commit credentials or paste them into chat.

Create a dedicated database user for StudioSpace with the **readWrite** role on the `studiospace` database. Do not use the setup user's `atlasAdmin` permissions for the application.

In **Security → Network Access**, your current IP allows your local computer to connect; it does not automatically allow the deployed API. Add the outbound IP addresses shown for your API host (Render lists these for the service/region). Avoid allowing `0.0.0.0/0` if your host provides IP ranges; that setting allows connections from any IP and should only be a temporary fallback.

In Atlas, select **Connect → Drivers** and copy the Node.js connection string. Replace its password placeholder with the new database-user password and set the completed URI as the API service's `MONGODB_URI` environment variable. Keep the URI private.

### 2. Deploy the API

Create a Render Web Service from this GitHub repository:

- **Root directory:** leave blank.
- **Build command:** `npm install`
- **Start command:** `npm run start:server`

Set these environment variables on the API service:

| Variable | Value |
|---|---|
| `MONGODB_URI` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | A long, random secret; do not commit it |
| `CLIENT_URL` | Your Vercel site origin, for example `https://your-site.vercel.app` |
| `API_URL` | Your deployed API origin, for example `https://your-api.onrender.com` |
| `GOOGLE_CLIENT_ID` | Optional; your Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Optional; your Google OAuth client secret |
| `IMGBB_API_KEY` | Optional; enables studio image uploads |

Render supplies `PORT` automatically. After deployment, check `https://your-api.onrender.com/api/health`.

### 3. Deploy the website to Vercel

1. In Vercel, choose **Add New → Project** and import `MSKhanDA/B14-A8-Cat_Harry`.
2. Keep the project root at the repository root and use the detected **Next.js** framework settings. The build command is `npm run build`.
3. Add `NEXT_PUBLIC_API_URL` with your API origin, such as `https://your-api.onrender.com` (no path or trailing slash). This value is public, so it must not contain secrets.
4. Deploy. Set the API service's `CLIENT_URL` to the exact Vercel origin shown after deployment, then redeploy the API.

### 4. Optional sign-in and image uploads

For Google sign-in, add a Google OAuth Web client. Set its authorized redirect URI to `https://your-api.onrender.com/api/auth/google/callback`, then add the client ID and secret to the API service. Set the authorized JavaScript origin to your Vercel site.

Add `IMGBB_API_KEY` to the API environment to enable image uploads. Without it, hosts can still provide a direct image URL.

### Cookie note

The client and API need to send credentials across origins. The API enables credentialed CORS and uses secure cookies in production. Browsers may restrict cookies when the Vercel and API hosts are on different sites. For reliable production sign-in, use custom domains on the same site, such as `studiospace.example.com` and `api.studiospace.example.com`, and update the Vercel API URL, API `CLIENT_URL`, and Google OAuth URLs to match.
