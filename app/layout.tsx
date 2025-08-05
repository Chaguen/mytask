import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { TodoProvider } from "@/contexts/TodoContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "Todo List App",
  description: "A simple and powerful todo list application with multi-level subtasks",
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TodoProvider>
            {children}
          </TodoProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
