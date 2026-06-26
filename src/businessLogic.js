const ATTENTION_AFTER_DAYS = 10;
const today = new Date('2026-08-14T12:00:00');

export function formatMoney(value) {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0
  }).format(value);
}

export function formatDate(date) {
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(new Date(`${date}T12:00:00`));
}

export function daysSince(date) {
  const created = new Date(`${date}T12:00:00`);
  return Math.max(0, Math.floor((today - created) / 86400000));
}

export function getActStatus(payment) {
  const age = daysSince(payment.paymentDate);

  if (payment.act.isSent && payment.act.isSigned) {
    return {
      key: 'closed',
      label: 'Закрыт',
      tone: 'green',
      rank: 4
    };
  }

  if (age > ATTENTION_AFTER_DAYS && (!payment.act.isSent || !payment.act.isSigned)) {
    return {
      key: 'attention',
      label: 'Требует внимания',
      tone: 'amber',
      rank: 1
    };
  }

  if (payment.act.isSent && !payment.act.isSigned) {
    return {
      key: 'waiting-signature',
      label: 'Ожидает подписи',
      tone: 'blue',
      rank: 2
    };
  }

  return {
    key: 'not-sent',
    label: 'Не отправлен',
    tone: 'gray',
    rank: 3
  };
}

export function enrichPayments(payments, projects, legalEntities) {
  return payments.map((payment) => {
    const project = projects.find((item) => item.id === payment.projectId);
    const legalEntity = legalEntities.find((item) => item.id === payment.legalEntityId);
    const actStatus = getActStatus(payment);

    return {
      ...payment,
      project,
      legalEntity,
      actStatus,
      ageDays: daysSince(payment.paymentDate)
    };
  });
}

export function applyFilters(payments, filters) {
  return payments.filter((payment) => {
    const query = filters.search.trim().toLowerCase();
    const matchesSearch =
      !query ||
      [
        payment.project.name,
        payment.legalEntity.name,
        payment.paymentPurpose,
        payment.serviceStage,
        payment.invoiceNumber,
        payment.contractNumber
      ]
        .join(' ')
        .toLowerCase()
        .includes(query);

    const matchesProject = filters.project === 'all' || payment.projectId === filters.project;
    const matchesLegalEntity =
      filters.legalEntity === 'all' || payment.legalEntityId === filters.legalEntity;
    const matchesStatus = filters.status === 'all' || payment.actStatus.key === filters.status;
    const matchesStage = filters.stage === 'all' || payment.serviceStage === filters.stage;
    const matchesPeriod =
      filters.period === 'all' || isInsidePeriod(payment.paymentDate, Number(filters.period));

    return (
      matchesSearch &&
      matchesProject &&
      matchesLegalEntity &&
      matchesStatus &&
      matchesStage &&
      matchesPeriod
    );
  });
}

export function calculateSummary(payments, projects) {
  const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const closedPayments = payments.filter((payment) => payment.actStatus.key === 'closed');
  const openPayments = payments.filter((payment) => payment.actStatus.key !== 'closed');

  return {
    totalPaid,
    projectCount: new Set(payments.map((payment) => payment.projectId)).size,
    paymentCount: payments.length,
    closedAmount: closedPayments.reduce((sum, payment) => sum + payment.amount, 0),
    openAmount: openPayments.reduce((sum, payment) => sum + payment.amount, 0),
    notSentCount: payments.filter((payment) => !payment.act.isSent).length,
    waitingSignatureCount: payments.filter((payment) => payment.act.isSent && !payment.act.isSigned)
      .length,
    attentionCount: payments.filter((payment) => payment.actStatus.key === 'attention').length
  };
}

export function calculateProjectRows(payments, projects, legalEntities) {
  return projects.map((project) => {
    const related = payments.filter((payment) => payment.projectId === project.id);
    const legalEntity = legalEntities.find((item) => item.id === project.legalEntityId);
    const closed = related.filter((payment) => payment.actStatus.key === 'closed').length;
    const attention = related.some((payment) => payment.actStatus.key === 'attention');

    return {
      ...project,
      legalEntity,
      totalPaid: related.reduce((sum, payment) => sum + payment.amount, 0),
      paymentCount: related.length,
      closedActs: closed,
      openActs: related.length - closed,
      documentStatus: attention ? 'attention' : closed === related.length ? 'closed' : 'in-progress'
    };
  }).filter((project) => project.paymentCount > 0);
}

function isInsidePeriod(date, days) {
  return daysSince(date) <= days;
}
