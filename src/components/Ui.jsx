export function Select({ label, value, onChange, children }) {
  return (
    <label className="select-field">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {children}
      </select>
    </label>
  );
}

export function Toggle({ checked, onChange }) {
  return (
    <button className={checked ? 'toggle checked' : 'toggle'} onClick={onChange} type="button">
      <span />
    </button>
  );
}

export function StatusChip({ status, compact = false }) {
  const compactLabels = {
    'waiting-signature': 'Ждет подпись',
    attention: 'Внимание',
    'not-sent': 'Не отправлен',
    closed: 'Закрыт'
  };

  return (
    <span className={`status-chip ${status.tone}`} title={status.reason}>
      {compact ? compactLabels[status.key] || status.label : status.label}
    </span>
  );
}
