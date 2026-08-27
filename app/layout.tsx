import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TORRAS 拍剪协作台",
  description: "团队内容进度、拍摄需求与日区灵感共享协作工作台。",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
  openGraph: { title: "TORRAS 拍剪协作台", description: "内容进度 · 拍摄需求 · 日区灵感", type: "website" },
  twitter: { card: "summary", title: "TORRAS 拍剪协作台", description: "内容进度 · 拍摄需求 · 日区灵感" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body>{children}</body></html>;
}
