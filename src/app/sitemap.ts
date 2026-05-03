// clientside/src/app/sitemap.ts
// Next.js automatically serves this as /sitemap.xml
// Submit this URL to Google Search Console.

import { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://acadedesk.com";

// Blog posts — add a new entry for each post you publish
const BLOG_POSTS = [
  { slug: "eng-16-repeat-year-automation", date: "2025-01-15" },
  { slug: "senate-report-automation-guide", date: "2025-02-10" },
  { slug: "eng-13-supplementary-threshold", date: "2025-03-05" },
  { slug: "carry-forward-units-explained", date: "2025-04-01" },
  { slug: "board-of-examiners-cms-export", date: "2025-04-20" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1.0,
    },
    {
      url: `${BASE}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE}/pricing`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  const blogPages: MetadataRoute.Sitemap = BLOG_POSTS.map((post) => ({
    url: `${BASE}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "yearly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...blogPages];
}
