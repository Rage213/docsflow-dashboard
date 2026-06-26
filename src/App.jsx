import { useEffect, useMemo, useState } from 'react';
import { initialPayments, legalEntities, projects } from './data.js';
import { bankStatementRows, normalizeBankRows } from './importPipeline.js';
import {
  applyFilters,
  calculateProjectRows,
  calculateSummary,
  enrichPayments,
  formatDate,
  formatMoney
} from './businessLogic.js';

const STORAGE_KEY = 'docsflow-payments-v2';

const emptyFilters = {
  search: '',
  project: 'all',
  legalEntity: 'all',
  period: 'all',
  status: 'all',
  stage: 'all'
};

const statusLabels = {
  all: 'Все статусы',
  closed: 'Закрыт',
  attention: 'Требует внимания',
  'waiting-signature': 'Ожидает подписи',
  'not-sent': 'Не отправлен'
};

export default function App() {
  const [payments, setPayments] = useState(() => loadSavedPayments());
  const [filters, setFilters] = useState(emptyFilters);
  const [selectedPaymentId, setSelectedPaymentId] = useState(initialPayments[1].id);
  const [importReport, setImportReport] = useState(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payments));
  }, [payments]);

  const enrichedPayments = useMemo(
    () => enrichPayments(payments, projects, legalEntities),
    [payments]
  );

  const filteredPayments = useMemo(
    () => applyFilters(enrichedPayments, filters),
    [enrichedPayments, filters]
  );

  const summary = useMemo(
    () => calculateSummary(filteredPayments, projects),
    [filteredPayments]
  );

  const projectRows = useMemo(
    () => calculateProjectRows(enrichedPayments, projects, legalEntities),
    [enrichedPayments]
  );

  const selectedPayment =
    enrichedPayments.find((payment) => payment.id === selectedPaymentId) || enrichedPayments[0];

  const stages = [...new Set(enrichedPayments.map((payment) => payment.serviceStage))];

  function updateFilter(key, value) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  function toggleAct(paymentId, key) {
    setPayments((current) =>
      current.map((payment) => {
        if (payment.id !== paymentId) return payment;

        const nextValue = !payment.act[key];
        const dateKey = key === 'isSent' ? 'sentAt' : 'signedAt';
        return {
          ...payment,
          act: {
            ...payment.act,
            [key]: nextValue,
            [dateKey]: nextValue ? '2026-06-25' : ''
          }
        };
      })
    );
  }

  function updateManagerComment(paymentId, managerComment) {
    setPayments((current) =>
      current.map((payment) =>
        payment.id === paymentId
          ? { ...payment, act: { ...payment.act, managerComment } }
          : payment
      )
    );
  }

  function importBankStatement() {
    const report = normalizeBankRows(bankStatementRows, projects, legalEntities);
    const existingIds = new Set(payments.map((payment) => payment.id));
    const newPayments = report.payments.filter((payment) => !existingIds.has(payment.id));

    if (newPayments.length > 0) {
      setPayments((current) => [...newPayments, ...current]);
      setSelectedPaymentId(newPayments[0].id);
    }

    setImportReport({
      ...report,
      addedCount: newPayments.length,
      duplicateCount: report.payments.length - newPayments.length
    });
  }

  function exportPayments() {
    const payload = JSON.stringify({ exportedAt: new Date().toISOString(), payments }, null, 2);
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'docsflow-payments.json';
    link.click();
    URL.revokeObjectURL(url);
  }

  function resetDemoData() {
    setPayments(initialPayments);
    setSelectedPaymentId(initialPayments[1].id);
    setImportReport(null);
    localStorage.removeItem(STORAGE_KEY);
  }

  return (
    <div className="app-shell">
      <Sidebar summary={summary} />
      <main className="workspace">
        <Header onExport={exportPayments} onResetDemo={resetDemoData} />
        <SummaryCards summary={summary} />
        <ImportPanel report={importReport} onImport={importBankStatement} />
        <Filters
          filters={filters}
          projects={projects}
          legalEntities={legalEntities}
          stages={stages}
          onChange={updateFilter}
          onReset={() => setFilters(emptyFilters)}
        />
        <section className="content-grid">
          <div className="main-column">
            <ProjectOverview rows={projectRows} />
            <PaymentsTable
              payments={filteredPayments}
              selectedPaymentId={selectedPayment.id}
              onSelect={setSelectedPaymentId}
              onToggleAct={toggleAct}
            />
          </div>
          <PaymentDetails
            payment={selectedPayment}
            onToggleAct={toggleAct}
            onCommentChange={updateManagerComment}
          />
        </section>
      </main>
    </div>
  );
}

function loadSavedPayments() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : initialPayments;
  } catch {
    return initialPayments;
  }
}

