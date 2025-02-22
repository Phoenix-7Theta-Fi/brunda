import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Link from "next/link"
import { cn } from "@/lib/utils"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Stock Charts Journal",
  description: "A journal for your stock trading charts",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="border-b">
          <div className="container flex h-14 items-center px-4">
            <nav className="flex items-center space-x-4 lg:space-x-6">
              <Link
                href="/upload"
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary"
                )}
              >
                Upload
              </Link>
              <Link
                href="/gallery"
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary"
                )}
              >
                Gallery
              </Link>
            </nav>
          </div>
        </div>
        {children}
      </body>
    </html>
  )
}
