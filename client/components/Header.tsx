import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { COMPANY_CONFIG, getWhatsAppUrl } from '../lib/companyConfig';

export default function Header() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { totalItems, hydrated } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-18">
          
          {/* Logo & Navigation */}
          <div className="flex items-center gap-6 lg:gap-10">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative w-9 h-9 sm:w-10 sm:h-10 shrink-0">
                <Image
                  src={COMPANY_CONFIG.logos.dark}
                  alt={COMPANY_CONFIG.name}
                  fill
                  sizes="40px"
                  className="object-contain"
                  priority
                />
              </div>
              <div className="flex flex-col">
                <span className="text-base sm:text-lg font-black tracking-wider text-neutral-950 uppercase leading-none">
                  {COMPANY_CONFIG.name}
                </span>
                <span className="text-[10px] uppercase tracking-widest text-neutral-500 font-semibold mt-0.5">
                  Eletrônica & Peças
                </span>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-6 text-xs lg:text-sm font-semibold text-neutral-700 uppercase tracking-wider">
              <Link
                href="/#manutencao"
                className={`transition-colors hover:text-neutral-950 py-1 ${
                  router.asPath.includes('#manutencao') ? 'text-neutral-950 border-b-2 border-neutral-950' : ''
                }`}
              >
                Manutenção
              </Link>
              <Link
                href="/#pecas"
                className={`transition-colors hover:text-neutral-950 py-1 ${
                  router.asPath.includes('#pecas') ? 'text-neutral-950 border-b-2 border-neutral-950' : ''
                }`}
              >
                Peças & Produtos
              </Link>
              <Link
                href="/#sobre"
                className={`transition-colors hover:text-neutral-950 py-1 ${
                  router.asPath.includes('#sobre') ? 'text-neutral-950 border-b-2 border-neutral-950' : ''
                }`}
              >
                Como Funciona
              </Link>
              {user && (
                <Link
                  href="/orders"
                  className={`transition-colors hover:text-neutral-950 py-1 ${
                    router.pathname === '/orders' ? 'text-neutral-950 font-bold border-b-2 border-neutral-950' : ''
                  }`}
                >
                  Meus Pedidos
                </Link>
              )}
              {user?.role === 'ADMIN' && (
                <Link
                  href="/admin"
                  className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-bold transition-colors ${
                    router.pathname.startsWith('/admin')
                      ? 'bg-neutral-950 text-white'
                      : 'bg-neutral-100 text-neutral-800 hover:bg-neutral-200'
                  }`}
                >
                  <span>Admin</span>
                </Link>
              )}
            </nav>
          </div>

          {/* User actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            
            {/* Quick WhatsApp Header Button */}
            <a
              href={getWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold tracking-wide uppercase rounded-md shadow-xs transition-colors"
              aria-label="Atendimento no WhatsApp"
            >
              <svg
                className="w-4 h-4 fill-current shrink-0"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M17.472 14.382c-.301-.15-1.78-.878-2.056-.979-.276-.101-.476-.15-.676.15-.2.301-.776.979-.952 1.18-.176.201-.351.226-.652.075-.301-.15-1.27-.468-2.42-1.493-.894-.798-1.498-1.783-1.674-2.084-.176-.301-.019-.464.132-.614.136-.135.301-.351.452-.527.15-.176.2-.301.3-.501.101-.2.05-.376-.025-.526-.075-.15-.676-1.629-.927-2.232-.244-.588-.492-.508-.676-.517-.175-.009-.376-.01-.577-.01-.2 0-.526.075-.802.376-.276.301-1.053 1.028-1.053 2.507s1.079 2.908 1.23 3.109c.15.2 2.122 3.24 5.141 4.544.718.31 1.279.496 1.716.635.722.23 1.378.198 1.898.12.579-.087 1.78-.727 2.03-1.429.25-.702.25-1.304.175-1.429-.075-.125-.276-.2-.577-.35zM12.04 2C6.51 2 2.023 6.486 2.023 12.016c0 1.936.554 3.743 1.517 5.275L2 22l4.858-1.503c1.474.887 3.208 1.394 5.182 1.394 5.53 0 10.017-4.486 10.017-10.015C22.057 6.486 17.57 2 12.04 2zm0 18.232c-1.714 0-3.307-.492-4.66-1.34l-.334-.209-2.87.888.89-2.795-.23-.365c-.958-1.52-1.464-3.29-1.464-5.11 0-4.57 3.718-8.288 8.288-8.288 4.57 0 8.288 3.718 8.288 8.288 0 4.57-3.718 8.288-8.288 8.288z" />
              </svg>
              <span>WhatsApp</span>
            </a>

            {/* Cart Link */}
            <Link
              href="/cart"
              className="relative p-2 text-neutral-800 hover:text-neutral-950 transition-colors flex items-center gap-1.5 font-medium text-xs uppercase"
              aria-label="Carrinho de Compras"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              <span className="hidden sm:inline">Carrinho</span>
              {hydrated && totalItems > 0 && (
                <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-black leading-none text-white bg-neutral-950 rounded-full">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* Auth */}
            {user ? (
              <div className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-neutral-200 text-xs">
                <span className="text-neutral-800 font-medium hidden lg:inline">
                  Olá, <span className="font-bold text-neutral-950">{user.name.split(' ')[0]}</span>
                </span>
                <button
                  onClick={handleLogout}
                  className="px-2.5 py-1.5 text-xs font-semibold text-neutral-600 hover:text-red-600 hover:bg-neutral-100 rounded-md transition-colors"
                >
                  Sair
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 pl-2 sm:pl-3 border-l border-neutral-200">
                <Link
                  href="/login"
                  className="px-2.5 py-1.5 text-xs font-semibold text-neutral-700 hover:text-neutral-950 transition-colors"
                >
                  Entrar
                </Link>
                <Link
                  href="/register"
                  className="hidden sm:inline-block px-3 py-1.5 text-xs font-semibold text-white bg-neutral-950 hover:bg-neutral-800 rounded-md transition-colors"
                >
                  Criar Conta
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-neutral-700 hover:text-neutral-950 rounded-md"
              aria-label="Abrir menu"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>

          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-neutral-200 space-y-3">
            <Link
              href="/#manutencao"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-semibold text-neutral-800 hover:bg-neutral-100 rounded-md"
            >
              Manutenção & Serviços
            </Link>
            <Link
              href="/#pecas"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-semibold text-neutral-800 hover:bg-neutral-100 rounded-md"
            >
              Peças & Produtos
            </Link>
            <Link
              href="/#sobre"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-semibold text-neutral-800 hover:bg-neutral-100 rounded-md"
            >
              Como Funciona
            </Link>
            {user && (
              <Link
                href="/orders"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm font-semibold text-neutral-800 hover:bg-neutral-100 rounded-md"
              >
                Meus Pedidos
              </Link>
            )}
            {user?.role === 'ADMIN' && (
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm font-bold text-neutral-950 bg-neutral-100 rounded-md"
              >
                Painel Administrativo
              </Link>
            )}
            <a
              href={getWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-emerald-600 text-white font-semibold text-sm rounded-md"
            >
              Falar no WhatsApp ({COMPANY_CONFIG.phoneDisplay})
            </a>
          </div>
        )}

      </div>
    </header>
  );
}
