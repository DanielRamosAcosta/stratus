import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteError,
  Link,
  isRouteErrorResponse,
} from "@remix-run/react";
import type { LinksFunction } from "@remix-run/node";

import "./tailwind.css";

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                function getThemePreference() {
                  const savedTheme = localStorage.getItem('theme');
                  if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
                    return savedTheme;
                  }
                  return 'system';
                }
                
                function applyTheme(theme) {
                  const root = document.documentElement;
                  root.classList.remove('light', 'dark');
                  
                  if (theme === 'system') {
                    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                    root.classList.add(systemTheme);
                  } else {
                    root.classList.add(theme);
                  }
                }
                
                const theme = getThemePreference();
                applyTheme(theme);
                
                // Listen for system theme changes
                if (theme === 'system') {
                  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function() {
                    applyTheme('system');
                  });
                }
              })();
            `,
          }}
        />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary() {
  const error = useRouteError();
  
  console.error(error);

  let title = "Oops! Something went wrong";
  let message = "Sorry, an unexpected error occurred.";
  let status = "500";

  if (isRouteErrorResponse(error)) {
    status = error.status.toString();
    switch (error.status) {
      case 404:
        title = "404 Page Not Found";
        message = "Sorry, we couldn't find the page you're looking for.";
        break;
      case 401:
        title = "401 Unauthorized";
        message = "You don't have permission to access this resource.";
        break;
      case 403:
        title = "403 Forbidden";
        message = "Access to this resource is forbidden.";
        break;
      case 500:
        title = "500 Internal Server Error";
        message = "Something went wrong on our end. Please try again later.";
        break;
      default:
        title = `${error.status} Error`;
        message = error.statusText || "An error occurred.";
    }
  }

  return (
    <div className="flex items-center min-h-screen px-4 py-12 sm:px-6 md:px-8 lg:px-12 xl:px-16">
      <div className="w-full space-y-6 text-center">
        <div className="space-y-3">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl">{title}</h1>
          <p className="text-gray-500 dark:text-gray-400">{message}</p>
        </div>
        <Link
          to="/"
          className="inline-flex h-10 items-center rounded-md border border-gray-200 bg-white shadow-sm px-8 text-sm font-medium transition-colors hover:bg-gray-100 hover:text-gray-900 dark:border-gray-800 dark:bg-gray-950 dark:hover:bg-gray-800 dark:hover:text-gray-50"
        >
          Return to website
        </Link>
      </div>
    </div>
  );
}
