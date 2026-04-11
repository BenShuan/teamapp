import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { FormProvider, useForm, SubmitHandler } from "react-hook-form";
import { TextField } from "@/web/components/forms/TextField";
import { Button } from "@/web/components/ui/button";
import { Card, CardContent } from "@/web/components/ui/card";
import { toast } from "sonner";
import { signIn } from "@hono/auth-js/react";
import { useState } from "react";

type LoginForm = {
  email: string;
  password: string;
};

function LoginPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const methods = useForm<LoginForm>({
    defaultValues: { email: "", password: "" },
  });

  const { handleSubmit, formState: { isSubmitting } } = methods;

  const onSubmit: SubmitHandler<LoginForm> = async (values) => {
    setIsLoading(true);
    try {
      const res = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
      });

      if (res?.error) {
        toast.error("אימייל או סיסמה שגויים");
        return;
      }

      toast.success("התחברת בהצלחה!");
      navigate({ to: "/home"  });
    } catch {
      toast.error("שגיאה בהתחברות");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuth = async (provider: "github" | "google") => {
    await signIn(provider, {
      callbackUrl: window.location.origin + "/#/home",
    });
  };

  const pending = isSubmitting || isLoading;

  return (
    <div className="mx-auto max-w-md p-6">
      <FormProvider {...methods}>
        <Card className="w-full">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="border-b pb-3">
                <h3 className="font-semibold text-lg">התחברות</h3>
                <p className="text-xs text-muted-foreground">
                  היכנס לחשבון שלך
                </p>
              </div>

              <div className="space-y-2">
                <TextField label="Email" type="email" name="email" />
              </div>

              <div className="space-y-2">
                <TextField label="סיסמה" type="password" name="password" />
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={pending}
                  className="w-full"
                >
                  {pending ? "מתחבר..." : "התחבר"}
                </Button>
              </div>

              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">או</span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => handleOAuth("google")}
                >
                  התחבר עם Google
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => handleOAuth("github")}
                >
                  התחבר עם GitHub
                </Button>
              </div>

              <div className="text-center text-sm pt-2">
                <span className="text-muted-foreground">אין לך חשבון? </span>
                <Link to="/auth/register" className="underline font-medium">
                  הרשם
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </FormProvider>
    </div>
  );
}

export const Route = createFileRoute("/auth/login")({
  component: LoginPage,
});
