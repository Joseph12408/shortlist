import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { ClerkProvider } from '@clerk/nextjs'
import { SubscriptionProvider } from "@/components/providers/subscription-provider";
import { ConvexClientProvider } from "@/components/providers/convex-provider";
import { StoreSyncProvider } from "@/components/providers/store-sync-provider";
import { Toaster } from "@/components/ui/toaster";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Shortlist | Build resumes that get you hired",
  description: "ATS-safe, modern, and effective resumes for early-career professionals.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&family=Outfit:wght@100..900&family=Merriweather:wght@300;400;700;900&family=Source+Sans+3:wght@200..900&display=swap" rel="stylesheet" />
          {/* Whop Pixel: tracks page views for Whop ads attribution. Must stay in <head> on every page.
              The script body below is Whop's snippet verbatim; do not edit it. */}
          <script
            id="whop-pixel"
            dangerouslySetInnerHTML={{
              __html: `!function(w,d,s,u,n,a,b){if(w[n])return;a=w[n]={q:[],t:+new Date,s:[],o:u,track:function(){a.q.push([+new Date].concat([].slice.call(arguments)))},setScope:function(){a.s=[].slice.call(arguments).filter(function(x){return typeof x==="string"});a.q.push([+new Date,"setScope"].concat(a.s))},scope:function(){var c=[].slice.call(arguments);return{track:function(){a.q.push([+new Date].concat([].slice.call(arguments)).concat([{__scope:c}]))}}}};b=d.createElement(s);b.async=1;b.src=u+"/s.js";d.getElementsByTagName(s)[0].parentNode.insertBefore(b,d.getElementsByTagName(s)[0])}(window,document,"script","https://t.whop.tw","whop");whop.setScope("biz_BDq1X9UDBXBCqb");whop.track("page");`,
            }}
          />
        </head>
        <body
          className={`font-sans antialiased bg-background text-foreground`}
          style={{
            fontFamily: "'Inter', sans-serif",
            // @ts-ignore
            "--font-outfit": "'Outfit', sans-serif"
          }}
        >
          <ConvexClientProvider>
            <StoreSyncProvider>
              <SubscriptionProvider>
                <Header />
                {children}
                <Toaster />
              </SubscriptionProvider>
            </StoreSyncProvider>
          </ConvexClientProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
