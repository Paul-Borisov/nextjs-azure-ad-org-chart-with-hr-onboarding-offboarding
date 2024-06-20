# HR onboarding and offboarding web app for Azure AD and local AD with flexible Organizational Charts

This is known that onboarding a new employee to company's working staff and offboarding of leaving members are continuous processes.
However, significant parts of these routines can be automated. For instance, the new employee typically joins specific manager's team.
This implies we can copy repeating parts of employee's attributes such as unit, department, country, subsidiary address and so on from the manager.
Also, there are standard routines such as generating new sign-in credentials, joining required security groups, sending a summary report to the manager.

This HR onboarding and offboarding web application solves most frequently problems related to managing employee accounts in Azure AD and hybrid local AD.

- It provides convenient options to quickly create, update, and delete Entra ID and hybrid local AD accounts without a need of opening a VPN connection.
- The app offers configurable Organizational Charts that provide displaying company hierarchies based on users attributes stored in Azure AD.
- Organizational Charts support flexible grouping by multiple user attributes up to 5 levels deep and up to 5 columns long.
- Optional operations on local AD are done using proxy-capabilities of Azure Automation Hybrid Worker connected to a VM with access to local AD.

## Technical stack

### Backend

- Next.js 14.2.4, turbo pack, React 18.
- Auth.js v5 for App Router, OAuth2 / JWT. Default auth provider is Microsoft Entra ID.
- Entra ID with MS Graph REST API, delegated API permissions.
- Prisma ORM with SLQLITE (default for quick start) / Azure SQL / Postgres providers.
  - Also tested with Drizzle ORM. However, it did not support Azure SQL that we used to host our DB.
- Server-side worker threads (Node.js worker_threads) to support loading optional user images in a non-blocking way.
  - Server Actions have problems in handling multiple simultaneous mutations.
  - They should not be used for making intensive parallel mutations because they tend to block the main thread despite of async processing.
  - However, I found it possible to use worker threads in Next.js. This is poorly documented, but it works well.
- Optional Azure Automation with Hybrid Worker to handle operations on local AD users.
- The app is seamlessly deployable on Azure App Service. Recommended App Plan is Linux, 4Gb (1.75GB is not enough).

### Frontend

- React Hook Forms, Zod
- Tanstack Query
- i18n Next with support of EN, FI, NO locales
- Next Themes, Dark and Light themes for all components
- UI kits: Radix UI, Fluent UI, Tailwind CSS
- PDF printing with no external modules

## Supported features

1. Full-size <a href="samples/images/1_full-plain-hierarchy.png">hierarchical</a> and <a href="samples/images/2_three-levels-tree-view-grouped-by-units-departments-teams.png">Organizationals</a> Charts with configurable levels.

- They provide visual presentation of company's hierarchy based on selected attributes such as units, departments, teams, and manager-subordinate relations.
- In order to generate Org Chart hierarchies using Entra ID data, the user has to be authenticated via the standard login URL of Microsoft 365.
  - While the user is not authenticated, mockup data is shown by default. This can be turned off in .env settings.
- Hierarchies are <a href="samples/images/3_dialog-to-change-groupings.png">configurable</a> and printable.
- The views support full and partial <a href="samples/images/4_filtered-view-grouped-by-country-company-manager-andreas-user-card.png">search</a> by user's name.

2. Creating a new user account in Entra ID or hybrid local AD at any level of the hierarchy under the supervision of a specific manager.

- <a href="samples/images/5_adding-a-new-azure-ad-user-for-manager.png">This option</a> is available only for users that belong to global Entra ID roles of User Administrator or Global Administrator. Security checks are automatic so regular users cannot see this feature.
- Required fields are minimal and include only First and Last name. The most of other attributes are optional or can be copied from the selected manager.
- The creator can choose:
  - Account type being created - cloud-only (Entra ID only) or hybrid local AD with sync via AD Connect
  - Desired security groups to add the new user to. Default groups are taken from env-variables, more can be selected in UI.
  - User photo for the new account.
  - Sending a <a href="samples/images/6_user-account-created-send-mail-to-inform-manager.png" data-interception="off">summary email</a> to the manager after successfully creating the user.

3. Two-stage offboarding for the leving employee.

- <a href="samples/images/10_disable-delete-deleted-user.png">Stage 1</a> disables the existing employee in Azure AD or hybrid local AD, resets password, and removes group memberships. This stage is optional.
- Stage 2 removes employee's account from Azure AD or hybrid local AD.

4. <a href="samples/images/7_options-to-manage-this-user.png">Updating attributes</a> of existing users in Entra ID or hybrid local AD.

- This is an experimental feature, which currently supports changing EmployeeId. Mismatching EmployeeId was a frequent problem of my customer.

