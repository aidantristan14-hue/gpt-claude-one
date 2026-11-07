import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "One — GPT and Claude in one chat",
  description: "A chat app powered by GPT and Claude.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