function Sidebar({ summary }) {
  const nav = ['Дашборд', 'Проекты', 'Оплаты', 'Акты', 'Отчеты'];

  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand-mark">D</span>
        <div>
          <strong>DocsFlow</strong>
          <span>agency ops</span>
        </div>
      </div>
      <nav className="nav-list">
        {nav.map((item, index) => (
          <button className={index === 0 ? 'nav-item active' : 'nav-item'} key={item}>
            <span className="nav-icon" />
            {item}
          </button>
        ))}
      </nav>
      <div className="sidebar-note">
        <span>Контроль</span>
        <strong>{summary.attentionCount} оплат требуют проверки документов</strong>
      </div>
    </aside>
  );
}

function Header({ onExport, onResetDemo }) {
  return (
    <header className="header">
      <div>
        <h1>Контроль оплат и актов</h1>
        <p>Связь проектов, юрлиц, оплат, этапов работ и закрывающих документов.</p>
      </div>
      <div className="header-actions">
        <button className="ghost-button" onClick={onExport}>
          Экспорт
        </button>
        <button className="primary-button" onClick={onResetDemo}>
          Вернуть seed
        </button>
      </div>
    </header>
  );
}

function ImportPanel({ report, onImport }) {
  return (
    <section className="import-panel">
      <div>
        <h2>Импорт банковской выписки</h2>
        <p>
          Демонстрация pipeline: PDF-выписка разбирается в операции, сопоставляется с юрлицом,
          проектом и этапом работ, затем создает оплаты со статусом акта.
        </p>
      </div>
      {report && (
        <div className="import-result">
          <strong>{report.addedCount} новых оплат</strong>
          <span>
            распознано {report.recognizedCount}, дублей {report.duplicateCount}, неразобрано{' '}
            {report.unresolvedRows.length}
          </span>
        </div>
      )}
      <button className="primary-button" onClick={onImport}>
        Импортировать PDF
      </button>
    </section>
  );
}

function SummaryCards({ summary }) {
  const cards = [
    ['Всего оплачено', formatMoney(summary.totalPaid), 'по выбранным фильтрам'],
    ['Проектов', summary.projectCount, `${summary.paymentCount} оплат`],
    ['Закрыто актами', formatMoney(summary.closedAmount), 'подписанные документы'],
    ['Незакрыто', formatMoney(summary.openAmount), `${summary.attentionCount} требуют внимания`],
    ['Акты не отправлены', summary.notSentCount, 'нужна подготовка'],
    ['Ждут подписи', summary.waitingSignatureCount, 'контроль менеджера']
  ];

  return (
    <section className="summary-grid">
      {cards.map(([label, value, hint]) => (
        <article className="summary-card" key={label}>
          <span>{label}</span>
          <strong>{value}</strong>
          <small>{hint}</small>
        </article>
      ))}
    </section>
  );
}

function Filters({ filters, projects, legalEntities, stages, onChange, onReset }) {
  return (
    <section className="filters-panel">
      <label className="search-field">
        <span>Поиск</span>
        <input
          value={filters.search}
          onChange={(event) => onChange('search', event.target.value)}
          placeholder="Назначение платежа, клиент, счет"
        />
      </label>
      <Select label="Проект" value={filters.project} onChange={(value) => onChange('project', value)}>
        <option value="all">Все проекты</option>
        {projects.map((project) => (
          <option value={project.id} key={project.id}>
            {project.name}
          </option>
        ))}
      </Select>
      <Select
        label="Юрлицо"
        value={filters.legalEntity}
        onChange={(value) => onChange('legalEntity', value)}
      >
        <option value="all">Все юрлица</option>
        {legalEntities.map((entity) => (
          <option value={entity.id} key={entity.id}>
            {entity.name}
          </option>
        ))}
      </Select>
      <Select label="Период" value={filters.period} onChange={(value) => onChange('period', value)}>
        <option value="all">Все даты</option>
        <option value="7">7 дней</option>
        <option value="14">14 дней</option>
        <option value="30">30 дней</option>
      </Select>
      <Select label="Статус" value={filters.status} onChange={(value) => onChange('status', value)}>
        {Object.entries(statusLabels).map(([value, label]) => (
          <option value={value} key={value}>
            {label}
          </option>
        ))}
      </Select>
      <Select label="Этап" value={filters.stage} onChange={(value) => onChange('stage', value)}>
        <option value="all">Все этапы</option>
        {stages.map((stage) => (
          <option value={stage} key={stage}>
            {stage}
          </option>
        ))}
      </Select>
      <button className="reset-button" onClick={onReset}>
        Сбросить
      </button>
    </section>
  );
}

function Select({ label, value, onChange, children }) {
  return (
    <label className="select-field">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {children}
      </select>
    </label>
  );
}

function ProjectOverview({ rows }) {
  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <h2>Проекты и юрлица</h2>
          <p>Сводка по оплатам и закрывающим документам.</p>
        </div>
      </div>
      <div className="project-list">
        {rows.map((row) => (
          <article className="project-row" key={row.id}>
            <div>
              <strong>{row.name}</strong>
              <span>{row.legalEntity.name}</span>
            </div>
            <div className="project-meta">
              <span>{formatMoney(row.totalPaid)}</span>
              <small>
                {row.closedActs}/{row.paymentCount} актов закрыто
              </small>
            </div>
            <StatusChip
              status={
                row.documentStatus === 'closed'
                  ? { label: 'Закрыт', tone: 'green' }
                  : row.documentStatus === 'attention'
                    ? { label: 'Контроль', tone: 'amber' }
                    : { label: 'В работе', tone: 'blue' }
              }
            />
          </article>
        ))}
      </div>
    </section>
  );
}

