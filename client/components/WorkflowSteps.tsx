import { COMPANY_CONFIG, getWhatsAppUrl } from '../lib/companyConfig';

export default function WorkflowSteps() {
  const steps = [
    {
      step: '01',
      title: 'Envio ou Entrega',
      description: 'Traga o equipamento à nossa bancada ou envie com segurança após combinar no WhatsApp.',
    },
    {
      step: '02',
      title: 'Diagnóstico Técnico',
      description: 'Análise minuciosa com osciloscópio, multímetro e fontes de bancada para identificar o defeito real.',
    },
    {
      step: '03',
      title: 'Orçamento Transparente',
      description: 'Você recebe o relatório do defeito e o valor exato no WhatsApp antes de autorizar qualquer reparo.',
    },
    {
      step: '04',
      title: 'Conserto & Testes',
      description: 'Execução do reparo com componentes de qualidade, testes térmicos de estresse e garantia de serviço.',
    },
  ];

  return (
    <section id="sobre" className="py-16 bg-white border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-neutral-500">
              Processo de Atendimento
            </span>
            <h2 className="text-3xl font-extrabold text-neutral-950 mt-1">
              Como funciona a manutenção na {COMPANY_CONFIG.shortName}
            </h2>
          </div>
          <p className="text-neutral-500 text-sm mt-3 md:mt-0 max-w-md">
            Sem termos confusos ou peças trocadas desnecessariamente. Segurança e clareza do início ao fim.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((item, index) => (
            <div key={item.step} className="relative">
              {/* Step indicator */}
              <div className="text-4xl font-black text-neutral-200 mb-3 select-none">
                {item.step}
              </div>
              <h3 className="text-base font-bold text-neutral-950 mb-2">
                {item.title}
              </h3>
              <p className="text-sm text-neutral-600 leading-relaxed">
                {item.description}
              </p>
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-6 right-0 w-8 h-[1px] bg-neutral-200 translate-x-4" />
              )}
            </div>
          ))}
        </div>

        {/* CTA Banner inside Workflow */}
        <div className="mt-14 p-6 sm:p-8 bg-neutral-950 text-white rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-lg sm:text-xl font-bold">
              Tem uma placa ou aparelho parado precisando de conserto?
            </h3>
            <p className="text-sm text-neutral-400 mt-1">
              Fale diretamente com nossa bancada e tire suas dúvidas.
            </p>
          </div>
          <a
            href={getWhatsAppUrl('Olá, MXM Maintenance! Tenho um equipamento que gostaria de avaliar para conserto.')}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors"
          >
            Chamar no WhatsApp ({COMPANY_CONFIG.phoneDisplay})
          </a>
        </div>

      </div>
    </section>
  );
}
