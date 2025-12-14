'use client';

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { FormProvider, useForm, SubmitHandler } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { register as registerUser } from "@/web/services/auth.api";
import { queryKeys } from "@/web/lib/queries";
import { TextField } from "@/web/components/forms/TextField";
import { Button } from "@/web/components/ui/button";
import { Card, CardContent } from "@/web/components/ui/card";
import { toast } from 'sonner';
import { NewUser, UserRole } from "@teamapp/api/schema";
import { signIn } from "@hono/auth-js/react";

type RegisterForm = NewUser;


function RegisterPage() {
  const navigate = useNavigate();
  const methods = useForm<RegisterForm>({
    defaultValues: { name: "", email: "", password: "", role: UserRole.FIGHTER },
  });

  const { handleSubmit, formState: { isSubmitting } } = methods; 

  const mutation = useMutation({
    mutationKey: queryKeys.auth.register.queryKey,
    mutationFn: (payload: RegisterForm) => registerUser(payload),
    onSuccess: () => {
      toast.success("הרשמה הצליחה! אתה מועבר לדף הבית.");
      navigate({ to: "/" });
    },
    onError: (e: any) => {
      toast.error((e as Error).message ?? "שגיאה ברישום משתמש");
    },
  });

  const onSubmit: SubmitHandler<RegisterForm> = (values) => {
    mutation.mutate(values);
  };

  return (
    <div className="mx-auto max-w-md p-6">
      <FormProvider {...methods}>
        <Card className="w-full">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Header */}
              <div className="border-b pb-3">
                <h3 className="font-semibold text-lg">צור חשבון</h3>
                <p className="text-xs text-muted-foreground">
                  הרשמה
                </p>
              </div>

              {/* Name Field */}
              <div className="space-y-2">
                <TextField
                  label="שם מלא"
                  name='name'
                />
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <TextField
                  label="Email"
                  type="email"
                  name='email'
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <TextField
                  label="סיסמה"
                  type="password"
                  name='password'
                />
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting || mutation.isPending}
                  className="w-full"
                >
                  {(isSubmitting || mutation.isPending) ? "רושם..." : "הרשם"}
                </Button>
              </div>
              <div>
                <Button type="button" variant={"ghost"} onClick={async () => {
                  await signIn("simplelogin", { callbackUrl: window.location.origin + "/#/home" });
                }}>
                  התחבר
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </FormProvider>
    </div>
  );
}

export const Route = createFileRoute("/auth/register")({
  component: RegisterPage,
});

