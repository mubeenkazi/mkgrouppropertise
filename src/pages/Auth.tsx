import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";

const signupSchema = z.object({
  fullName: z.string().trim().min(2, "Name too short").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  password: z.string().min(8, "Password must be at least 8 characters").max(72),
});
const loginSchema = z.object({
  email: z.string().trim().email("Invalid email").max(255),
  password: z.string().min(1, "Password required").max(72),
});

const Auth = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { user, signIn, signUp, resetPassword } = useAuth();
  const redirect = params.get("redirect") || "/";
  const initialMode = params.get("mode") === "signup" ? "signup" : "login";
  const [tab, setTab] = useState<"login" | "signup">(initialMode);
  const [login, setLogin] = useState({ email: "", password: "" });
  const [signup, setSignup] = useState({ fullName: "", email: "", password: "" });
  const [busy, setBusy] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");

  const onForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return toast.error("Please enter your email");
    setBusy(true);
    const { error } = await resetPassword(forgotEmail.trim());
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Password reset request received. Please contact the site admin if you need help.");
    setForgotOpen(false);
    setForgotEmail("");
  };

  useEffect(() => {
    if (user) navigate(redirect, { replace: true });
  }, [user, navigate, redirect]);

  const onLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = loginSchema.safeParse(login);
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    setBusy(true);
    const { error } = await signIn(parsed.data.email, parsed.data.password);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Welcome back!");
  };

  const onSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = signupSchema.safeParse(signup);
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    setBusy(true);
    const { error } = await signUp(parsed.data.email, parsed.data.password, parsed.data.fullName);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Account created!");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="container flex items-center justify-center py-12">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-[var(--shadow-elegant)]">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground">Welcome to MK Group Properties</h1>
            <p className="mt-1 text-muted-foreground">Log in or create an account</p>
          </div>

          <Tabs value={tab} onValueChange={(v) => setTab(v as "login" | "signup")} className="mt-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={onLogin} className="mt-4 space-y-4">
                <div>
                  <Label htmlFor="l-email">Email</Label>
                  <Input id="l-email" type="email" value={login.email} onChange={(e) => setLogin({ ...login, email: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="l-pass">Password</Label>
                  <Input id="l-pass" type="password" value={login.password} onChange={(e) => setLogin({ ...login, password: e.target.value })} />
                </div>
                <div className="text-right">
                  <button type="button" onClick={() => { setForgotEmail(login.email); setForgotOpen(true); }} className="text-sm text-primary hover:underline">
                    Forgot password?
                  </button>
                </div>
                <Button type="submit" variant="brand" className="w-full" disabled={busy}>Login</Button>
              </form>

              {forgotOpen && (
                <form onSubmit={onForgot} className="mt-4 space-y-3 rounded-lg border border-border bg-muted/30 p-4">
                  <div>
                    <Label htmlFor="f-email">Reset password</Label>
                    <p className="text-xs text-muted-foreground mb-2">Enter your email to request a password reset.</p>
                    <Input id="f-email" type="email" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} placeholder="you@example.com" />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" variant="brand" className="flex-1" disabled={busy}>Send request</Button>
                    <Button type="button" variant="outline" onClick={() => setForgotOpen(false)}>Cancel</Button>
                  </div>
                </form>
              )}
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={onSignup} className="mt-4 space-y-4">
                <div>
                  <Label htmlFor="s-name">Full name</Label>
                  <Input id="s-name" value={signup.fullName} onChange={(e) => setSignup({ ...signup, fullName: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="s-email">Email</Label>
                  <Input id="s-email" type="email" value={signup.email} onChange={(e) => setSignup({ ...signup, email: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="s-pass">Password</Label>
                  <Input id="s-pass" type="password" value={signup.password} onChange={(e) => setSignup({ ...signup, password: e.target.value })} />
                  <p className="mt-1 text-xs text-muted-foreground">At least 8 characters.</p>
                </div>
                <Button type="submit" variant="brand" className="w-full" disabled={busy}>Create account</Button>
              </form>
            </TabsContent>
          </Tabs>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            By continuing you agree to our <Link to="/" className="underline">Terms</Link>.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Auth;
