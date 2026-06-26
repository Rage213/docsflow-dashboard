import { formatMoney } from '../businessLogic.js';
import { navItems } from '../constants.js';

export function Sidebar({ activeView, onNavigate, summary }) {
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
        {navItems.map((item) => (
          <button
            className={item.id === activeView ? 'nav-item active' : 'nav-item'}
            key={item.id}
            onClick={() => onNavigate(item.id)}
          >
            <span className="nav-icon" />
            {item.label}
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

export function Header({ onAddPayment, onExport, onResetDemo }) {
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
        <button className="ghost-button" onClick={onResetDemo}>
          Вернуть seed
        </button>
        <button className="primary-button" onClick={onAddPayment}>
          Добавить оплату
        </button>
      </div>
    </header>
  );
}

export function Notice({ message, onClose }) {
  return (
    <div className="notice">
      <span>{message}</span>
      <button onClick={onClose}>Закрыть</button>
    </div>
  );
}

export function SummaryCards({ summary }) {
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
