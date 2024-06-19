## Getting Started

Running in the development environment:

```bash
turbo dev
# or
npm run dev
```

Turbopack integration: https://turbo.build/repo/docs/getting-started/add-to-project

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

# Deploy on Azure App Service

https://dev.to/paulriviera/deploy-nextjs-14-app-to-linux-azure-app-service-3d34

- Add standalone to next.config.mjs
- Set startup-file:
- az webapp config set --resource-group "AZU-SYNC" --name "gthr" --startup-file "node server.js"

https://github.com/nodejs/undici/issues/1531, Dear Microsoft :-(
npm run build
cp -r .next/static .next/standalone/.next/static
cp -r db .next/standalone/db
deploy the entire folder standalone to App Service using Azure Tools extension in VSCode

HTTP ERROR 431: cleanup previous authentication cookies from your browser's Application tab. It should resolve the issue.

HTTP ERROR DNS_PROBE_FINISHED_NXDOMAIN: if you run your web app in the cloud environment like Azure App Service,
you should add the environment variable AUTH_URL=https://<your-web-app> to enable Auth.js v5.

- The recent comment "...it is not strictly necessary anymore in most environments" does not seem to work for Azure App Service; it is still required there.

## Deploy on Vercel

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
