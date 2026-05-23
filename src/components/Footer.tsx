import { Mail, MapPin, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";

const Footer = () => (
  <footer className="mt-20 border-t border-border bg-card">
    <div className="container grid gap-10 py-14 md:grid-cols-4">
      <div>
        <div className="flex items-center gap-2 text-primary">
          <img src={logo} alt="MK Group Properties logo" className="h-10 w-10 rounded-full object-contain" />
          <span className="text-xl font-bold">MK Group Properties</span>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          Discover verified land, plots and investment opportunities across India.
        </p>
      </div>
      <div>
        <h3 className="text-sm font-semibold text-foreground">Explore</h3>
        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
          <li><Link to="/" className="hover:text-primary">Home</Link></li>
          <li><Link to="/lands" className="hover:text-primary">Lands</Link></li>
          <li><Link to="/contact" className="hover:text-primary">Contact</Link></li>
          <li><Link to="/terms-and-conditions" className="hover:text-primary">Terms &amp; Conditions</Link></li>
        </ul>
      </div>
      <div>
        <h3 className="text-sm font-semibold text-foreground">Contact</h3>
        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
          <li className="flex items-center gap-2"><Phone className="h-4 w-4" /> +91 9921552486</li>
          <li className="flex items-center gap-2"><Mail className="h-4 w-4" /> Mubeenkazi.mk@gmail.com</li>
          <li className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Maharashtra, Dapoli 415712, India</li>
        </ul>
      </div>
      <div>
        <h3 className="text-sm font-semibold text-foreground">Stay updated</h3>
        <p className="mt-3 text-sm text-muted-foreground">
          Browse without an account; sign in to contact sellers.
        </p>
      </div>
    </div>
    <div className="border-t border-border py-6 text-center text-sm text-muted-foreground">
      © {new Date().getFullYear()} MK Group Properties. All rights reserved.
    </div>
  </footer>
);

export default Footer;
