export const entityModel = [
  {
    table: 'legal_entities',
    title: 'Юрлица',
    description: 'Клиент или плательщик, к которому привязаны проекты и входящие оплаты.',
    fields: ['id', 'name', 'inn', 'ogrn', 'bankAccount', 'contactPerson']
  },
  {
    table: 'projects',
    title: 'Проекты',
    description: 'Направление работ агентства. Каждый проект принадлежит одному юрлицу.',
    fields: ['id', 'name', 'legalEntityId', 'status', 'owner', 'startedAt']
  },
  {
    table: 'payments',
    title: 'Оплаты',
    description: 'Факт поступления денег: сумма, дата, назначение, счет, договор и этап услуги.',
    fields: ['id', 'projectId', 'legalEntityId', 'paymentDate', 'amount', 'paymentPurpose', 'serviceStage', 'invoiceNumber', 'contractNumber', 'source']
  },
  {
    table: 'acts',
    title: 'Акты',
    description: 'Закрывающий документ по конкретной оплате. Статус оплаты вычисляется из этих полей.',
    fields: ['paymentId', 'isSent', 'sentAt', 'isSigned', 'signedAt', 'managerComment']
  }
];
