import { data, Link, useLoaderData } from "@remix-run/react";
import { Shield, ArrowLeft, Mail } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { asyncFlow } from "../utils/asyncFlow";
import { withProtection } from "../core/shared/infrastructure/middlewares/withProtection";

export default function ErrorNotOwner() {
  const { email } = useLoaderData<typeof loader>();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center">
            <Shield className="w-6 h-6 text-destructive" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl">No tienes acceso</CardTitle>
            <CardDescription>
              Solicita acceso o cambia a una cuenta con acceso.{" "}
              <a
                href="https://www.example.com"
                className="underline hover:no-underline text-primary"
                target="_blank"
                rel="noopener noreferrer"
              >
                Más información
              </a>
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Button className="w-full" size="lg">
              <Mail className="w-4 h-4 mr-2" />
              Solicitar acceso
            </Button>

            <Button variant="outline" className="w-full" size="lg" asChild>
              <Link to="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver a mi drive
              </Link>
            </Button>
          </div>

          <div className="pt-4 border-t">
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Has iniciado sesión como
              </p>
              <Badge variant="secondary" className="px-3 py-1">
                {email}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export const loader = asyncFlow(withProtection, async ({ user }) =>
  data({ email: user.email })
);
