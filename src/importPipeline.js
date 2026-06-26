export const bankStatementRows = [
  {
    id: 'pdf-16-07-9142',
    paymentDate: '2026-07-16',
    payerName: 'ООО "Ледник-Старт"',
    payerInn: '514203851420',
    amount: 33000,
    paymentPurpose: 'Оплата за техническое сопровождение сайта по сч. № 742 от 09.07.2026 г. Без НДС.',
    contractNumber: 'б/н',
    invoiceNumber: '742'
  },
  {
    id: 'pdf-16-07-2387',
    paymentDate: '2026-07-16',
    payerName: 'ООО "Орбита-Промо"',
    payerInn: '717204674710',
    amount: 36400,
    paymentPurpose: 'Оплата по счету № 746 от 10.07.2026 г. за настройку и сопровождение Директа с 13.07 по 12.08. НДС не облагается.',
    contractNumber: 'б/н',
    invoiceNumber: '746'
  },
  {
    id: 'pdf-17-07-642',
    paymentDate: '2026-07-17',
    payerName: 'ООО "Сигма-Маркет"',
    payerInn: '717224571730',
    amount: 54400,
    paymentPurpose: 'Размещение объявлений на сервисе "Объявления" (этап 1) по счету № 733 от 14.07.2026 г. НДС не облагается.',
    contractNumber: 'б/н',
    invoiceNumber: '733'
  },
  {
    id: 'pdf-17-07-643',
    paymentDate: '2026-07-17',
    payerName: 'ООО "Сигма-Маркет"',
    payerInn: '717224571730',
    amount: 56300,
    paymentPurpose: 'Настройка и ведение кампании контекстной рекламы (этап 1) по счету № 734 от 14.07.2026 г. НДС не облагается.',
    contractNumber: 'б/н',
    invoiceNumber: '734'
  }
];

const stageRules = [
  ['техническое сопровождение', 'Техническое сопровождение'],
  ['директа', 'Контекстная реклама'],
  ['контекстной рекламы', 'Контекстная реклама'],
  ['объявлений', 'Размещение объявлений'],
  ['seo', 'SEO-продвижение'],
  ['разработку', 'Разработка сайта']
];

export function normalizeBankRows(rows, projects, legalEntities) {
  const payments = [];
  const unresolvedRows = [];
  const invalidRows = [];

  rows.forEach((row) => {
    const validationErrors = validateBankRow(row);

    if (validationErrors.length > 0) {
      invalidRows.push({ ...row, errors: validationErrors });
      return;
    }

    const legalEntity = resolveLegalEntity(row, legalEntities);
    const project = legalEntity
      ? projects.find((item) => item.legalEntityId === legalEntity.id)
      : null;

    if (!legalEntity || !project) {
      unresolvedRows.push({
        ...row,
        errors: [!legalEntity ? 'Юрлицо не найдено по ИНН/названию.' : 'Проект для юрлица не найден.']
      });
      return;
    }

    payments.push({
      id: `pay-import-${row.id}`,
      projectId: project.id,
      legalEntityId: legalEntity.id,
      paymentDate: row.paymentDate,
      amount: Number(row.amount),
      paymentPurpose: row.paymentPurpose.trim(),
      serviceStage: detectServiceStage(row.paymentPurpose),
      invoiceNumber: row.invoiceNumber || 'без счета',
      contractNumber: row.contractNumber || 'б/н',
      source: 'bank-pdf',
      act: {
        isSent: false,
        sentAt: '',
        isSigned: false,
        signedAt: '',
        managerComment: 'Импортировано из банковской PDF-выписки. Нужно подготовить акт.'
      }
    });
  });

  return {
    payments,
    unresolvedRows,
    invalidRows,
    recognizedCount: payments.length,
    sourceName: 'bank_statement_project_data_clean.pdf'
  };
}

export function validateBankRow(row) {
  const errors = [];
  const amount = Number(row.amount);
  const date = new Date(`${row.paymentDate}T12:00:00`);

  if (!row.id) errors.push('Нет уникального идентификатора операции.');
  if (!row.paymentDate || Number.isNaN(date.getTime())) errors.push('Некорректная дата операции.');
  if (!Number.isFinite(amount) || amount <= 0) errors.push('Сумма операции должна быть больше нуля.');
  if (!row.payerInn && !row.payerName) errors.push('Нет ИНН или названия плательщика.');
  if (!row.paymentPurpose || !row.paymentPurpose.trim()) errors.push('Нет назначения платежа.');

  return errors;
}

function resolveLegalEntity(row, legalEntities) {
  const payerName = row.payerName?.trim().toLowerCase();

  return legalEntities.find((entity) => {
    const sameInn = row.payerInn && entity.inn === row.payerInn;
    const sameName = payerName && entity.name.toLowerCase() === payerName;
    return sameInn || sameName;
  });
}

function detectServiceStage(text) {
  const normalized = text.toLowerCase();
  const match = stageRules.find(([needle]) => normalized.includes(needle));
  return match ? match[1] : 'Неразобранный этап';
}
