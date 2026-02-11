import './globals.css';
import Link from "next/link";

export const metadata = {
  title: 'Voom - Share Your Journey',
  description: 'Affordable and convenient ride sharing platform',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <header className="bg-blue-600 text-white py-4 shadow-md">
          <div className="container-main">
            <Link href="/" className="flex items-center gap-2">
            <img src="/voom_logo.png" alt="logo" title='Go to Home' id="logo" />
            {/* <h1 className="text-2xl font-bold m-0">Voom</h1> */}
            </Link>
          </div>
        </header>
        <main className="container-main py-8">
          {children}
        </main>
        <footer className="bg-gray-100 text-gray-600 py-6 mt-12 border-t">
          <div className="container-main text-center">
            <p>&copy; 2026 Voom. All rights reserved.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
