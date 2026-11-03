import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">TechStore</h3>
            <p className="text-gray-600">
              Uma plataforma de tecnologia com envios para todo o Brasil.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Links Úteis</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-600 hover:text-indigo-600 transition-colors">
                  Catálogo
                </Link>
              </li>
              <li>
                <Link href="/cart" className="text-gray-600 hover:text-indigo-600 transition-colors">
                  Carrinho
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Políticas</h4>
            <ul className="space-y-2">
              <li>
                <a 
                  href="https://mercadopago.com.br" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-indigo-600 transition-colors"
                >
                  Pagamento
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-6 pt-6 border-t border-gray-200 text-center text-xs text-gray-500">
          <p>&copy; {new Date().getFullYear()} TechStore. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}