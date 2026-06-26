import { useState } from 'react';
import { validateManualPayment } from '../businessLogic.js';
import { Select } from './Ui.jsx';

export function PaymentForm({ projects, onCancel, onCreate }) {
  const [draft, setDraft] = useState({
    projectId: projects[0].id,
    paymentDate: '2026-08-14',
    amount: '',
    paymentPurpose: '',
    serviceStage: '',
    invoiceNumber: '',
    contractNumber: '',
    managerComment: ''
  });
  const [errors, setErrors] = useState([]);

  function updateField(key, value) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function submit(event) {
    event.preventDefault();
    const validationErrors = validateManualPayment(draft);
    setErrors(validationErrors);

    if (validationErrors.length === 0) {
      onCreate(draft);
    }
  }

  return (
    <form className="payment-form" onSubmit={submit}>
      <div className="form-heading">
        <div>
          <h2>Новая оплата</h2>
          <p>Ручной ввод операции от менеджера, если данные пришли не из выписки.</p>
        </div>
        <button className="ghost-button" onClick={onCancel} type="button">
          Закрыть
        </button>
      </div>
      {errors.length > 0 && (
        <div className="form-errors">
          {errors.map((error) => (
            <span key={error}>{error}</span>
          ))}
        </div>
      )}
      <div className="form-grid">
        <Select label="Проект" value={draft.projectId} onChange={(value) => updateField('projectId', value)}>
          {projects.map((project) => (
            <option value={project.id} key={project.id}>
              {project.name}
            </option>
          ))}
        </Select>
        <label>
          <span>Дата оплаты</span>
          <input
            type="date"
            value={draft.paymentDate}
            onChange={(event) => updateField('paymentDate', event.target.value)}
          />
        </label>
        <label>
          <span>Сумма</span>
          <input
            min="1"
            type="number"
            value={draft.amount}
            onChange={(event) => updateField('amount', event.target.value)}
            placeholder="65000"
          />
        </label>
        <label>
          <span>Этап / услуга</span>
          <input
            value={draft.serviceStage}
            onChange={(event) => updateField('serviceStage', event.target.value)}
            placeholder="Дизайн, SEO, разработка"
          />
        </label>
        <label>
          <span>Счет</span>
          <input
            value={draft.invoiceNumber}
            onChange={(event) => updateField('invoiceNumber', event.target.value)}
            placeholder="СЧ-154"
          />
        </label>
        <label>
          <span>Договор</span>
          <input
            value={draft.contractNumber}
            onChange={(event) => updateField('contractNumber', event.target.value)}
            placeholder="24-05"
          />
        </label>
      </div>
      <label>
        <span>Назначение платежа</span>
        <input
          value={draft.paymentPurpose}
          onChange={(event) => updateField('paymentPurpose', event.target.value)}
          placeholder="Оплата этапа работ по договору"
        />
      </label>
      <label>
        <span>Комментарий к оплате</span>
        <textarea
          value={draft.managerComment}
          onChange={(event) => updateField('managerComment', event.target.value)}
          placeholder="Что нужно проверить по акту"
        />
      </label>
      <div className="form-actions">
        <button className="ghost-button" onClick={onCancel} type="button">
          Отмена
        </button>
        <button className="primary-button" type="submit">
          Создать оплату
        </button>
      </div>
    </form>
  );
}

