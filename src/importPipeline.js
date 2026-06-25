export const bankStatementRows = [
  {
    id: 'bank-241',
    paymentDate: '2026-06-25',
    payerName: 'ООО "Аврора Медиа"',
    payerInn: '7701845120',
    amount: 55000,
    paymentPurpose: 'Оплата третьего этапа по договору 24-05: публикация, аналитика, формы',
    contractNumber: '24-05',
    invoiceNumber: 'СЧ-151'
  },
  {
    id: 'bank-242',
    paymentDate: '2026-06-25',
    payerName: 'ИП Кузнецов Роман Игоревич',
    payerInn: '540702881490',
    amount: 41000,
    paymentPurpose: 'SEO-сопровождение интернет-магазина за июль, договор 11-04',
    contractNumber: '11-04',
    invoiceNumber: 'СЧ-152'
  },
  {
    id: 'bank-243',
    paymentDate: '2026-06-25',
    payerName: 'ООО "Норд Сервис"',
    payerInn: '7816654321',
    amount: 62000,
    paymentPurpose: 'CRM-виджеты: настройка уведомлений, импорт лидов и тестирование релиза',
    contractNumber: '31-05',
    invoiceNumber: 'СЧ-153'
  }
];

const stageRules = [
  ['seo', 'SEO / июль'],
  ['публикац', 'Публикация и аналитика'],
  ['форм', 'Публикация и аналитика'],
  ['crm', 'Автоматизация лидов'],
  ['лид', 'Автоматизация лидов'],
  ['уведомлен', 'Автоматизация лидов']
];

export function normalizeBankRows(rows, projects, legalEntities) {
  const payments = [];
  const unresolvedRows = [];

  rows.forEach((row) => {
    const legalEntity = legalEntities.find(
      (entity) => entity.inn === row.payerInn || entity.name === row.payerName
    );
    const project = legalEntity
      ? projects.find((item) => item.legalEntityId === legalEntity.id)
      : null;

    if (!legalEntity || !project) {
      unresolvedRows.push(row);
      return;
    }

    payments.push({
      id: `pay-import-${row.id}`,
      projectId: project.id,
      legalEntityId: legalEntity.id,
      paymentDate: row.paymentDate,
      amount: row.amount,
      paymentPurpose: row.paymentPurpose,
      serviceStage: detectServiceStage(row.paymentPurpose),
      invoiceNumber: row.invoiceNumber,
      contractNumber: row.contractNumber,
      source: 'bank-pdf',
      act: {
        isSent: false,
        sentAt: '',
        isSigned: false,
        signedAt: '',
        managerComment: 'Импортировано из мок-выписки PDF. Нужно подготовить акт.'
      }
    });
  });

  return {
    payments,
    unresolvedRows,
    recognizedCount: payments.length,
    sourceName: 'mock-bank-statement.pdf'
  };
}

function detectServiceStage(text) {
  const normalized = text.toLowerCase();
  const match = stageRules.find(([needle]) => normalized.includes(needle));
  return match ? match[1] : 'Неразобранный этап';
}
