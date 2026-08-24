import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") || requestHeaders.get("host") || "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") || (host.startsWith("localhost") ? "http" : "https");
  const imageUrl = `${protocol}://${host}/og.png`;

  return {
    title: "向北团队工作台｜排期与产能管理",
    description: "集中管理团队产能、成员排期、项目进度与风险提醒。",
    icons: {
      icon: "/favicon.svg",
      shortcut: "/favicon.svg",
    },
    openGraph: {
      title: "向北团队工作台",
      description: "让每个人看见目标、节奏与下一步。",
      images: [{ url: imageUrl, width: 1659, height: 948, alt: "向北团队工作台" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "向北团队工作台",
      description: "让每个人看见目标、节奏与下一步。",
      images: [imageUrl],
    },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
