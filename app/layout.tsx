import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "内容团队排期与产能看板",
  description: "内容团队本周工作安排、产出规划、成员排期与需求承接情况看板。",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body>{children}</body></html>;
}
