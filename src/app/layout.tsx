import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DMD Zeiterfassung",
  description:
    "Modul zur Projektzeiterfassung und zum Projekt-Controlling – DMD Studio GmbH",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}