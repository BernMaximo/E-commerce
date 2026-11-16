import '../styles/globals.css';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import WhatsAppButton from '../components/WhatsAppButton';
import { COMPANY_CONFIG } from '../lib/companyConfig';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <CartProvider>
        <Head>
          <title>{`${COMPANY_CONFIG.name} - ${COMPANY_CONFIG.tagline}`}</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta
            name="description"
            content="Assistência Técnica Especializada em Eletrônica, reparo de placas, TVs, monitores, fontes e notebooks. Peças e componentes para reposição."
          />
        </Head>
        <div className="flex flex-col min-h-screen bg-white text-neutral-900">
          <Header />
          <main className="grow">
            <Component {...pageProps} />
          </main>
          <Footer />
          <WhatsAppButton />
        </div>
      </CartProvider>
    </AuthProvider>
  );
}
