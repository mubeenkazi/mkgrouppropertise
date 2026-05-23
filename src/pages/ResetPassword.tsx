import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import PasswordInput from "@/components/PasswordInput";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";

const ResetPassword = () => {
  const navigate = useNavigate();
  const { updatePassword } = useAuth();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) return toast.error("Password must be at least 8 characters");
    if (password !== confirm) return toast.error("Passwords do not match");
    setBusy(true);
    const { error } = await updatePassword(password);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Password updated! Please log in.");
    navigate("/auth?mode=login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="container flex items-center justify-center py-12">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-[var(--shadow-elegant)]">
          <h1 className="text-3xl font-bold text-foreground">Set new password</h1>
          <p className="mt-1 text-muted-foreground">Choose a strong password for your account.</p>
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <Label htmlFor="np">New password</Label>
              <PasswordInput id="np" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="cp">Confirm password</Label>
              <PasswordInput id="cp" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
            </div>
            <Button type="submit" variant="brand" className="w-full" disabled={busy}>Update password</Button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default ResetPassword;
