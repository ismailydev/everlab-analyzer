import { Toaster } from "sonner";
import { TanstackQueryProvider } from "@/providers/query-provider";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "HL7 Pathology Report Analyzer",
    template: "%s | HL7 Analyzer",
  },
  description: "Upload and analyze HL7/ORU files to identify high-risk results",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  ),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <TanstackQueryProvider>
          {children}
          <Toaster position="top-center" />
        </TanstackQueryProvider>
      </body>
    </html>
  );
}
