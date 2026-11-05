/**
 * Base de Dados Estruturada de Políticas e Controles de Segurança da Informação
 * Alinhada com a ISO/IEC 27001 (Anexos A.8, A.9, A.10, A.11, A.12, A.14, A.15) e LGPD (Lei 13.709/2018)
 */

const sectorsData = [
  {
    id: "ensino-pesquisa",
    name: "Setor Ensino e Pesquisa",
    icon: "GraduationCap",
    color: "from-blue-600 to-indigo-700",
    badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
    description: "Gestão do acesso ao residentes, estudantes de medicina, estudantes de enfermagem, estagiários.",
    manager: "Coordenação de Ensino, Pesquisa & Extensão",
    frameworks: ["ISO 27001 (A.9, A.12)", "LGPD (Art. 7º, 14)"],
    metrics: {
      totalControls: 2,
      compliant: 2,
      inProgress: 0,
      riskLevel: "Baixo"
    },
    controls: [
      {
        id: "EP-01",
        title: "Privilégios de Acesso",
        standard: "ISO 27001",
        annexOrArticle: "Anexo A.9.1 / A.9.2",
        objective: "Garantir que os estudantes possuam acesso estritamente baseado no princípio do menor privilégio.",
        description: "Garantir que os estudantes possuam acesso estritamente baseado no princípio do menor privilégio.",
        technicalMeasures: [
          "Revisão periódica semestral de permissões"
        ],
        riskMitigated: "",
        criticality: "Alta",
        status: "Conforme"
      },
      {
        id: "EP-02",
        title: "Proteção de Dados e Sigilo de Pacientes",
        standard: "ISO 27001",
        annexOrArticle: "Anexo A.18.1.4",
        objective: "Garantir que estudantes tenham acesso às informações clínicas somente quando necessário para suas atividades acadêmicas e assistenciais.",
        description: "Garantir que estudantes tenham acesso às informações clínicas somente quando necessário para suas atividades acadêmicas e assistenciais.",
        technicalMeasures: [
          "Proibição de fotografar, copiar ou compartilhar informações de pacientes"
        ],
        riskMitigated: "",
        criticality: "Crítica",
        status: "Conforme"
      }
    ]
  },
  {
    id: "compras-fornecedores",
    name: "Setor de Compras e Fornecedores",
    icon: "Truck",
    color: "from-amber-600 to-orange-700",
    badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
    description: "Gestão de fornecedores, riscos de terceiros, homologação e conformidade.",
    manager: "Gerência de Suprimentos",
    frameworks: ["ISO 27001 (Anexo A.15)", "LGPD (Art. 33-36, 39)"],
    metrics: {
      totalControls: 2,
      compliant: 2,
      inProgress: 0,
      riskLevel: "Baixo"
    },
    controls: [
      {
        id: "CF-01",
        title: "Política de Segurança no Relacionamento com Fornecedores",
        standard: "ISO 27001",
        annexOrArticle: "Anexo A.15.1",
        objective: "Definir requisitos mínimos de cibersegurança antes da contratação de fornecedores.",
        description: "Definir requisitos mínimos de cibersegurança antes da contratação de fornecedores.",
        technicalMeasures: [
          "Matriz de risco pré-contratual avaliando maturidade de segurança e certificações (ex: ISO 27001, SOC 2)."
        ],
        riskMitigated: "",
        criticality: "Alta",
        status: "Conforme"
      },
      {
        id: "CF-02",
        title: "Gestão e Monitoramento de Entregas e SLAs de Segurança",
        standard: "ISO 27001",
        annexOrArticle: "Anexo A.15.2",
        objective: "Supervisionar a conformidade contínua dos parceiros tecnológicos e prestadores de serviços terceirizados.",
        description: "Supervisionar a conformidade contínua dos parceiros tecnológicos e prestadores de serviços terceirizados.",
        technicalMeasures: [
          "Desativação automática de contas temporárias após janela de manutenção acordada."
        ],
        riskMitigated: "",
        criticality: "Alta",
        status: "Conforme"
      }
    ]
  },
  {
    id: "ceop-cirurgico",
    name: "Setor Centro Cirúrgico",
    icon: "HeartPulse",
    color: "from-rose-600 to-red-800",
    badgeColor: "bg-rose-50 text-rose-700 border-rose-200",
    description: "Proteção rigorosa de dados de saúde e sigilo médico.",
    manager: "Diretoria Médica",
    frameworks: ["LGPD (Art. 5º, II; Art. 11)", "ISO 27001 (A.9, A.10, A.11)"],
    metrics: {
      totalControls: 2,
      compliant: 2,
      inProgress: 0,
      riskLevel: "Baixo"
    },
    controls: [
      {
        id: "CC-01",
        title: "Tratamento de Dados Pessoais Sensíveis de Saúde",
        standard: "LGPD",
        annexOrArticle: "Art. 5º, II & Art. 11",
        objective: "Assegurar que informações de saúde, exames diagnósticos e históricos clínicos sejam tratados sob rigorosa base legal.",
        description: "Assegurar que informações de saúde, exames diagnósticos e históricos clínicos sejam tratados sob rigorosa base legal.",
        technicalMeasures: [
          "Treinamento mandatório semestral de sigilo profissional para equipes de enfermagem e corpo médico."
        ],
        riskMitigated: "",
        criticality: "Crítica",
        status: "Conforme"
      },
      {
        id: "CC-02",
        title: "Trilha de Auditoria Imutável e Rastreabilidade de Prontuários",
        standard: "ISO 27001",
        annexOrArticle: "Anexo A.12.4",
        objective: "Garantir a não-repúdio e auditoria de quem acessou, modificou ou exportou prontuários e registros cirúrgicos.",
        description: "Garantir a não-repúdio e auditoria de quem acessou, modificou ou exportou prontuários e registros cirúrgicos.",
        technicalMeasures: [
          "Exportação contínua de logs no formato Syslog RFC 5424 para repositório blindado com retenção mínima de 5 anos."
        ],
        riskMitigated: "",
        criticality: "Crítica",
        status: "Conforme"
      }
    ]
  },
  {
    id: "almoxarifado-suprimentos",
    name: "Setor Almoxarifado e Suprimentos",
    icon: "Boxes",
    color: "from-teal-600 to-emerald-800",
    badgeColor: "bg-teal-50 text-teal-700 border-teal-200",
    description: "Controle patrimonial físico e lógico de ativos de TI, custódia e inventário de equipamentos/insumos, descarte seguro de mídias e cadeia de rastreabilidade.",
    manager: "Gerência de Logística",
    frameworks: ["ISO 27001 (A.8, A.11)", "LGPD (Art. 6º)"],
    metrics: {
      totalControls: 2,
      compliant: 2,
      inProgress: 0,
      riskLevel: "Baixo"
    },
    controls: [
      {
        id: "ALM-01",
        title: "Inventário Físico e Classificação de Ativos de Informação e TI",
        standard: "ISO 27001",
        annexOrArticle: "Anexo A.8.1",
        objective: "Catalogar, etiquetar e manter rigorosamente inventariado todos os ativos.",
        description: "Catalogar, etiquetar e manter rigorosamente inventariado todos os ativos.",
        technicalMeasures: [
          "Termo de Responsabilidade e Guarda de Equipamento (Carga Patrimonial) compulsório para cada entrega de dispositivo."
        ],
        riskMitigated: "",
        criticality: "Alta",
        status: "Conforme"
      },
      {
        id: "ALM-02",
        title: "Procedimento Seguro de Descarte e Sanitização de Equipamentos e Mídias",
        standard: "ISO 27001",
        annexOrArticle: "Anexo A.8.3",
        objective: "Impedir a recuperação residual de dados corporativos ou hospitalares",
        description: "Impedir a recuperação residual de dados corporativos ou hospitalares",
        technicalMeasures: [
          "Emissão obrigatória de Certificado de Destruição Segura com número de série e assinatura do responsável técnico."
        ],
        riskMitigated: "",
        criticality: "Crítica",
        status: "Conforme"
      }
    ]
  },
  {
    id: "faturamento-financeiro",
    name: "Setor Faturamento e Financeiro",
    icon: "Receipt",
    color: "from-emerald-600 to-cyan-800",
    badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    description: "Segurança dos dados Financeiro.",
    manager: "Gerência Financeira",
    frameworks: ["ISO 27001 (A.10, A.12, A.14)", "LGPD (Art. 6º, 16)"],
    metrics: {
      totalControls: 2,
      compliant: 2,
      inProgress: 0,
      riskLevel: "Baixo"
    },
    controls: [
      {
        id: "FAT-01",
        title: "Segregação de Funções",
        standard: "ISO 27001",
        annexOrArticle: "Anexo A.14.1 / A.14.2",
        objective: "Prevenir fraudes internas e desvios de recursos financeiros aplicando divisão estrita de responsabilidades no ERP.",
        description: "Prevenir fraudes internas e desvios de recursos financeiros aplicando divisão estrita de responsabilidades no ERP.",
        technicalMeasures: [
          "Perfis e permissões matriciais estritamente segregados no ERP corporativo (SAP/Protheus), auditados bimestralmente."
        ],
        riskMitigated: "",
        criticality: "Crítica",
        status: "Conforme"
      },
      {
        id: "FAT-02",
        title: "Minimização, Retenção Segura e Descarte de Dados",
        standard: "LGPD",
        annexOrArticle: "Art. 6º",
        objective: "Garantir a retenção e o descarte seguro dos dados pelo prazo legal.",
        description: "Garantir a retenção e o descarte seguro dos dados pelo prazo legal.",
        technicalMeasures: [
          "Mascaramento de dígitos de CPF/CNPJ e dados bancários"
        ],
        riskMitigated: "",
        criticality: "Alta",
        status: "Conforme"
      }
    ]
  }
];

module.exports = { sectorsData };
