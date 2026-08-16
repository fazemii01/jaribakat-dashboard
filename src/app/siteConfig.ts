export const siteConfig = {
  name: "JariBakat CMS",
  url: "https://jaribakat.com",
  description: "Content Management System for JariBakat Landing Page",
  baseLinks: {
    overview: "/",
    banners: "/banners",
    programs: "/programs",
    events: "/events",
    registrations: "/registrations",
    topics: "/topics",
    videoCourses: "/video-courses",
    faqs: "/faqs",
    communities: "/communities",
    usps: "/usps",
    testimonials: "/testimonials",
    features: "/features",
    users: "/users",
    footer: "/footer",
    pages: "/pages",
    siteSettings: "/site-settings",
    settings: {
      audit: "/settings/audit",
      billing: "/settings/billing",
      users: "/settings/users",
    },
    login: "/login",
  },
};

export type siteConfig = typeof siteConfig;
