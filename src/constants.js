export const STORAGE_KEY = 'docsflow-payments-v3';

export const emptyFilters = {
  search: '',
  project: 'all',
  legalEntity: 'all',
  period: 'all',
  status: 'all',
  stage: 'all'
};

export const statusLabels = {
  all: 'Все статусы',
  closed: 'Закрыт',
  attention: 'Требует внимания',
  'waiting-signature': 'Ожидает подписи',
  'not-sent': 'Не отправлен'
};

export const navItems = [
  { id: 'dashboard', label: 'Дашборд' },
  { id: 'projects', label: 'Проекты' },
  { id: 'payments', label: 'Оплаты' },
  { id: 'acts', label: 'Акты' },
  { id: 'reports', label: 'Отчеты' }
];
