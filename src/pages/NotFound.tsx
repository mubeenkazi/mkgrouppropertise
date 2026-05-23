import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft, Home, MapPin, Search } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container flex min-h-[70vh] items-center justify-center py-16">
        <div className="max-w-2xl text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
            <MapPin className="h-10 w-10" />
          </div>
          <p className="mt-6 text-sm font-semibold uppercase tracking-wider text-primary">Page not found</p>
          <h1 className="mt-2 text-4xl font-bold text-foreground sm:text-6xl">This land page is not available</h1>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            The page may have moved, the listing may no longer be available, or the address may be incorrect.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button variant="brand" asChild>
              <Link to="/lands"><Search className="mr-2 h-4 w-4" /> Browse lands</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/"><Home className="mr-2 h-4 w-4" /> Go home</Link>
            </Button>
            <Button variant="ghost" onClick={() => window.history.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Go back
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NotFound;
