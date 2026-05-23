import { Component, ReactNode } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";

type ErrorBoundaryState = {
  hasError: boolean;
};

class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error("Application error:", error);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container flex min-h-[70vh] items-center justify-center py-16">
          <div className="max-w-xl text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <AlertTriangle className="h-8 w-8" />
            </div>
            <p className="mt-6 text-sm font-semibold uppercase tracking-wider text-primary">Something went wrong</p>
            <h1 className="mt-2 text-4xl font-bold text-foreground sm:text-5xl">We could not load this page</h1>
            <p className="mt-4 text-muted-foreground">
              Please refresh the page or return home. Our team can help if the issue continues.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button variant="brand" onClick={() => window.location.reload()}>
                <RefreshCw className="mr-2 h-4 w-4" /> Refresh
              </Button>
              <Button variant="outline" asChild>
                <Link to="/"><Home className="mr-2 h-4 w-4" /> Go home</Link>
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
}

export default ErrorBoundary;