# Getting Started

Create Azure App registration using the sample script located in samples/1_create-app-registration.ps1

- Ignore xml-files used to create for SharePoint Online lists. SharePoint options are not in use by default.
- Note that all permissions are "delegated" meaning the user must have corresponding rights to use them as declared.
- In Entra ID operations on user management are available only for users that belong to the roles of User Administrators or Global Administrators.
- Users with lower privilegies will only access Organizational Charts without controls to manage users.
- Overview of permissions:

  - offline_access: delegated permission required to support refresh tokens
  - User.ReadWrite.All: delegated permission to manage user's attributes.
  - Directory.Read.All: delegated permission to read groups and enumerate global roles like User Administrators or Global Administrators.
  - Group.ReadWrite.All: delegated permission to add members to groups.
  - Directory.AccessAsUser.All: delegated permission used for admin impersonations.
  - AllSites.Write: this SharePoint permission is not required in default configurations and can be removed.

Make sure you granted Admin consent to approve the permissions.

Optionally, you can enable operations on a hybrid local AD.

- Create Azure Automation account. Deploy two Powershell runbooks located in src/azureAutomation/runbooks. Adjust headers if required.
- Create and connect Hybrid Worker to a Windows Server VM running in the local AD network.
- This VM must have standard Active Directory PowerShell Module installed to operate with AD.

Running in the development environment:

- You should create .env using .env.example as a sample
- Update at least the following settings:
  - AZURE_AD_CLIENT_ID, AZURE_AD_CLIENT_SECRET (use the App registration created above), AZURE_AD_TENANT_ID
  - AZURE_AD_GRAPH_QUERY_USERS, review user attributes that you'd need
  - DATABASE_URL, it uses local SQLITE file by default
  - RENDER_USER_PHOTO_ON_CLIENT, RENDER_USER_PHOTO_ON_SERVER: keep them off to start faster
  - TREEVIEW_COLLAPSE_ON_ROOT: optionally change to false should you have quirks
  - USER_CARD_ATTRIBUTES: review user attributes that you'd need

```bash
cd src
npm i
# Turbopack integration for Next 14.2.x
turbo dev
# or
npm run dev
# In order to run a locally compiled standalone version use
node .next/standalone/server.js
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

# Deploy on Azure App Service (recommended)

The app is intended to run on Azure App Service. Recommended configuration: Linux, 4 Gb, Premium Plan (memory vs. price, the most optimal choice).

- "standalone" mode added into next.config.mjs
- To set the startup-file:
- az webapp config set --resource-group "YOUR-RESOURCE-GROUP" --name "company-hr-onboarding" --startup-file "node server.js"
- An example: https://dev.to/paulriviera/deploy-nextjs-14-app-to-linux-azure-app-service-3d34

The configured command "npm run build" uses:

On Windows

next build && @powershell copy .next/static .next/standalone/.next/static -recurse -force && @powershell copy public .next/standalone/public -recurse -force

On Linux

next build && cp -r -f .next/static .next/standalone/.next/static && cp -r -f public .next/standalone/public

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

## Screenshots

Full plain hierarchy

![Full plain hierarchy](samples/images/1_full-plain-hierarchy.png "Full plain hierarchy")

Three levels tree-view grouped by units, departments, and teams

![Three levels tree-view grouped by units, departments, and teams](samples/images/2_three-levels-tree-view-grouped-by-units-departments-teams.png "Three levels tree-view grouped by units, departments, and teams")

Dialog to change groupings

![Dialog to change groupings](samples/images/3_dialog-to-change-groupings.png "Dialog to change groupings")

Filtered view grouped by Country, Company, and Manager "andreas" with user-card

![Filtered view grouped by Country, Company, and Manager 'andreas' with user-card](samples/images/4_filtered-view-grouped-by-country-company-manager-andreas-user-card.png "Filtered view grouped by Country, Company, and Manager 'andreas' with user-card")

Adding a new Azure AD user for a manager

![Adding a new Azure AD user for a manager](samples/images/5_adding-a-new-azure-ad-user-for-manager.png "Adding a new Azure AD user for a manager")

User account created, sending an email to inform the manager

![User account created, sending an email to inform the manager](samples/images/6_user-account-created-send-mail-to-inform-manager.png "User account created, sending an email to inform the manager")

Options to manage this user

![Options to manage this user](samples/images/7_options-to-manage-this-user.png "Options to manage this user")

User data

![User data](samples/images/8_aad-user-1.png "User data")

More user data

![More user data](samples/images/9_aad-user-2.png "More user data")

Disable or delete user. Deleted user

![Disable or delete user. Deleted user](samples/images/10_disable-delete-deleted-user.png "Disable or delete user. Deleted user")
