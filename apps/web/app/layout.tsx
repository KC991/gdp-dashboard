import "./globals.css";
import React from "react";

export const metadata = {
  title: "3D Head Editor"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
