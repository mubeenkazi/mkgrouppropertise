import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Seo from "@/lib/seo";

const sections = [
  {
    title: "1. Introduction",
    text: "Welcome to MK Group Properties. These Terms and Conditions govern your access to and use of our website, property listings, enquiry services, and any future online payment or booking features offered through mkgroupproperties.in.",
  },
  {
    title: "2. Our Services",
    text: "MK Group Properties provides information about land, plots, and property opportunities, connects interested buyers with sellers or representatives, and may assist with property visits, documentation guidance, and transaction coordination. We do not guarantee that every listed property will remain available at all times.",
  },
  {
    title: "3. User Responsibility",
    text: "Users are responsible for providing accurate personal, contact, and enquiry details. Before making any purchase, booking, token payment, or final transaction, users should independently verify property title, ownership, approvals, location, measurements, pricing, taxes, and all legal documents.",
  },
  {
    title: "4. Property Information",
    text: "We aim to keep property details, images, videos, prices, and availability accurate and updated. However, property information may change without prior notice. Images and videos are for reference and presentation purposes, and actual site conditions may vary.",
  },
  {
    title: "5. Payments and Booking Amounts",
    text: "If online payment features are enabled in the future, payments may be collected for booking, consultation, site visit, documentation support, or other property-related services. Payment does not automatically confirm ownership or final sale unless a written agreement, receipt, or sale document clearly states so.",
  },
  {
    title: "6. Payment Gateway and Charges",
    text: "Online payments may be processed through third-party payment gateways, banks, UPI providers, card networks, or other payment partners. Users agree to follow the terms of those payment providers. Any gateway fees, taxes, bank charges, or transaction charges may be payable by the user unless stated otherwise.",
  },
  {
    title: "7. Cancellation and Refunds",
    text: "Refund eligibility depends on the nature of the payment and the written terms shared at the time of booking or transaction. Consultation fees, site visit fees, documentation support fees, payment gateway charges, and administrative charges may be non-refundable. Refunds, where approved, will be processed to the original payment method within a reasonable time after verification.",
  },
  {
    title: "8. Property Purchase and Legal Verification",
    text: "Any final property purchase must be completed only after proper due diligence and execution of legally valid documents between the buyer and seller. Users are advised to consult independent legal, financial, and property experts before completing any transaction.",
  },
  {
    title: "9. Account and Access",
    text: "Some features may require users to create an account or sign in. Users are responsible for keeping their account details secure and for all actions taken through their account.",
  },
  {
    title: "10. Prohibited Use",
    text: "Users must not misuse the website, submit false information, attempt unauthorized access, copy listings for fraudulent use, upload harmful files, or use the platform for illegal activities.",
  },
  {
    title: "11. Limitation of Liability",
    text: "MK Group Properties will not be liable for indirect losses, market changes, third-party actions, payment gateway failures, bank delays, document issues, or decisions made by users without proper verification. Our liability, if any, will be limited to the amount paid directly to us for the specific service in dispute.",
  },
  {
    title: "12. Third-Party Links and Services",
    text: "The website may include maps, videos, payment gateways, communication tools, or links operated by third parties. We are not responsible for third-party content, availability, policies, or service interruptions.",
  },
  {
    title: "13. Updates to These Terms",
    text: "We may update these Terms and Conditions from time to time to reflect business, legal, operational, or payment process changes. Continued use of the website after updates means you accept the revised terms.",
  },
  {
    title: "14. Governing Law and Disputes",
    text: "These terms are governed by the laws of India. Any dispute will first be attempted to be resolved through mutual discussion. If unresolved, disputes will be subject to the jurisdiction of competent courts in Maharashtra, India.",
  },
  {
    title: "15. Contact Information",
    text: "For questions about these Terms and Conditions, payments, cancellations, or refunds, contact MK Group Properties at Mubeenkazi.mk@gmail.com or +91 9921552486.",
  },
];

const Terms = () => (
  <div className="min-h-screen bg-background">
    <Seo
      title="Terms and Conditions | MK Group Properties"
      description="Read the terms and conditions for using MK Group Properties land listing, enquiry and property guidance services."
      canonicalPath="/terms-and-conditions"
    />
    <Navbar />
    <main className="container py-12">
      <div className="mx-auto max-w-4xl">
        <span className="text-sm font-semibold uppercase tracking-wider text-primary">Legal</span>
        <h1 className="mt-2 text-4xl font-bold text-foreground sm:text-5xl">Terms &amp; Conditions</h1>
        <p className="mt-4 text-muted-foreground">
          Last updated: May 24, 2026. Please read these terms carefully before using MK Group Properties services or making any future online payment through this website.
        </p>

        <div className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
          <p className="leading-relaxed text-foreground/80">
            By accessing this website, submitting an enquiry, creating an account, contacting a seller, booking a service, or making a payment, you agree to these Terms and Conditions.
          </p>
        </div>

        <div className="mt-8 space-y-6">
          {sections.map((section) => (
            <section key={section.title} className="rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
              <h2 className="text-xl font-semibold text-foreground">{section.title}</h2>
              <p className="mt-3 leading-relaxed text-muted-foreground">{section.text}</p>
            </section>
          ))}
        </div>
      </div>
    </main>
    <Footer />
  </div>
);

export default Terms;
