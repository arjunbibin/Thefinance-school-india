import type {Metadata} from 'next';
import './globals.css';
import { FirebaseClientProvider } from '@/firebase';

export const metadata: Metadata = {
  metadataBase: new URL('https://finance-school-india.web.app'),
  title: {
    default: "The Finance School India - Let's Deal with The Wealth",
    template: "%s | The Finance School India"
  },
  description: "Empowering students and working professionals in wealth management, practical investing, fraud prevention, and thinking like a CEO. Build your financial future.",
  keywords: ["financial education", "wealth management", "investing for students", "financial literacy India", "avoid financial scams", "think like a ceo"],
  openGraph: {
    title: "The Finance School India",
    description: "Empowering students and working professionals in wealth management, practical investing, fraud prevention, and thinking like a CEO.",
    url: 'https://finance-school-india.web.app',
    siteName: 'The Finance School India',
    locale: 'en_IN',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-background text-foreground selection:bg-accent selection:text-accent-foreground">
        <FirebaseClientProvider>
          {children}
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
