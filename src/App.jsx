import { useEffect, useMemo, useState } from 'react';
import {
  applyFilters,
  calculateProjectRows,
  calculateSummary,
  enrichPayments,
  transitionAct
} from './businessLogic.js';
import { emptyFilters, STORAGE_KEY } from './constants.js';
import { initialPayments, legalEntities, projects } from './data.js';
import { bankStatementRows, normalizeBankRows } from './importPipeline.js';
import { Filters } from './components/Filters.jsx';
import { Header, Notice, Sidebar, SummaryCards } from './components/Layout.jsx';
import {
  ActsBoard,
  ImportPanel,
  LegalEntitiesPanel,
  PaymentDetails,
  PaymentsTable,
  ProjectOverview,
  ReportsView
} from './components/Panels.jsx';
import { PaymentForm } from './components/PaymentForm.jsx';

export default function App() {
  const [payments, setPayments] = useState(() => loadSavedPayments());
  const [filters, setFilters] = useState(emptyFilters);
  const [selectedPaymentId, setSelectedPaymentId] = useState(initialPayments[1].id);
  const [importReport, setImportReport] = useState(null);
  const [activeView, setActiveView] = useState('dashboard');
  const [isPaymentFormOpen, setIsPaymentFormOpen] = useState(false);
  const [notice, setNotice] = useState('');

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

  const summary = useMemo(() => calculateSummary(filteredPayments), [filteredPayments]);

  const projectRows = useMemo(
    () => calculateProjectRows(filteredPayments, projects, legalEntities),
    [filteredPayments]
  );

  const selectedPayment =
    filteredPayments.find((payment) => payment.id === selectedPaymentId) || filteredPayments[0] || null;

  const stages = useMemo(
    () => [...new Set(enrichedPayments.map((payment) => payment.serviceStage))].sort(),
    [enrichedPayments]
  );

  function updateFilter(key, value) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  function toggleAct(paymentId, key) {
    setPayments((current) =>
      current.map((payment) => (payment.id === paymentId ? transitionAct(payment, key) : payment))
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
    setNotice(
      newPayments.length > 0
        ? `Импортировано ${newPayments.length} оплат из PDF-выписки.`
        : 'Все операции из PDF уже были импортированы.'
    );
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
    setNotice('Экспорт JSON сформирован.');
  }

  function resetDemoData() {
    setPayments(initialPayments);
    setSelectedPaymentId(initialPayments[1].id);
    setImportReport(null);
    setNotice('Демо-данные восстановлены.');
    localStorage.removeItem(STORAGE_KEY);
  }

  function createPayment(paymentDraft) {
    const project = projects.find((item) => item.id === paymentDraft.projectId);

    if (!project) return;

    const payment = {
      id: `pay-manual-${Date.now()}`,
      projectId: paymentDraft.projectId,
      legalEntityId: project.legalEntityId,
      paymentDate: paymentDraft.paymentDate,
      amount: Number(paymentDraft.amount),
      paymentPurpose: paymentDraft.paymentPurpose.trim(),
      serviceStage: paymentDraft.serviceStage.trim(),
      invoiceNumber: paymentDraft.invoiceNumber.trim() || 'без счета',
      contractNumber: paymentDraft.contractNumber.trim() || 'б/н',
      source: 'manual',
      act: {
        isSent: false,
        sentAt: '',
        isSigned: false,
        signedAt: '',
        managerComment: paymentDraft.managerComment.trim() || 'Добавлено вручную. Нужно подготовить акт.'
      }
    };

    setPayments((current) => [payment, ...current]);
    setSelectedPaymentId(payment.id);
    setActiveView('payments');
    setIsPaymentFormOpen(false);
    setNotice('Новая оплата добавлена.');
  }

  return (
    <div className="app-shell">
      <Sidebar activeView={activeView} onNavigate={setActiveView} summary={summary} />
      <main className="workspace">
        <Header
          onAddPayment={() => setIsPaymentFormOpen((value) => !value)}
          onExport={exportPayments}
          onResetDemo={resetDemoData}
        />
        {notice && <Notice message={notice} onClose={() => setNotice('')} />}
        {isPaymentFormOpen && (
          <PaymentForm projects={projects} onCancel={() => setIsPaymentFormOpen(false)} onCreate={createPayment} />
        )}
        <SummaryCards summary={summary} />
        <ViewContent
          activeView={activeView}
          filters={filters}
          filteredPayments={filteredPayments}
          importReport={importReport}
          legalEntities={legalEntities}
          onCommentChange={updateManagerComment}
          onFilterChange={updateFilter}
          onImport={importBankStatement}
          onResetFilters={() => setFilters(emptyFilters)}
          onSelectPayment={setSelectedPaymentId}
          onToggleAct={toggleAct}
          projectRows={projectRows}
          projects={projects}
          selectedPayment={selectedPayment}
          selectedPaymentId={selectedPayment?.id}
          stages={stages}
          summary={summary}
        />
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

function ViewContent({
  activeView,
  filters,
  filteredPayments,
  importReport,
  legalEntities,
  onCommentChange,
  onFilterChange,
  onImport,
  onResetFilters,
  onSelectPayment,
  onToggleAct,
  projectRows,
  projects,
  selectedPayment,
  selectedPaymentId,
  stages,
  summary
}) {
  const filtersPanel = (
    <Filters
      filters={filters}
      projects={projects}
      legalEntities={legalEntities}
      stages={stages}
      onChange={onFilterChange}
      onReset={onResetFilters}
    />
  );

  if (activeView === 'projects') {
    return (
      <>
        {filtersPanel}
        <section className="two-column-grid">
          <ProjectOverview rows={projectRows} />
          <LegalEntitiesPanel rows={projectRows} />
        </section>
      </>
    );
  }

  if (activeView === 'payments') {
    return (
      <>
        {filtersPanel}
        <section className="content-grid">
          <PaymentsTable payments={filteredPayments} selectedPaymentId={selectedPaymentId} onSelect={onSelectPayment} onToggleAct={onToggleAct} />
          <PaymentDetails payment={selectedPayment} onToggleAct={onToggleAct} onCommentChange={onCommentChange} />
        </section>
      </>
    );
  }

  if (activeView === 'acts') {
    return (
      <>
        {filtersPanel}
        <section className="content-grid">
          <ActsBoard payments={filteredPayments} selectedPaymentId={selectedPaymentId} onSelect={onSelectPayment} onToggleAct={onToggleAct} />
          <PaymentDetails payment={selectedPayment} onToggleAct={onToggleAct} onCommentChange={onCommentChange} />
        </section>
      </>
    );
  }

  if (activeView === 'reports') {
    return (
      <>
        {filtersPanel}
        <ReportsView payments={filteredPayments} projectRows={projectRows} summary={summary} />
      </>
    );
  }

  return (
    <>
      <ImportPanel report={importReport} onImport={onImport} />
      {filtersPanel}
      <section className="content-grid">
        <div className="main-column">
          <ProjectOverview rows={projectRows} />
          <PaymentsTable payments={filteredPayments} selectedPaymentId={selectedPaymentId} onSelect={onSelectPayment} onToggleAct={onToggleAct} />
        </div>
        <PaymentDetails payment={selectedPayment} onToggleAct={onToggleAct} onCommentChange={onCommentChange} />
      </section>
    </>
  );
}

