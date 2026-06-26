export const legalEntities = [
  {
    id: 'le-aurora',
    name: 'ООО "Аврора Медиа"',
    inn: '7701845120',
    ogrn: '1167746123450',
    bankAccount: '40702810900000001452',
    contactPerson: 'Анна Соколова'
  },
  {
    id: 'le-vesta',
    name: 'ИП Кузнецов Роман Игоревич',
    inn: '540702881490',
    ogrn: '322547600198540',
    bankAccount: '40802810300000008114',
    contactPerson: 'Роман Кузнецов'
  },
  {
    id: 'le-nord',
    name: 'ООО "Норд Сервис"',
    inn: '7816654321',
    ogrn: '1197847008452',
    bankAccount: '40702810600000004418',
    contactPerson: 'Мария Белова'
  },
  {
    id: 'le-orion',
    name: 'АО "Орион Девелопмент"',
    inn: '7709988123',
    ogrn: '1027700132195',
    bankAccount: '40702810100000006002',
    contactPerson: 'Павел Миронов'
  },
  {
    id: 'le-lednik',
    name: 'ООО "Ледник-Старт"',
    inn: '514203851420',
    ogrn: '1195142008124',
    bankAccount: '40702810504010067142',
    contactPerson: 'Светлана Рябова'
  },
  {
    id: 'le-orbita',
    name: 'ООО "Орбита-Промо"',
    inn: '717204674710',
    ogrn: '1197172008604',
    bankAccount: '40702810123040048291',
    contactPerson: 'Дмитрий Крылов'
  },
  {
    id: 'le-sigma',
    name: 'ООО "Сигма-Маркет"',
    inn: '717224571730',
    ogrn: '1197173006042',
    bankAccount: '40702810888060027194',
    contactPerson: 'Ольга Ильина'
  }
];

export const projects = [
  {
    id: 'project-landing',
    name: 'Лендинг для образовательного курса',
    legalEntityId: 'le-aurora',
    status: 'active',
    owner: 'Елена',
    startedAt: '2026-05-12'
  },
  {
    id: 'project-seo',
    name: 'SEO-сопровождение интернет-магазина',
    legalEntityId: 'le-vesta',
    status: 'attention',
    owner: 'Игорь',
    startedAt: '2026-04-03'
  },
  {
    id: 'project-crm',
    name: 'CRM-виджеты и автоматизация заявок',
    legalEntityId: 'le-nord',
    status: 'active',
    owner: 'Матвей',
    startedAt: '2026-05-27'
  },
  {
    id: 'project-brand',
    name: 'Редизайн бренда и контент-пакет',
    legalEntityId: 'le-orion',
    status: 'closed',
    owner: 'Арина',
    startedAt: '2026-03-18'
  },
  {
    id: 'project-lednik-support',
    name: 'Техническое сопровождение сайта',
    legalEntityId: 'le-lednik',
    status: 'active',
    owner: 'Матвей',
    startedAt: '2026-07-09'
  },
  {
    id: 'project-orbita-direct',
    name: 'Настройка и сопровождение Директа',
    legalEntityId: 'le-orbita',
    status: 'active',
    owner: 'Игорь',
    startedAt: '2026-07-10'
  },
  {
    id: 'project-sigma-ads',
    name: 'Объявления и контекстная реклама',
    legalEntityId: 'le-sigma',
    status: 'active',
    owner: 'Елена',
    startedAt: '2026-07-14'
  }
];

export const initialPayments = [
  {
    id: 'pay-1001',
    projectId: 'project-landing',
    legalEntityId: 'le-aurora',
    paymentDate: '2026-06-02',
    amount: 65000,
    paymentPurpose: 'Оплата первого этапа разработки лендинга по договору 24-05',
    serviceStage: 'Дизайн и прототип',
    invoiceNumber: 'СЧ-112',
    contractNumber: '24-05',
    act: {
      isSent: true,
      sentAt: '2026-06-07',
      isSigned: true,
      signedAt: '2026-06-10',
      managerComment: 'Закрыто без замечаний.'
    }
  },
  {
    id: 'pay-1002',
    projectId: 'project-landing',
    legalEntityId: 'le-aurora',
    paymentDate: '2026-06-18',
    amount: 90000,
    paymentPurpose: 'Оплата второго этапа: верстка, адаптив и интеграция формы',
    serviceStage: 'Frontend-разработка',
    invoiceNumber: 'СЧ-134',
    contractNumber: '24-05',
    act: {
      isSent: true,
      sentAt: '2026-06-22',
      isSigned: false,
      signedAt: '',
      managerComment: 'Ждем подпись от клиента.'
    }
  },
  {
    id: 'pay-1003',
    projectId: 'project-seo',
    legalEntityId: 'le-vesta',
    paymentDate: '2026-05-24',
    amount: 42000,
    paymentPurpose: 'SEO-сопровождение и подготовка семантики за май',
    serviceStage: 'SEO / май',
    invoiceNumber: 'СЧ-087',
    contractNumber: '11-04',
    act: {
      isSent: false,
      sentAt: '',
      isSigned: false,
      signedAt: '',
      managerComment: 'Нужно запросить отчет у SEO-специалиста.'
    }
  },
  {
    id: 'pay-1004',
    projectId: 'project-seo',
    legalEntityId: 'le-vesta',
    paymentDate: '2026-06-21',
    amount: 38000,
    paymentPurpose: 'Контекстная реклама и ведение кампаний за июнь',
    serviceStage: 'Реклама / июнь',
    invoiceNumber: 'СЧ-141',
    contractNumber: '11-04',
    act: {
      isSent: false,
      sentAt: '',
      isSigned: false,
      signedAt: '',
      managerComment: 'Свежее поступление, акт в работе.'
    }
  },
  {
    id: 'pay-1005',
    projectId: 'project-crm',
    legalEntityId: 'le-nord',
    paymentDate: '2026-06-09',
    amount: 120000,
    paymentPurpose: 'Разработка CRM-виджета и настройка вебхуков',
    serviceStage: 'Backend + интеграции',
    invoiceNumber: 'СЧ-118',
    contractNumber: '31-05',
    act: {
      isSent: true,
      sentAt: '2026-06-14',
      isSigned: false,
      signedAt: '',
      managerComment: 'Клиент обещал подписать после демо.'
    }
  },
  {
    id: 'pay-1006',
    projectId: 'project-crm',
    legalEntityId: 'le-nord',
    paymentDate: '2026-06-24',
    amount: 45000,
    paymentPurpose: 'Доплата за Telegram-уведомления и импорт лидов',
    serviceStage: 'Автоматизация лидов',
    invoiceNumber: 'СЧ-148',
    contractNumber: '31-05',
    act: {
      isSent: false,
      sentAt: '',
      isSigned: false,
      signedAt: '',
      managerComment: 'Акт сформировать после передачи релиза.'
    }
  },
  {
    id: 'pay-1007',
    projectId: 'project-brand',
    legalEntityId: 'le-orion',
    paymentDate: '2026-05-15',
    amount: 76000,
    paymentPurpose: 'Айдентика, брендбук и комплект баннеров',
    serviceStage: 'Дизайн-пакет',
    invoiceNumber: 'СЧ-073',
    contractNumber: '08-03',
    act: {
      isSent: true,
      sentAt: '2026-05-19',
      isSigned: true,
      signedAt: '2026-05-22',
      managerComment: 'Проект закрыт.'
    }
  }
];
