// app/routes/login.tsx or equivalent route file
import { redirect } from "react-router";
import { json } from "@remix-run/node";
import { login, sessionStorage } from "~/services/auth.server";

// Import this from correct place for your route
type LoginProps = {
    actionData?: { error?: string };
}

type LoginActionArgs = {
    request: Request;
};

type LoginLoaderArgs = {
    request: Request;
};

// First we create our UI with the form doing a POST and the inputs with
// the names we are going to use in the strategy
export default function Component({ actionData }: LoginProps) {
  return (
    <div>
      <h1>Login</h1>

      {actionData?.error ? (
        <div className="error">{actionData.error}</div>
      ) : null}

      <form method="post">
        <div>
          <label htmlFor="email">Email</label>
          <input type="email" name="email" id="email" required />
        </div>

        <div>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            name="password"
            id="password"
            autoComplete="current-password"
            required
          />
        </div>

        <button type="submit">Sign In</button>
      </form>
    </div>
  );
}

// Second, we need to export an action function, here we will use the
// `authenticator.authenticate` method
export async function action({ request }: LoginActionArgs) {
        let session = await sessionStorage.getSession(
      request.headers.get("cookie")
    );

  try {
    // we call the method with the name of the strategy we want to use and the
    // request object
    const form = await request.formData();
    const email = form.get("email")?.toString() || "";
    const password = form.get("password")?.toString() || "";

    const user = await login(email, password);



    session.set("user", user);

    // Redirect to the home page after successful login
    return redirect("/", {
      headers: {
        "Set-Cookie": await sessionStorage.commitSession(session),
      },
    });
  } catch (error) {
     session.flash("error", "Invalid username/password");

    // Redirect back to the login page with errors.
    return redirect("/login", {
      headers: {
        "Set-Cookie": await sessionStorage.commitSession(session),
      },
    });
  }
}

// Finally, we need to export a loader function to check if the user is already
// authenticated and redirect them to the dashboard
export async function loader({ request }: LoginLoaderArgs) {
  let session = await sessionStorage.getSession(request.headers.get("cookie"));
  let user = session.get("user");

  // If the user is already authenticated redirect to the dashboard
  if (user) return redirect("/");

  // Otherwise return null to render the login page
  return json(null);
}
