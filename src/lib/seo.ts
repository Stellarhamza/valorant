import seo from "@/config/seo.json";
import config from "@/config/config.json";

export const SITE_URL = seo.site_url.replace(/\/$/, "");
export const SITE_NAME = seo.site_name;
export const BRAND_DOMAIN = seo.brand_domain;
export const STORE_URL = seo.store_url;
export const DEFAULT_KEYWORDS = seo.default_keywords;

export function resolveCanonicalUrl(
  pathname: string,
  override?: string,
): string {
  const base = override ?? pathname;
  const url = new URL(base.startsWith("http") ? base : base || "/", SITE_URL);

  if (config.site.trailing_slash) {
    if (!url.pathname.endsWith("/")) {
      url.pathname = `${url.pathname}/`;
    }
    return url.href;
  }

  const isHome = url.pathname === "/" || url.pathname === "";
  if (isHome) {
    return SITE_URL;
  }

  url.pathname = url.pathname.replace(/\/$/, "");
  return url.href;
}

export function resolveOgImage(image?: string): string {
  const path = image || seo.default_og_image;
  return path.startsWith("http") ? path : `${SITE_URL}${path}`;
}

type FaqItem = { question: string; answer: string };

const organizationNode = {
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: BRAND_DOMAIN,
  url: SITE_URL,
  logo: {
    "@type": "ImageObject",
    url: `${SITE_URL}/images/logo.svg`,
  },
  email: config.params.footer_email,
};

const websiteNode = {
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  url: `${SITE_URL}/`,
  name: BRAND_DOMAIN,
  description: config.metadata.meta_description,
  inLanguage: "en-US",
  publisher: { "@id": `${SITE_URL}/#organization` },
};

export function getPageStructuredData(
  canonicalPath: string,
  pageTitle: string,
  description: string,
  breadcrumbLabel?: string,
) {
  const pageUrl = resolveCanonicalUrl(canonicalPath);
  const graph: Record<string, unknown>[] = [
    websiteNode,
    organizationNode,
    {
      "@type": "WebPage",
      "@id": `${pageUrl}#webpage`,
      url: pageUrl,
      name: pageTitle,
      description,
      isPartOf: { "@id": `${SITE_URL}/#website` },
      about: {
        "@type": "VideoGame",
        name: "Overwatch 2",
      },
      inLanguage: "en-US",
    },
  ];

  if (breadcrumbLabel && canonicalPath !== "/") {
    graph.push({
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: SITE_URL,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: breadcrumbLabel,
          item: pageUrl,
        },
      ],
    });
  }

  return {
    "@context": "https://schema.org",
    "@graph": graph,
  };
}

export function getHomepageStructuredData(
  description: string,
  faqItems: FaqItem[] = [],
) {
  const graph: Record<string, unknown>[] = [
    websiteNode,
    organizationNode,
    {
      "@type": "WebPage",
      "@id": `${SITE_URL}/#webpage`,
      url: SITE_URL,
      name: seo.homepage.meta_title,
      description,
      isPartOf: { "@id": `${SITE_URL}/#website` },
      about: {
        "@type": "VideoGame",
        name: "Overwatch 2",
        gamePlatform: "https://schema.org/PCPlatform",
      },
      inLanguage: "en-US",
    },
    {
      "@type": "SoftwareApplication",
      name: "Overwatch 2 ESP",
      applicationCategory: "GameApplication",
      operatingSystem: "Windows 10, Windows 11",
      description,
      offers: {
        "@type": "Offer",
        url: STORE_URL,
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
        seller: { "@id": `${SITE_URL}/#organization` },
      },
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
  ];

  if (faqItems.length > 0) {
    graph.push({
      "@type": "FAQPage",
      "@id": `${SITE_URL}/#faq`,
      mainEntity: faqItems.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      })),
    });
  }

  return {
    "@context": "https://schema.org",
    "@graph": graph,
  };
}

type BlogArticleInput = {
  title: string;
  description: string;
  urlPath: string;
  date?: Date;
  image?: string;
  author?: string;
  video?: string;
};

export function getBlogArticleStructuredData({
  title,
  description,
  urlPath,
  date,
  image,
  author = BRAND_DOMAIN,
  video,
}: BlogArticleInput) {
  const pageUrl = resolveCanonicalUrl(
    urlPath.startsWith("/") ? urlPath : `/${urlPath}`,
  );
  const graph: Record<string, unknown>[] = [
    organizationNode,
    {
      "@type": "BlogPosting",
      "@id": `${pageUrl}#article`,
      headline: title,
      description,
      url: pageUrl,
      datePublished: date?.toISOString(),
      dateModified: date?.toISOString(),
      author: {
        "@type": "Organization",
        name: author,
        url: SITE_URL,
      },
      publisher: organizationNode,
      image: image ? resolveOgImage(image) : resolveOgImage(),
      inLanguage: "en-US",
      isPartOf: {
        "@type": "Blog",
        "@id": `${resolveCanonicalUrl("/blog")}#blog`,
        name: `${BRAND_DOMAIN} — Overwatch 2 guides`,
        url: resolveCanonicalUrl("/blog"),
      },
      about: {
        "@type": "VideoGame",
        name: "Overwatch 2",
      },
      keywords: DEFAULT_KEYWORDS,
    },
  ];

  if (video) {
    graph.push({
      "@type": "VideoObject",
      name: title,
      description,
      contentUrl: video,
      embedUrl: video,
      uploadDate: date?.toISOString(),
      inLanguage: "en-US",
    });
  }

  return {
    "@context": "https://schema.org",
    "@graph": graph,
  };
}
