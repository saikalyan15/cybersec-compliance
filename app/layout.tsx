import { Inter } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Cybersec Compliance",
  description: "Cybersecurity Compliance Management System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <style>{`
          /* Hide Next.js badge and Turbopack indicator */
          #__next-build-watcher { display: none !important; }
          [data-nextjs-dialog-left-right] { display: none !important; }
          [data-next-hide] { display: none !important; }
        `}</style>
      </head>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
