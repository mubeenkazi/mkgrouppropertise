import { Link, NavLink, useNavigate } from "react-router-dom";
import { LogOut, Menu, Shield, User as UserIcon } from "lucide-react";
import logo from "@/assets/logo.png";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/", label: "Home" },
  { to: "/lands", label: "Lands" },
  { to: "/contact", label: "Contact" },
];

const Navbar = () => {
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const linkCls = ({ isActive }: { isActive: boolean }) =>
    cn(
      "px-3 py-2 text-sm font-medium transition-colors",
      isActive ? "text-primary" : "text-foreground/80 hover:text-primary",
    );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex min-w-0 items-center gap-2 text-primary">
          <img src={logo} alt="MK Group Properties logo" className="h-10 w-10 rounded-full object-contain" />
          <span className="truncate text-lg font-bold tracking-tight sm:text-xl">MK Group Properties</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {nav.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.to === "/"} className={linkCls}>
              {n.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <UserIcon className="h-4 w-4" />
                  {user.email?.split("@")[0]}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {isAdmin && (
                  <DropdownMenuItem onClick={() => navigate("/admin")}>
                    <Shield className="mr-2 h-4 w-4" /> Admin
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" /> Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate("/auth?mode=login")}>
                Login
              </Button>
              <Button variant="brand" size="sm" onClick={() => navigate("/auth?mode=signup")}>
                Sign Up
              </Button>
            </>
          )}
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72">
            <div className="flex flex-col gap-2 pt-8">
              {nav.map((n) => (
                <NavLink key={n.to} to={n.to} end={n.to === "/"} onClick={() => setOpen(false)} className={linkCls}>
                  {n.label}
                </NavLink>
              ))}
              <DropdownMenuSeparator />
              {user ? (
                <>
                  {isAdmin && (
                    <Button variant="outline" onClick={() => { navigate("/admin"); setOpen(false); }}>
                      <Shield className="mr-2 h-4 w-4" /> Admin
                    </Button>
                  )}
                  <Button variant="outline" onClick={() => { handleLogout(); setOpen(false); }}>
                    <LogOut className="mr-2 h-4 w-4" /> Log out
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" onClick={() => { navigate("/auth?mode=login"); setOpen(false); }}>Login</Button>
                  <Button variant="brand" onClick={() => { navigate("/auth?mode=signup"); setOpen(false); }}>Sign Up</Button>
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

export default Navbar;
