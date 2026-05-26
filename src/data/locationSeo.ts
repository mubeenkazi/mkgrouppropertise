export type LocationSeo = {
  city: string;
  slug: string;
  region: string;
  intro: string;
  buyerIntent: string[];
  popularFor: string[];
  nearby: string[];
};

export const locationSeo: LocationSeo[] = [
  {
    city: "Mumbai",
    slug: "mumbai",
    region: "Maharashtra",
    intro: "Mumbai and the wider MMR region attract buyers looking for residential plots, redevelopment opportunities, highway-touch land, warehouse-ready parcels and long-term investment plots near expanding infrastructure corridors.",
    buyerIntent: ["land for sale in Mumbai", "plots near Mumbai", "investment land in Mumbai", "NA plots in MMR"],
    popularFor: ["Residential plots", "Commercial land", "Investment land", "Navi Mumbai and Thane growth corridors"],
    nearby: ["Navi Mumbai", "Thane", "Panvel", "Karjat", "Alibaug"],
  },
  {
    city: "Pune",
    slug: "pune",
    region: "Maharashtra",
    intro: "Pune is one of India's strongest land markets for buyers searching near IT parks, ring road development, education hubs, industrial belts and farmhouse-friendly outskirts.",
    buyerIntent: ["land for sale in Pune", "NA plots in Pune", "farmhouse land near Pune", "investment plots Pune"],
    popularFor: ["NA plots", "Farmhouse land", "Residential plots", "Ring road investment areas"],
    nearby: ["Hinjewadi", "Wagholi", "Talegaon", "Mulshi", "Lonavala"],
  },
  {
    city: "Dapoli",
    slug: "dapoli",
    region: "Maharashtra",
    intro: "Dapoli is a high-interest Konkan location for coastal land, farmhouse plots, second-home sites and long-term lifestyle investment properties with access to beaches, village roads and scenic surroundings.",
    buyerIntent: ["land for sale in Dapoli", "Dapoli plots", "coastal land in Dapoli", "farmhouse land Dapoli"],
    popularFor: ["Coastal land", "Farmhouse plots", "Second-home land", "Konkan investment properties"],
    nearby: ["Harnai", "Murud", "Ladghar", "Anjarle", "Karde"],
  },
  {
    city: "Goa",
    slug: "goa",
    region: "Goa",
    intro: "Goa land buyers often search for villa plots, resort-ready land, peaceful village parcels and lifestyle investment opportunities near beaches and tourism corridors.",
    buyerIntent: ["land for sale in Goa", "villa plots Goa", "investment land Goa", "coastal land Goa"],
    popularFor: ["Villa plots", "Resort land", "Village land", "Lifestyle investments"],
    nearby: ["North Goa", "South Goa", "Mapusa", "Margao", "Panaji"],
  },
  {
    city: "Navi Mumbai",
    slug: "navi-mumbai",
    region: "Maharashtra",
    intro: "Navi Mumbai and surrounding areas are searched by buyers tracking airport-led development, planned infrastructure, residential demand and commercial land growth.",
    buyerIntent: ["land for sale in Navi Mumbai", "plots in Navi Mumbai", "investment land near Navi Mumbai airport"],
    popularFor: ["Airport corridor plots", "Residential land", "Commercial land", "Long-term investment plots"],
    nearby: ["Panvel", "Ulwe", "Kharghar", "Taloja", "Uran"],
  },
  {
    city: "Thane",
    slug: "thane",
    region: "Maharashtra",
    intro: "Thane district offers search demand for residential plots, highway access land, second-home pockets and investment parcels around expanding Mumbai Metropolitan Region development.",
    buyerIntent: ["land for sale in Thane", "plots in Thane", "investment land Thane", "land near Mumbai"],
    popularFor: ["Residential plots", "Highway access land", "Investment parcels", "MMR growth areas"],
    nearby: ["Kalyan", "Dombivli", "Bhiwandi", "Murbad", "Shahapur"],
  },
  {
    city: "Ratnagiri",
    slug: "ratnagiri",
    region: "Maharashtra",
    intro: "Ratnagiri attracts buyers searching for Konkan land, coastal plots, farmhouse land and long-term property investments near beaches, village roads and scenic hills.",
    buyerIntent: ["land for sale in Ratnagiri", "Konkan land for sale", "coastal plots Ratnagiri", "farmhouse land Ratnagiri"],
    popularFor: ["Konkan land", "Coastal plots", "Farmhouse land", "Lifestyle investment"],
    nearby: ["Ganpatipule", "Chiplun", "Guhagar", "Sangameshwar", "Lanja"],
  },
  {
    city: "Nagpur",
    slug: "nagpur",
    region: "Maharashtra",
    intro: "Nagpur is a central India land market with demand for residential plots, logistics-linked land, industrial belt opportunities and long-term investment parcels.",
    buyerIntent: ["land for sale in Nagpur", "plots in Nagpur", "investment land Nagpur", "residential plots Nagpur"],
    popularFor: ["Residential plots", "Industrial land", "Logistics corridors", "Investment plots"],
    nearby: ["MIHAN", "Wardha Road", "Hingna", "Butibori", "Kamptee"],
  },
];

export const locationBySlug = Object.fromEntries(locationSeo.map((item) => [item.slug, item]));
