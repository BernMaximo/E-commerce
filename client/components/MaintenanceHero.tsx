import { useState } from 'react';
import Image from 'next/image';
import { COMPANY_CONFIG, getWhatsAppUrl } from '../lib/companyConfig';

export default function MaintenanceHero() {
  const [selectedDevice, setSelectedDevice] = useState<string>(COMPANY_CONFIG.deviceTypes[0]);
  const [defectDetails, setDefectDetails] = useState<string>('');

  const generateQuoteUrl = () => {
    let msg = `Olá, equipe ${COMPANY_CONFIG.name}! Gostaria de um orçamento para manutenção de um(a) *${selectedDevice}*.`;
    if (defectDetails.trim()) {
      msg += `\nDefeito / Sintoma: ${defectDetails.trim()}`;
    }
    return getWhatsAppUrl(msg);
  };

  return (
    <section className="relative overflow-hidden bg-white border-b border-neutral-200">
      {/* Subtle minimalist grid background */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#000 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Headline and Positioning */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-100 border border-neutral-300 text-xs font-semibold tracking-wider uppercase text-neutral-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Bancada de Manutenção Aberta
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-neutral-950 leading-[1.1]">
              Eletrônica de precisão e reparo especializado.
            </h1>

            <p className="text-base sm:text-lg text-neutral-600 max-w-2xl leading-relaxed">
              Na <strong className="text-neutral-900 font-semibold">{COMPANY_CONFIG.name}</strong> realizamos diagnóstico avançado de microeletrônica, conserto de placas, reparo de TVs, monitores, fontes e computadores. Além disso, disponibilizamos componentes e peças para reposição.
            </p>

            {/* Quick Trust Badges */}
            <div className="pt-2 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs text-neutral-700">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-neutral-900 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Orçamento sem surpresas</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-neutral-900 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Bancada & Instrumentação</span>
              </div>
              <div className="flex items-center gap-2 col-span-2 sm:col-span-1">
                <svg className="w-4 h-4 text-neutral-900 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Garantia de bancada</span>
              </div>
            </div>

            {/* Quick anchors to navigate */}
            <div className="pt-2 flex flex-wrap gap-3">
              <a
                href="#orcamento"
                className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-white bg-neutral-950 hover:bg-neutral-800 rounded-md transition-colors"
              >
                Solicitar Manutenção
              </a>
              <a
                href="#pecas"
                className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-neutral-800 bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 rounded-md transition-colors"
              >
                Ver Peças & Componentes ↓
              </a>
            </div>
          </div>

          {/* Right Column: Instant WhatsApp Quote Card */}
          <div id="orcamento" className="lg:col-span-5">
            <div className="bg-neutral-50 rounded-2xl border border-neutral-300 p-6 sm:p-8 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
                <div>
                  <h3 className="text-lg font-bold text-neutral-950">Orçamento Rápido</h3>
                  <p className="text-xs text-neutral-500">Direcionamento direto para nossa bancada</p>
                </div>
                <div className="relative w-12 h-12 flex items-center justify-center bg-white rounded-lg border border-neutral-200 p-1">
                  <Image
                    src={COMPANY_CONFIG.logos.dark}
                    alt={COMPANY_CONFIG.name}
                    width={40}
                    height={40}
                    className="object-contain"
                  />
                </div>
              </div>

              <div className="mt-5 space-y-4">
                <div>
                  <label htmlFor="device-type-select" className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-2">
                    Tipo de Aparelho / Equipamento
                  </label>
                  <select
                    id="device-type-select"
                    value={selectedDevice}
                    onChange={(e) => setSelectedDevice(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-neutral-300 rounded-lg text-sm text-neutral-900 focus:outline-hidden focus:ring-2 focus:ring-neutral-950 focus:border-neutral-950 font-medium"
                  >
                    {COMPANY_CONFIG.deviceTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="defect-details-input" className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-2">
                    Qual o sintoma ou defeito? (Opcional)
                  </label>
                  <input
                    id="defect-details-input"
                    type="text"
                    placeholder="Ex: não dá sinal de vida, tela piscando, cheiro de queimado..."
                    value={defectDetails}
                    onChange={(e) => setDefectDetails(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-neutral-300 rounded-lg text-sm text-neutral-900 placeholder-neutral-400 focus:outline-hidden focus:ring-2 focus:ring-neutral-950 focus:border-neutral-950"
                  />
                </div>

                <div className="pt-2">
                  <a
                    href={generateQuoteUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2.5 px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold text-sm shadow-sm hover:shadow transition-all duration-200"
                  >
                    <svg
                      className="w-5 h-5 fill-current shrink-0"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M17.472 14.382c-.301-.15-1.78-.878-2.056-.979-.276-.101-.476-.15-.676.15-.2.301-.776.979-.952 1.18-.176.201-.351.226-.652.075-.301-.15-1.27-.468-2.42-1.493-.894-.798-1.498-1.783-1.674-2.084-.176-.301-.019-.464.132-.614.136-.135.301-.351.452-.527.15-.176.2-.301.3-.501.101-.2.05-.376-.025-.526-.075-.15-.676-1.629-.927-2.232-.244-.588-.492-.508-.676-.517-.175-.009-.376-.01-.577-.01-.2 0-.526.075-.802.376-.276.301-1.053 1.028-1.053 2.507s1.079 2.908 1.23 3.109c.15.2 2.122 3.24 5.141 4.544.718.31 1.279.496 1.716.635.722.23 1.378.198 1.898.12.579-.087 1.78-.727 2.03-1.429.25-.702.25-1.304.175-1.429-.075-.125-.276-.2-.577-.35zM12.04 2C6.51 2 2.023 6.486 2.023 12.016c0 1.936.554 3.743 1.517 5.275L2 22l4.858-1.503c1.474.887 3.208 1.394 5.182 1.394 5.53 0 10.017-4.486 10.017-10.015C22.057 6.486 17.57 2 12.04 2zm0 18.232c-1.714 0-3.307-.492-4.66-1.34l-.334-.209-2.87.888.89-2.795-.23-.365c-.958-1.52-1.464-3.29-1.464-5.11 0-4.57 3.718-8.288 8.288-8.288 4.57 0 8.288 3.718 8.288 8.288 0 4.57-3.718 8.288-8.288 8.288z" />
                    </svg>
                    <span>Falar no WhatsApp ({COMPANY_CONFIG.phoneDisplay})</span>
                  </a>
                </div>

                <p className="text-center text-[11px] text-neutral-500">
                  Atendimento direto com o técnico responsável. Retorno rápido.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
