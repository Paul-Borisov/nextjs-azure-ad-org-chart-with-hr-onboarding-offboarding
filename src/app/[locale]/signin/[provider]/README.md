The authentication logic works as provided below.

1. components/client/LoginButton.tsx has the Sign In Link.

- Link's url corresponds to http://localhost:3000/en/signin/default?callbackUrl=<page-url-where-login-button-was-clicked-from>

- Note if the user refreshes the page at this point, this URL automatically authenticates the user.

2. When the SignIn Link is clicked, the Modal popup components/client/ModalSignin.tsx is open.

- The logic uses the intercepting route (.)signin/[provider]/page.tsx, which loads components/client/Modal.tsx > components/client/ModalSignin.tsx, where provider is dynamically replaced with default, microsoft-entra-id, google, etc.

- The open popup contains buttons to sign in using corresponding providers.

3. When a button is clicked, the handling logic in the actual (intercepted) route signin/[provider]/page.tsx loads components/client/ModalSigninRedirect.tsx, which executes signIn(...) redirect and adds callbackUrl from p.1.

- next-auth temporarily stores this callbackUrl into the session cookie with key=\_\_Secure-authjs.callback-url

4. next-auth performs the authentication and automatically redirects the authenticated request to callbackUrl value taken from \_\_Secure-authjs.callback-url.
