import { COMPANY_CONFIG, getWhatsAppUrl } from '../lib/companyConfig';

export default function ServicesGrid() {
  return (
    <section id="manutencao" className="py-16 bg-neutral-50 border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-neutral-500">
            Especialidades de Bancada
          </span>
          <h2 className="text-3xl font-extrabold text-neutral-950 mt-1">
            Serviços de Manutenção & Reparo Eletrônico
          </h2>
          <p className="text-neutral-600 mt-2 text-sm sm:text-base">
            Equipamentos de medição calibrados e técnicas avançadas para recuperar placas que muitas assistências condenam.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {COMPANY_CONFIG.services.map((service) => {
            const quoteUrl = getWhatsAppUrl(
              `Olá, MXM Maintenance! Gostaria de um orçamento para o serviço de *${service.name}*.`
            );

            return (
              <div
                key={service.id}
                className="group relative bg-white border border-neutral-200 rounded-xl p-6 hover:border-neutral-900 transition-all duration-200 flex flex-col justify-between shadow-xs hover:shadow-md"
              >
                <div>
                  {/* Service Icon */}
                  <div className="w-12 h-12 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-900 mb-5 group-hover:bg-neutral-950 group-hover:text-white transition-colors duration-200">
                    {service.id === 'placas' && (
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                      </svg>
                    )}
                    {service.id === 'tvs' && (
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    )}
                    {service.id === 'notebooks' && (
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    )}
                    {service.id === 'audio-fontes' && (
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-neutral-950 mb-2">
                    {service.name}
                  </h3>

                  <p className="text-sm text-neutral-600 leading-relaxed mb-6">
                    {service.description}
                  </p>
                </div>

                <a
                  href={quoteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-between w-full pt-4 border-t border-neutral-100 text-xs font-bold text-neutral-900 group-hover:text-emerald-600 transition-colors"
                >
                  <span>Orçar pelo WhatsApp</span>
                  <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </a>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
