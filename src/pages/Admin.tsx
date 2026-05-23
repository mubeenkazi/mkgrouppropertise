import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Pencil, Plus, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth } from "@/context/AuthContext";
import { Land, Seller, formatPrice } from "@/types/db";
import { api } from "@/lib/api";

const emptyLand = {
  title: "", description: "", price: "", square_feet: "", location: "",
  latitude: "", longitude: "", nearby_places: "", featured: false, seller_id: "",
  image_url: "", video_url: "",
};
const emptySeller = { name: "", phone: "", email: "", bio: "", rating: "5", photo_url: "" };

const Admin = () => {
  const { user, isAdmin, loading } = useAuth();
  const [lands, setLands] = useState<Land[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [landForm, setLandForm] = useState<typeof emptyLand>(emptyLand);
  const [editingLandId, setEditingLandId] = useState<string | null>(null);
  const [landOpen, setLandOpen] = useState(false);
  const [sellerForm, setSellerForm] = useState<typeof emptySeller>(emptySeller);
  const [editingSellerId, setEditingSellerId] = useState<string | null>(null);
  const [sellerOpen, setSellerOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  const refresh = async () => {
    const [l, s] = await Promise.all([
      api<Land[]>("/lands"),
      api<Seller[]>("/sellers"),
    ]);
    setLands(l ?? []);
    setSellers(s ?? []);
  };

  useEffect(() => { if (isAdmin) refresh(); }, [isAdmin]);

  if (loading) return null;
  if (!user) return <Navigate to="/auth?mode=login&redirect=/admin" replace />;
  if (!isAdmin) return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-20 text-center">
        <h1 className="text-3xl font-bold text-foreground">Admin access required</h1>
        <p className="mt-2 text-muted-foreground">Your account doesn't have admin privileges.</p>
      </div>
    </div>
  );

  const uploadImage = async (file: File, bucket: "land-images" | "seller-images") => {
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("bucket", bucket);
    try {
      const data = await api<{ url: string }>("/uploads", { method: "POST", body: formData });
      return data.url;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
      return null;
    } finally {
      setUploading(false);
    }
  };

  // ----- LAND HANDLERS -----
  const openNewLand = () => { setEditingLandId(null); setLandForm(emptyLand); setLandOpen(true); };
  const openEditLand = (l: Land) => {
    setEditingLandId(l.id);
    setLandForm({
      title: l.title,
      description: l.description ?? "",
      price: String(l.price),
      square_feet: String(l.square_feet),
      location: l.location,
      latitude: l.latitude?.toString() ?? "",
      longitude: l.longitude?.toString() ?? "",
      nearby_places: (l.nearby_places ?? []).join(", "),
      featured: !!l.featured,
      seller_id: l.seller_id ?? "",
      image_url: l.image_url ?? "",
      video_url: l.video_url ?? "",
    });
    setLandOpen(true);
  };

  const saveLand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!landForm.title || !landForm.price || !landForm.square_feet || !landForm.location) {
      return toast.error("Please fill required fields");
    }
    const payload = {
      title: landForm.title,
      description: landForm.description,
      price: Number(landForm.price),
      square_feet: Number(landForm.square_feet),
      location: landForm.location,
      latitude: landForm.latitude ? Number(landForm.latitude) : null,
      longitude: landForm.longitude ? Number(landForm.longitude) : null,
      nearby_places: landForm.nearby_places.split(",").map((s) => s.trim()).filter(Boolean),
      featured: landForm.featured,
      seller_id: landForm.seller_id || null,
      image_url: landForm.image_url || null,
      video_url: landForm.video_url || null,
    };
    try {
      if (editingLandId) await api(`/lands/${editingLandId}`, { method: "PUT", body: JSON.stringify(payload) });
      else await api("/lands", { method: "POST", body: JSON.stringify(payload) });
    } catch (error) {
      return toast.error(error instanceof Error ? error.message : "Save failed");
    }
    toast.success(editingLandId ? "Land updated" : "Land created");
    setLandOpen(false);
    refresh();
  };

  const deleteLand = async (id: string) => {
    if (!confirm("Delete this land?")) return;
    try {
      await api(`/lands/${id}`, { method: "DELETE" });
    } catch (error) {
      return toast.error(error instanceof Error ? error.message : "Delete failed");
    }
    toast.success("Deleted");
    refresh();
  };

  // ----- SELLER HANDLERS -----
  const openNewSeller = () => { setEditingSellerId(null); setSellerForm(emptySeller); setSellerOpen(true); };
  const openEditSeller = (s: Seller) => {
    setEditingSellerId(s.id);
    setSellerForm({
      name: s.name,
      phone: s.phone ?? "",
      email: s.email ?? "",
      bio: s.bio ?? "",
      rating: String(s.rating ?? 5),
      photo_url: s.photo_url ?? "",
    });
    setSellerOpen(true);
  };

  const saveSeller = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sellerForm.name) return toast.error("Name is required");
    const payload = {
      name: sellerForm.name,
      phone: sellerForm.phone || null,
      email: sellerForm.email || null,
      bio: sellerForm.bio || null,
      rating: sellerForm.rating ? Number(sellerForm.rating) : 5,
      photo_url: sellerForm.photo_url || null,
    };
    try {
      if (editingSellerId) await api(`/sellers/${editingSellerId}`, { method: "PUT", body: JSON.stringify(payload) });
      else await api("/sellers", { method: "POST", body: JSON.stringify(payload) });
    } catch (error) {
      return toast.error(error instanceof Error ? error.message : "Save failed");
    }
    toast.success(editingSellerId ? "Seller updated" : "Seller created");
    setSellerOpen(false);
    refresh();
  };

  const deleteSeller = async (id: string) => {
    if (!confirm("Delete this seller?")) return;
    try {
      await api(`/sellers/${id}`, { method: "DELETE" });
    } catch (error) {
      return toast.error(error instanceof Error ? error.message : "Delete failed");
    }
    toast.success("Deleted");
    refresh();
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="container py-10">
        <h1 className="text-4xl font-bold text-foreground">Admin dashboard</h1>
        <p className="mt-2 text-muted-foreground">Manage lands, sellers and featured listings.</p>

        <Tabs defaultValue="lands" className="mt-8">
          <TabsList>
            <TabsTrigger value="lands">Lands ({lands.length})</TabsTrigger>
            <TabsTrigger value="sellers">Sellers ({sellers.length})</TabsTrigger>
          </TabsList>

          {/* ---------------- LANDS ---------------- */}
          <TabsContent value="lands" className="mt-6">
            <div className="mb-4 flex justify-end">
              <Dialog open={landOpen} onOpenChange={setLandOpen}>
                <DialogTrigger asChild>
                  <Button variant="brand" onClick={openNewLand}><Plus className="mr-1 h-4 w-4" />Add land</Button>
                </DialogTrigger>
                <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{editingLandId ? "Edit land" : "Add land"}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={saveLand} className="space-y-3">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <Label>Title *</Label>
                        <Input value={landForm.title} onChange={(e) => setLandForm({ ...landForm, title: e.target.value })} />
                      </div>
                      <div className="sm:col-span-2">
                        <Label>Description</Label>
                        <Textarea rows={3} value={landForm.description} onChange={(e) => setLandForm({ ...landForm, description: e.target.value })} />
                      </div>
                      <div>
                        <Label>Price (USD) *</Label>
                        <Input type="number" value={landForm.price} onChange={(e) => setLandForm({ ...landForm, price: e.target.value })} />
                      </div>
                      <div>
                        <Label>Square feet *</Label>
                        <Input type="number" value={landForm.square_feet} onChange={(e) => setLandForm({ ...landForm, square_feet: e.target.value })} />
                      </div>
                      <div className="sm:col-span-2">
                        <Label>Location *</Label>
                        <Input value={landForm.location} onChange={(e) => setLandForm({ ...landForm, location: e.target.value })} />
                      </div>
                      <div>
                        <Label>Latitude</Label>
                        <Input value={landForm.latitude} onChange={(e) => setLandForm({ ...landForm, latitude: e.target.value })} />
                      </div>
                      <div>
                        <Label>Longitude</Label>
                        <Input value={landForm.longitude} onChange={(e) => setLandForm({ ...landForm, longitude: e.target.value })} />
                      </div>
                      <div className="sm:col-span-2">
                        <Label>Nearby places (comma-separated)</Label>
                        <Input value={landForm.nearby_places} onChange={(e) => setLandForm({ ...landForm, nearby_places: e.target.value })} placeholder="School, Market, Highway" />
                      </div>
                      <div className="sm:col-span-2">
                        <Label>Seller</Label>
                        <select
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          value={landForm.seller_id}
                          onChange={(e) => setLandForm({ ...landForm, seller_id: e.target.value })}
                        >
                          <option value="">— None —</option>
                          {sellers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                      </div>
                      <div className="sm:col-span-2">
                        <Label>Land image</Label>
                        <div className="flex items-center gap-3">
                          <Input type="file" accept="image/*" disabled={uploading}
                            onChange={async (e) => {
                              const f = e.target.files?.[0]; if (!f) return;
                              const url = await uploadImage(f, "land-images");
                              if (url) setLandForm({ ...landForm, image_url: url });
                            }} />
                          {landForm.image_url && <img src={landForm.image_url} alt="" className="h-12 w-16 rounded object-cover" />}
                        </div>
                      </div>
                      <div className="sm:col-span-2">
                        <Label>YouTube video URL</Label>
                        <Input
                          type="url"
                          placeholder="https://www.youtube.com/watch?v=..."
                          value={landForm.video_url}
                          onChange={(e) => setLandForm({ ...landForm, video_url: e.target.value })}
                        />
                        <p className="mt-1 text-xs text-muted-foreground">Paste a YouTube link. It will appear next to the land image.</p>
                      </div>
                      <div className="sm:col-span-2 flex items-center gap-3">
                        <Switch checked={landForm.featured} onCheckedChange={(v) => setLandForm({ ...landForm, featured: v })} />
                        <Label>Featured on homepage</Label>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit" variant="brand">{editingLandId ? "Update" : "Create"}</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-3">
              {lands.map((l) => (
                <div key={l.id} className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
                  <img src={l.image_url || "/placeholder.svg"} alt="" className="h-16 w-24 rounded object-cover" />
                  <div className="flex-1">
                    <div className="font-semibold text-foreground">{l.title} {l.featured && <span className="ml-1 text-xs text-[hsl(var(--gold))]">★ Featured</span>}</div>
                    <div className="text-sm text-muted-foreground">{l.location} · {l.square_feet.toLocaleString()} sq ft · {formatPrice(Number(l.price))}</div>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => openEditLand(l)}><Pencil className="h-4 w-4" /></Button>
                  <Button size="sm" variant="destructive" onClick={() => deleteLand(l.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              ))}
              {lands.length === 0 && <p className="text-center text-muted-foreground py-8">No lands yet. Add your first listing.</p>}
            </div>
          </TabsContent>

          {/* ---------------- SELLERS ---------------- */}
          <TabsContent value="sellers" className="mt-6">
            <div className="mb-4 flex justify-end">
              <Dialog open={sellerOpen} onOpenChange={setSellerOpen}>
                <DialogTrigger asChild>
                  <Button variant="brand" onClick={openNewSeller}><Plus className="mr-1 h-4 w-4" />Add seller</Button>
                </DialogTrigger>
                <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{editingSellerId ? "Edit seller" : "Add seller"}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={saveSeller} className="space-y-3">
                    <div>
                      <Label>Name *</Label>
                      <Input value={sellerForm.name} onChange={(e) => setSellerForm({ ...sellerForm, name: e.target.value })} />
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <Label>Phone</Label>
                        <Input value={sellerForm.phone} onChange={(e) => setSellerForm({ ...sellerForm, phone: e.target.value })} />
                      </div>
                      <div>
                        <Label>Email</Label>
                        <Input type="email" value={sellerForm.email} onChange={(e) => setSellerForm({ ...sellerForm, email: e.target.value })} />
                      </div>
                    </div>
                    <div>
                      <Label>Bio</Label>
                      <Textarea rows={3} value={sellerForm.bio} onChange={(e) => setSellerForm({ ...sellerForm, bio: e.target.value })} />
                    </div>
                    <div>
                      <Label>Rating (0-5)</Label>
                      <Input type="number" step="0.1" min="0" max="5" value={sellerForm.rating} onChange={(e) => setSellerForm({ ...sellerForm, rating: e.target.value })} />
                    </div>
                    <div>
                      <Label>Seller photo</Label>
                      <div className="flex items-center gap-3">
                        <Input type="file" accept="image/*" disabled={uploading}
                          onChange={async (e) => {
                            const f = e.target.files?.[0]; if (!f) return;
                            const url = await uploadImage(f, "seller-images");
                            if (url) setSellerForm({ ...sellerForm, photo_url: url });
                          }} />
                        {sellerForm.photo_url && <img src={sellerForm.photo_url} alt="" className="h-12 w-12 rounded-full object-cover" />}
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit" variant="brand">{editingSellerId ? "Update" : "Create"}</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-3">
              {sellers.map((s) => (
                <div key={s.id} className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
                  {s.photo_url ? (
                    <img src={s.photo_url} alt="" className="h-12 w-12 rounded-full object-cover" />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-secondary" />
                  )}
                  <div className="flex-1">
                    <div className="font-semibold text-foreground">{s.name}</div>
                    <div className="text-sm text-muted-foreground">{s.email ?? "—"} · {s.phone ?? "—"}</div>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => openEditSeller(s)}><Pencil className="h-4 w-4" /></Button>
                  <Button size="sm" variant="destructive" onClick={() => deleteSeller(s.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              ))}
              {sellers.length === 0 && <p className="text-center text-muted-foreground py-8">No sellers yet.</p>}
            </div>
          </TabsContent>
        </Tabs>
      </section>
      <Footer />
    </div>
  );
};

export default Admin;
