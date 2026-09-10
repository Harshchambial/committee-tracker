'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from '@/components/Navbar';
import { TreasuryOverview } from '@/components/TreasuryOverview';
import { PaymentMatrix } from '@/components/PaymentMatrix';
import { PayDuesModal } from '@/components/PayDuesModal';
import { MyContributions } from '@/components/MyContributions';
import { FundUtilization } from '@/components/FundUtilization';
import { AdminPortal } from '@/components/AdminPortal';
import { ReceiptModal } from '@/components/ReceiptModal';
import { 
  TreasurySummary, 
  CommitteeSettings, 
  Member, 
  PaymentRecord, 
  ExpenseRecord, 
  MemberMatrixRow 
} from '@/types';
import { ShieldCheck, Heart, RefreshCw } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [year, setYear] = useState<number>(new Date().getFullYear());

  // Data states
  const [summary, setSummary] = useState<TreasurySummary | null>(null);
  const [settings, setSettings] = useState<CommitteeSettings | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [matrix, setMatrix] = useState<MemberMatrixRow[]>([]);
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Admin state
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(false);
  const [adminPin, setAdminPin] = useState<string>('');

  // Modals state
  const [isPayModalOpen, setIsPayModalOpen] = useState<boolean>(false);
  const [payModalInitialMemberId, setPayModalInitialMemberId] = useState<string | undefined>();
  const [payModalInitialMonth, setPayModalInitialMonth] = useState<number | undefined>();
  const [payModalInitialYear, setPayModalInitialYear] = useState<number | undefined>();
  const [receiptPayment, setReceiptPayment] = useState<PaymentRecord | null>(null);

  // Fetch all data
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [treasuryRes, membersRes, paymentsRes, matrixRes, expensesRes] = await Promise.all([
        fetch('/api/treasury'),
        fetch('/api/members'),
        fetch('/api/payments'),
        fetch(`/api/matrix?year=${year}`),
        fetch('/api/expenses')
      ]);

      const treasuryData = await treasuryRes.json();
      const membersData = await membersRes.json();
      const paymentsData = await paymentsRes.json();
      const matrixData = await matrixRes.json();
      const expensesData = await expensesRes.json();

      setSummary(treasuryData.summary || null);
      setSettings(treasuryData.settings || null);
      setMembers(membersData.members || []);
      setPayments(paymentsData.payments || []);
      setMatrix(matrixData.matrix || []);
      setExpenses(expensesData.expenses || []);
    } catch (error) {
      console.error('Failed to fetch committee data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [year]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handlers
  const handleOpenPayModal = (memberId?: string, month?: number, yearVal?: number) => {
    setPayModalInitialMemberId(memberId);
    setPayModalInitialMonth(month);
    setPayModalInitialYear(yearVal);
    setIsPayModalOpen(true);
  };

  const handleTabChange = (tabId: string) => {
    if (tabId === 'pay') {
      handleOpenPayModal();
    } else {
      setActiveTab(tabId);
    }
  };

  const handleAdminLoginSuccess = (pin: string) => {
    setIsAdminLoggedIn(true);
    setAdminPin(pin);
    setActiveTab('admin');
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    setAdminPin('');
    setActiveTab('overview');
  };

  const handleDeleteExpense = async (expenseId: string) => {
    if (!isAdminLoggedIn || !adminPin) return;
    if (!confirm('Are you sure you want to delete this expense record?')) return;

    try {
      const res = await fetch(`/api/expenses?id=${expenseId}&adminPin=${adminPin}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchData();
      }
    } catch (e) {
      console.error('Delete expense error:', e);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/70 flex flex-col font-sans antialiased text-slate-900">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        summary={summary}
        settings={settings}
        isAdminLoggedIn={isAdminLoggedIn}
        onAdminClick={() => setActiveTab('admin')}
        pendingApprovals={summary?.pendingApprovalsCount || 0}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {isLoading && !summary ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin" />
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Loading Committee Treasury Ledger...
            </p>
          </div>
        ) : (
          <>
            {activeTab === 'overview' && (
              <TreasuryOverview
                summary={summary}
                settings={settings}
                onPayClick={() => handleOpenPayModal()}
                onMatrixClick={() => setActiveTab('matrix')}
                onExpensesClick={() => setActiveTab('expenses')}
              />
            )}

            {activeTab === 'matrix' && (
              <PaymentMatrix
                matrix={matrix}
                year={year}
                setYear={setYear}
                settings={settings}
                onSelectPaymentForReceipt={(payment) => setReceiptPayment(payment)}
                onPayForMember={(memberId, month, yearVal) => handleOpenPayModal(memberId, month, yearVal)}
                isAdminLoggedIn={isAdminLoggedIn}
                onOpenAdminVerify={() => setActiveTab('admin')}
              />
            )}

            {activeTab === 'my-ledger' && (
              <MyContributions
                members={members}
                payments={payments}
                settings={settings}
                onPayDues={(memberId, month, yearVal) => handleOpenPayModal(memberId, month, yearVal)}
                onViewReceipt={(payment) => setReceiptPayment(payment)}
              />
            )}

            {activeTab === 'expenses' && (
              <FundUtilization
                expenses={expenses}
                summary={summary}
                isAdminLoggedIn={isAdminLoggedIn}
                onAddExpenseClick={() => setActiveTab('admin')}
                onDeleteExpense={handleDeleteExpense}
              />
            )}

            {activeTab === 'admin' && (
              <AdminPortal
                isAdminLoggedIn={isAdminLoggedIn}
                onLoginSuccess={handleAdminLoginSuccess}
                onLogout={handleAdminLogout}
                adminPin={adminPin}
                members={members}
                payments={payments}
                expenses={expenses}
                settings={settings}
                summary={summary}
                onRefreshData={fetchData}
              />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>{settings?.committeeName || 'Committee'} Transparency Portal • Built with trust & precision</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="font-mono text-[11px] bg-slate-100 px-2 py-1 rounded-md text-slate-600">
              Contribution: ₹{settings?.monthlyAmount || 1000}/mo
            </span>
            <button
              onClick={fetchData}
              className="hover:text-emerald-700 flex items-center gap-1 font-semibold transition cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh Data
            </button>
          </div>
        </div>
      </footer>

      {/* Global Modals */}
      <PayDuesModal
        isOpen={isPayModalOpen}
        onClose={() => setIsPayModalOpen(false)}
        members={members}
        settings={settings}
        initialMemberId={payModalInitialMemberId}
        initialMonth={payModalInitialMonth}
        initialYear={payModalInitialYear}
        onPaymentSuccess={fetchData}
      />

      <ReceiptModal
        payment={receiptPayment}
        settings={settings}
        onClose={() => setReceiptPayment(null)}
      />
    </div>
  );
}
