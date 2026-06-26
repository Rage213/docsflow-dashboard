import { businessRules, formatDate, formatMoney } from '../businessLogic.js';
import { entityModel } from '../domainModel.js';
import { StatusChip, Toggle } from './Ui.jsx';

export function ImportPanel({ report, onImport }) {
  return (
    <section className="import-panel">
      <div>
        <h2>Импорт банковской выписки</h2>
        <p>
          Pipeline проверяет строки выписки, сопоставляет плательщика с юрлицом, находит проект,
          определяет этап работ и создает оплаты со стартовым статусом акта.
        </p>
      </div>
      {report && (
        <div className="import-result">
          <strong>{report.addedCount} новых оплат</strong>
          <span>
            распознано {report.recognizedCount}, дублей {report.duplicateCount}, неразобрано{' '}
            {report.unresolvedRows.length}, ошибок {report.invalidRows.length}
          </span>
        </div>
      )}
      <button className="primary-button" onClick={onImport}>
        Импортировать PDF
      </button>
    </section>
  );
}

export function ProjectOverview({ rows }) {
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
            <StatusChip status={getProjectStatus(row)} />
          </article>
        ))}
      </div>
    </section>
  );
}

export function LegalEntitiesPanel({ rows }) {
  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <h2>Юридические лица</h2>
          <p>Реквизиты, суммы оплат и открытые документы по каждому плательщику.</p>
        </div>
      </div>
      <div className="entity-list">
        {rows.map((row) => (
          <article className="entity-row" key={row.legalEntity.id}>
            <div>
              <strong>{row.legalEntity.name}</strong>
              <span>ИНН {row.legalEntity.inn}</span>
              <span>Р/с {row.legalEntity.bankAccount}</span>
            </div>
            <div>
              <strong>{formatMoney(row.totalPaid)}</strong>
              <span>{row.openActs} открытых актов</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function PaymentsTable({ payments, selectedPaymentId, onSelect, onToggleAct }) {
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
                  <Toggle checked={payment.act.isSent} onChange={(event) => handleToggle(event, payment.id, 'isSent', onToggleAct)} />
                </td>
                <td>
                  <Toggle checked={payment.act.isSigned} onChange={(event) => handleToggle(event, payment.id, 'isSigned', onToggleAct)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function ActsBoard({ payments, selectedPaymentId, onSelect, onToggleAct }) {
  const columns = [
    ['attention', 'Требуют внимания'],
    ['not-sent', 'Не отправлены'],
    ['waiting-signature', 'Ждут подписи'],
    ['closed', 'Закрыты']
  ];

  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <h2>Контроль актов</h2>
          <p>Операционная доска по закрывающим документам.</p>
        </div>
      </div>
      <div className="acts-board">
        {columns.map(([statusKey, title]) => {
          const items = payments.filter((payment) => payment.actStatus.key === statusKey);
          return (
            <div className="acts-column" key={statusKey}>
              <div className="acts-column-title">
                <strong>{title}</strong>
                <span>{items.length}</span>
              </div>
              {items.map((payment) => (
                <article
                  className={payment.id === selectedPaymentId ? 'act-card selected' : 'act-card'}
                  key={payment.id}
                  onClick={() => onSelect(payment.id)}
                >
                  <StatusChip status={payment.actStatus} compact />
                  <strong>{payment.project.name}</strong>
                  <span>{payment.legalEntity.name}</span>
                  <b>{formatMoney(payment.amount)}</b>
                  <div className="act-card-actions">
                    <button onClick={(event) => handleToggle(event, payment.id, 'isSent', onToggleAct)}>
                      {payment.act.isSent ? 'Снять отправку' : 'Отправлен'}
                    </button>
                    <button onClick={(event) => handleToggle(event, payment.id, 'isSigned', onToggleAct)}>
                      {payment.act.isSigned ? 'Снять подпись' : 'Подписан'}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function ReportsView({ payments, projectRows, summary }) {
  const attentionPayments = payments.filter((payment) => payment.actStatus.key === 'attention');
  const conversion = summary.paymentCount
    ? Math.round((payments.filter((payment) => payment.actStatus.key === 'closed').length / summary.paymentCount) * 100)
    : 0;

  return (
    <section className="reports-grid">
      <article className="panel report-panel">
        <h2>Сводка руководителя</h2>
        <div className="report-metrics">
          <div>
            <span>Всего оплат</span>
            <strong>{formatMoney(summary.totalPaid)}</strong>
          </div>
          <div>
            <span>Закрыто актами</span>
            <strong>{formatMoney(summary.closedAmount)}</strong>
          </div>
          <div>
            <span>Незакрыто</span>
            <strong>{formatMoney(summary.openAmount)}</strong>
          </div>
          <div>
            <span>Закрытие документов</span>
            <strong>{conversion}%</strong>
          </div>
        </div>
      </article>
      <BusinessRulesPanel />
      <article className="panel report-panel">
        <h2>Проекты с риском</h2>
        <div className="risk-list">
          {attentionPayments.map((payment) => (
            <div className="risk-row" key={payment.id}>
              <div>
                <strong>{payment.project.name}</strong>
                <span>{payment.legalEntity.name}</span>
              </div>
              <span>{payment.ageDays} дн.</span>
              <b>{formatMoney(payment.amount)}</b>
            </div>
          ))}
        </div>
      </article>
      <DataModelPanel />
      <article className="panel report-panel wide">
        <h2>Итоги по проектам</h2>
        <div className="project-report-table">
          {projectRows.map((row) => (
            <div className="project-report-row" key={row.id}>
              <strong>{row.name}</strong>
              <span>{row.legalEntity.name}</span>
              <b>{formatMoney(row.totalPaid)}</b>
              <span>{row.closedActs}/{row.paymentCount} актов закрыто</span>
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}

export function PaymentDetails({ payment, onToggleAct, onCommentChange }) {
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
        <small>{payment.actStatus.reason}</small>
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

function BusinessRulesPanel() {
  return (
    <article className="panel report-panel">
      <h2>Бизнес-правила</h2>
      <div className="rules-list">
        {businessRules.map((rule) => (
          <div className="rule-row" key={rule.title}>
            <strong>{rule.title}</strong>
            <span>{rule.text}</span>
          </div>
        ))}
      </div>
    </article>
  );
}

function DataModelPanel() {
  return (
    <article className="panel report-panel">
      <h2>Модель данных</h2>
      <div className="model-list">
        {entityModel.map((entity) => (
          <div className="model-row" key={entity.table}>
            <div>
              <strong>{entity.table}</strong>
              <span>{entity.description}</span>
            </div>
            <code>{entity.fields.join(', ')}</code>
          </div>
        ))}
      </div>
    </article>
  );
}

function getProjectStatus(row) {
  if (row.documentStatus === 'closed') return { key: 'closed', label: 'Закрыт', tone: 'green' };
  if (row.documentStatus === 'attention') return { key: 'attention', label: 'Контроль', tone: 'amber' };
  return { key: 'in-progress', label: 'В работе', tone: 'blue' };
}

function handleToggle(event, paymentId, key, onToggleAct) {
  event.stopPropagation();
  onToggleAct(paymentId, key);
}
