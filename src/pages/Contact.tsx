import { useState } from "react";
import { Navigate } from "react-router-dom";
import { Mail, MapPin, Phone } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";

const schema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  message: z.string().trim().min(10, "Message is too short").max(2000),
});

const Contact = () => {
  const { user, loading } = useAuth();
  
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  if (loading) return null;
  if (!user) return <Navigate to="/auth?mode=login&redirect=/contact" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setSubmitting(true);
    try {
      await api("/contact-messages", {
        method: "POST",
        body: JSON.stringify({
          name: parsed.data.name,
          email: parsed.data.email,
          message: parsed.data.message,
        }),
      });
    } catch (error) {
      setSubmitting(false);
      return toast.error(error instanceof Error ? error.message : "Message failed");
    }
    setSubmitting(false);
    toast.success("Message sent! We'll get back to you soon.");
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="container py-12">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-bold text-foreground">Get in touch</h1>
          <p className="mt-2 text-muted-foreground">We'd love to hear from you. Reach out for inquiries or site visits.</p>
        </div>

        <div className="mx-auto mt-12 grid max-w-5xl gap-8 lg:grid-cols-2">
          <div className="space-y-4">
            {[
              { icon: Phone, title: "Phone", value: "+91 9921552486" },
              { icon: Mail, title: "Email", value: "Mubeenkazi.mk@gmail.com" },
              { icon: MapPin, title: "Office", value: "Maharashtra, Dapoli 415712, India" },
            ].map(({ icon: Icon, title, value }) => (
              <div key={title} className="flex gap-4 rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
                <Icon className="h-6 w-6 shrink-0 text-primary" />
                <div>
                  <p className="font-semibold text-foreground">{title}</p>
                  <p className="text-muted-foreground">{value}</p>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} maxLength={100} />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} maxLength={255} />
            </div>
            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea id="message" rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} maxLength={2000} />
            </div>
            <Button type="submit" variant="brand" className="w-full" disabled={submitting}>
              {submitting ? "Sending..." : "Send message"}
            </Button>
          </form>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Contact;
