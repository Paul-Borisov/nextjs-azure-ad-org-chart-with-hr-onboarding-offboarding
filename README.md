# HR Onboarding and Offboarding Web App for Azure AD and local AD with flexible Organizational Charts

HR Onboarding and Offboarding Web App for managing employees in Azure AD and hybrid local AD. This app provides convenient options to create, update, and delete Entra ID and hybrid local AD accounts. The app also offers configurable Organizational Charts to display company hierarchies based on users attributes from Azure AD.

## Technological stack

### Backend

Next.js 14.2.4, Auth.js v5, Entra ID with MS Graph, Prisma with SLQLITE / Postgres / Azure SQL providers, Azure App Service, Azure Automation with Hybrid Workers.

### Frontend

React Hook Forms, Zod, Tanstack Query, i18n Next (EN, FI, NO locales), Next Themes.

UI kits: Radix UI, Fluent UI, Tailwind.

# Getting Started

Running in the development environment:

```bash
# Turbopack integration for Next 14.2.x
turbo dev
# or
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

# Deploy on Azure App Service (recommended)

The app is intended to run on Azure App Service. Recommended configuration: Linux, 4 Gb, Premium Plan (memory vs. price, the most optimal choice).

- "standalone" mode added into next.config.mjs
- To set the startup-file:
- az webapp config set --resource-group "YOUR-RESOURCE-GROUP" --name "company-hr-onboarding" --startup-file "node server.js"
- An example: https://dev.to/paulriviera/deploy-nextjs-14-app-to-linux-azure-app-service-3d34

### The configured command "npm run build" uses:

### On Windows

### next build && @powershell copy .next/static .next/standalone/.next/static -recurse -force && @powershell copy public .next/standalone/public -recurse -force

### On Linux

### next build && cp -r -f .next/static .next/standalone/.next/static && cp -r -f public .next/standalone/public

Run:

npm run build

Deploy:

The entire folder .next/standalone to Azure App Service using Azure Tools extension in VSCode

## Known issues

HTTP ERROR 431: cleanup previous authentication cookies from your browser's Application tab. It should resolve the issue.

HTTP ERROR DNS_PROBE_FINISHED_NXDOMAIN: if you run your web app in the cloud environment like Azure App Service,
you should add the environment variable AUTH_URL=https://<your-web-app> to enable Auth.js v5 correctly.

- The recent comment "...it is not strictly necessary anymore in most environments" does not seem to work for Azure App Service; it is still required there.

## Deploy on Vercel (optional)

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
