import { useEffect } from "react";

const SITE_URL = "https://mkgroupproperties.in";

type SeoProps = {
  title: string;
  description: string;
  canonicalPath?: string;
  keywords?: string;
  schema?: object;
};

const setMeta = (selector: string, attr: "content" | "href", value: string) => {
  const element = document.head.querySelector(selector);
  if (element) element.setAttribute(attr, value);
};

const Seo = ({ title, description, canonicalPath = "/", keywords, schema }: SeoProps) => {
  useEffect(() => {
    const canonical = new URL(canonicalPath, SITE_URL).href;
    document.title = title;
    setMeta('meta[name="description"]', "content", description);
    if (keywords) setMeta('meta[name="keywords"]', "content", keywords);
    setMeta('link[rel="canonical"]', "href", canonical);
    setMeta('meta[property="og:url"]', "content", canonical);
    setMeta('meta[property="og:title"]', "content", title);
    setMeta('meta[property="og:description"]', "content", description);
    setMeta('meta[name="twitter:title"]', "content", title);
    setMeta('meta[name="twitter:description"]', "content", description);

    const id = "page-schema";
    document.getElementById(id)?.remove();
    if (schema) {
      const script = document.createElement("script");
      script.id = id;
      script.type = "application/ld+json";
      script.textContent = JSON.stringify(schema);
      document.head.appendChild(script);
    }

    return () => {
      document.getElementById(id)?.remove();
    };
  }, [title, description, canonicalPath, keywords, schema]);

  return null;
};

export default Seo;
export { SITE_URL };
