import Link from 'next/link';
import Image from 'next/image';
import { COMPANY_CONFIG, getWhatsAppUrl } from '../lib/companyConfig';

export default function Footer() {
  return (
    <footer className="bg-neutral-950 text-neutral-300 border-t border-neutral-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-sm">
          
          {/* Brand & About */}
          <div className="space-y-4 md:col-span-1">
            <div className="relative w-12 h-12">
              <Image
                src={COMPANY_CONFIG.logos.white}
                alt={COMPANY_CONFIG.name}
                fill
                sizes="48px"
                className="object-contain"
              />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-wide uppercase">
                {COMPANY_CONFIG.name}
              </h3>
              <p className="text-xs text-neutral-400 mt-1">
                Assistência Técnica Especializada em Eletrônica & Venda de Peças para Reposição.
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-3">
              Navegação
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/#manutencao" className="hover:text-white transition-colors">
                  Manutenção de Equipamentos
                </Link>
              </li>
              <li>
                <Link href="/#pecas" className="hover:text-white transition-colors">
                  Peças & Componentes
                </Link>
              </li>
              <li>
                <Link href="/#sobre" className="hover:text-white transition-colors">
                  Como Funciona
                </Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-white transition-colors">
                  Carrinho de Compras
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & WhatsApp */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-3">
              Contato & WhatsApp
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href={getWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-semibold transition-colors"
                >
                  <span>WhatsApp: {COMPANY_CONFIG.phoneDisplay}</span>
                </a>
              </li>
              <li className="text-neutral-400">
                Atendimento direto com os técnicos de bancada
              </li>
              <li className="text-neutral-400 pt-1">
                {COMPANY_CONFIG.address}
              </li>
            </ul>
          </div>

          {/* Business Hours & Warranty */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-3">
              Horário de Bancada
            </h4>
            <p className="text-xs text-neutral-400 leading-relaxed">
              {COMPANY_CONFIG.businessHours}
            </p>
            <div className="mt-4 pt-3 border-t border-neutral-800 text-[11px] text-neutral-500">
              Todos os reparos contam com garantia legal e nota técnica de bancada.
            </div>
          </div>

        </div>

        <div className="mt-12 pt-6 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-500 gap-4">
          <p>&copy; {new Date().getFullYear()} {COMPANY_CONFIG.name}. Todos os direitos reservados.</p>
          <p className="text-[11px]">Desenvolvido com foco em precisão eletrônica.</p>
        </div>
      </div>
    </footer>
  );
}