function PaymentsTable({ payments, selectedPaymentId, onSelect, onToggleAct }) {
  return (
    <section className="panel payments-panel">
      <div className="panel-heading">
        <div>
          <h2>Оплаты</h2>
          <p>Клик по строке открывает детали и историю документа.</p>
        </div>
        <span className="row-count">{payments.length} записей</span>
      </div>
      <div className="table-wrap">
        <table>
          <colgroup>
            <col className="col-date" />
            <col className="col-payer" />
            <col className="col-project" />
            <col className="col-money" />
            <col className="col-status" />
            <col className="col-toggle" />
            <col className="col-toggle" />
          </colgroup>
          <thead>
            <tr>
              <th>Дата</th>
              <th>Плательщик</th>
              <th>Проект / этап</th>
              <th>Сумма</th>
              <th>Акт</th>
              <th>Отправлен</th>
              <th>Подписан</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <tr
                className={payment.id === selectedPaymentId ? 'selected' : ''}
                key={payment.id}
                onClick={() => onSelect(payment.id)}
              >
                <td>{formatDate(payment.paymentDate)}</td>
                <td>
                  <strong>{payment.legalEntity.name}</strong>
                  <span>ИНН {payment.legalEntity.inn}</span>
                </td>
                <td>
                  <strong>{payment.project.name}</strong>
                  <span>{payment.serviceStage}</span>
                </td>
                <td className="money">{formatMoney(payment.amount)}</td>
                <td>
                  <StatusChip status={payment.actStatus} compact />
                </td>
                <td>
                  <Toggle
                    checked={payment.act.isSent}
                    onChange={(event) => {
                      event.stopPropagation();
                      onToggleAct(payment.id, 'isSent');
                    }}
                  />
                </td>
                <td>
                  <Toggle
                    checked={payment.act.isSigned}
                    onChange={(event) => {
                      event.stopPropagation();
                      onToggleAct(payment.id, 'isSigned');
                    }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function PaymentDetails({ payment, onToggleAct, onCommentChange }) {
  const events = [
    ['Оплата поступила', formatDate(payment.paymentDate), true],
    ['Акт отправлен', payment.act.sentAt ? formatDate(payment.act.sentAt) : 'ожидает', payment.act.isSent],
    ['Акт подписан', payment.act.signedAt ? formatDate(payment.act.signedAt) : 'ожидает', payment.act.isSigned]
  ];

  return (
    <aside className="details-panel">
      <div className="details-header">
        <StatusChip status={payment.actStatus} />
        <h2>{payment.project.name}</h2>
        <p>{payment.paymentPurpose}</p>
      </div>
      <dl className="details-list">
        <div>
          <dt>Юрлицо</dt>
          <dd>{payment.legalEntity.name}</dd>
        </div>
        <div>
          <dt>Сумма</dt>
          <dd>{formatMoney(payment.amount)}</dd>
        </div>
        <div>
          <dt>Этап</dt>
          <dd>{payment.serviceStage}</dd>
        </div>
        <div>
          <dt>Счет / договор</dt>
          <dd>
            {payment.invoiceNumber} / {payment.contractNumber}
          </dd>
        </div>
      </dl>
      <div className="detail-actions">
        <button onClick={() => onToggleAct(payment.id, 'isSent')}>
          {payment.act.isSent ? 'Снять отправку' : 'Отметить отправку'}
        </button>
        <button onClick={() => onToggleAct(payment.id, 'isSigned')}>
          {payment.act.isSigned ? 'Снять подпись' : 'Отметить подпись'}
        </button>
      </div>
      <div className="timeline">
        <h3>История документа</h3>
        {events.map(([label, date, done]) => (
          <div className={done ? 'timeline-item done' : 'timeline-item'} key={label}>
            <span />
            <div>
              <strong>{label}</strong>
              <small>{date}</small>
            </div>
          </div>
        ))}
      </div>
      <label className="comment-box">
        <span>Комментарий менеджера</span>
        <textarea
          value={payment.act.managerComment}
          onChange={(event) => onCommentChange(payment.id, event.target.value)}
        />
      </label>
    </aside>
  );
}

function StatusChip({ status, compact = false }) {
  const compactLabels = {
    'waiting-signature': 'Ждет подпись',
    attention: 'Внимание',
    'not-sent': 'Не отправлен',
    closed: 'Закрыт'
  };

  return (
    <span className={`status-chip ${status.tone}`}>
      {compact ? compactLabels[status.key] || status.label : status.label}
    </span>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <button className={checked ? 'toggle checked' : 'toggle'} onClick={onChange} type="button">
      <span />
    </button>
  );
}
