import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Footer } from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
    title: "Nossa Rewards",
    description:
        "Token Distribution Plan for Nossa Rewards (NRWD) - Transparent Treasury Management with Multi-Signature Control",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <Providers>
                    {children}
                    <Footer />
                </Providers>
            </body>
        </html>
    );
}
