import { useState } from 'react';
import { getWhatsAppUrl, COMPANY_CONFIG } from '../lib/companyConfig';

interface WhatsAppButtonProps {
  customMessage?: string;
}

export default function WhatsAppButton({ customMessage }: WhatsAppButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  const whatsappUrl = getWhatsAppUrl(customMessage);

  return (
    <aside aria-label="Atendimento via WhatsApp" className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
      {/* Tooltip / Label */}
      <div
        className={`hidden sm:flex items-center px-3.5 py-1.5 rounded-full bg-neutral-900 text-white text-xs font-medium shadow-lg transition-all duration-300 border border-neutral-700 pointer-events-none ${
          isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'
        }`}
      >
        <span>Orçamento via WhatsApp ({COMPANY_CONFIG.phoneDisplay})</span>
      </div>

      {/* Floating Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="group relative flex items-center justify-center w-14 h-14 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-hidden focus:ring-4 focus:ring-emerald-300"
        aria-label="Falar com a MXM Maintenance no WhatsApp"
      >
        {/* Pulse effect */}
        <span className="absolute -inset-1 rounded-full bg-emerald-500 opacity-30 group-hover:opacity-60 animate-ping" />

        {/* WhatsApp Icon */}
        <svg
          className="relative w-7 h-7 fill-current"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M17.472 14.382c-.301-.15-1.78-.878-2.056-.979-.276-.101-.476-.15-.676.15-.2.301-.776.979-.952 1.18-.176.201-.351.226-.652.075-.301-.15-1.27-.468-2.42-1.493-.894-.798-1.498-1.783-1.674-2.084-.176-.301-.019-.464.132-.614.136-.135.301-.351.452-.527.15-.176.2-.301.3-.501.101-.2.05-.376-.025-.526-.075-.15-.676-1.629-.927-2.232-.244-.588-.492-.508-.676-.517-.175-.009-.376-.01-.577-.01-.2 0-.526.075-.802.376-.276.301-1.053 1.028-1.053 2.507s1.079 2.908 1.23 3.109c.15.2 2.122 3.24 5.141 4.544.718.31 1.279.496 1.716.635.722.23 1.378.198 1.898.12.579-.087 1.78-.727 2.03-1.429.25-.702.25-1.304.175-1.429-.075-.125-.276-.2-.577-.35zM12.04 2C6.51 2 2.023 6.486 2.023 12.016c0 1.936.554 3.743 1.517 5.275L2 22l4.858-1.503c1.474.887 3.208 1.394 5.182 1.394 5.53 0 10.017-4.486 10.017-10.015C22.057 6.486 17.57 2 12.04 2zm0 18.232c-1.714 0-3.307-.492-4.66-1.34l-.334-.209-2.87.888.89-2.795-.23-.365c-.958-1.52-1.464-3.29-1.464-5.11 0-4.57 3.718-8.288 8.288-8.288 4.57 0 8.288 3.718 8.288 8.288 0 4.57-3.718 8.288-8.288 8.288z" />
        </svg>
      </a>
    </aside>
  );
}
