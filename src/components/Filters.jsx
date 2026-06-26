import { statusLabels } from '../constants.js';
import { Select } from './Ui.jsx';

export function Filters({ filters, projects, legalEntities, stages, onChange, onReset }) {
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
      <Select label="Юрлицо" value={filters.legalEntity} onChange={(value) => onChange('legalEntity', value)}>
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
