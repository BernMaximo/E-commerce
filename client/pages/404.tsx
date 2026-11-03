import Head from 'next/head';
import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function NotFoundPage() {
  return (
    <>
      <Head>
        <title>Página não encontrada - TechStore</title>
      </Head>

      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 max-w-md mx-auto px-4 py-12 text-center">
          <div className="space-y-4">
            <h1 className="text-6xl font-bold text-gray-200">404</h1>
            <h2 className="text-2xl font-semibold text-gray-900">
              Página não encontrada
            </h2>
            <p className="text-gray-600">
              A página que você procura não existe ou foi movida.
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-3 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
            >
              Voltar para a Home
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}