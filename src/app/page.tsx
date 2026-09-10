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
import { LoginScreen } from '@/components/LoginScreen';
import { ChangePasswordModal } from '@/components/ChangePasswordModal';
import { 
  TreasurySummary, 
  CommitteeSettings, 
  Member, 
  PaymentRecord, 
  ExpenseRecord, 
  MemberMatrixRow,
  AuthUser 
} from '@/types';
import { ShieldCheck, RefreshCw } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [year, setYear] = useState<number>(new Date().getFullYear());

  // Auth state
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [adminPin, setAdminPin] = useState<string>('');
  const [isAuthChecking, setIsAuthChecking] = useState<boolean>(true);

  // Data states
  const [summary, setSummary] = useState<TreasurySummary | null>(null);
  const [settings, setSettings] = useState<CommitteeSettings | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [matrix, setMatrix] = useState<MemberMatrixRow[]>([]);
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modals state
  const [isPayModalOpen, setIsPayModalOpen] = useState<boolean>(false);
  const [payModalInitialMemberId, setPayModalInitialMemberId] = useState<string | undefined>();
  const [payModalInitialMonth, setPayModalInitialMonth] = useState<number | undefined>();
  const [payModalInitialYear, setPayModalInitialYear] = useState<number | undefined>();
  const [receiptPayment, setReceiptPayment] = useState<PaymentRecord | null>(null);
  const [isChangePassOpen, setIsChangePassOpen] = useState<boolean>(false);

  // Load saved user session on mount
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('samiti_auth_user');
      const savedPin = localStorage.getItem('samiti_admin_pin');
      if (savedUser) {
        const parsed = JSON.parse(savedUser) as AuthUser;
        setCurrentUser(parsed);
        if (savedPin) setAdminPin(savedPin);
      }
    } catch (e) {
      console.error('Failed to parse saved session:', e);
    } finally {
      setIsAuthChecking(false);
    }
  }, []);

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
  const handleLoginSuccess = (user: AuthUser, adminSecret?: string) => {
    setCurrentUser(user);
    if (adminSecret) setAdminPin(adminSecret);

    try {
      localStorage.setItem('samiti_auth_user', JSON.stringify(user));
      if (adminSecret) localStorage.setItem('samiti_admin_pin', adminSecret);
    } catch (e) {
      console.error('Failed to save session:', e);
    }

    if (user.role === 'ADMIN') {
      setActiveTab('overview');
    } else {
      setActiveTab('overview');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setAdminPin('');
    try {
      localStorage.removeItem('samiti_auth_user');
      localStorage.removeItem('samiti_admin_pin');
    } catch (e) {
      console.error('Failed to clear session:', e);
    }
  };

  const handleOpenPayModal = (memberId?: string, month?: number, yearVal?: number) => {
    const targetMemberId = memberId || (currentUser?.role === 'MEMBER' ? currentUser.id : undefined);
    setPayModalInitialMemberId(targetMemberId);
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

  const handleDeleteExpense = async (expenseId: string) => {
    if (currentUser?.role !== 'ADMIN' || !adminPin) return;
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

  // If session is checking
  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  // IF NOT LOGGED IN: SHOW PRIVATE LOGIN GATE
  if (!currentUser) {
    return (
      <LoginScreen
        settings={settings}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  // IF LOGGED IN: SHOW FULL APPLICATION
  const isAdmin = currentUser.role === 'ADMIN';

  return (
    <div className="min-h-screen bg-slate-100/70 flex flex-col font-sans antialiased text-slate-900">
      {/* Top Header & Bottom Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        summary={summary}
        settings={settings}
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenChangePassword={() => setIsChangePassOpen(true)}
        pendingApprovals={summary?.pendingApprovalsCount || 0}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 pt-3 pb-24 sm:py-8">
        {isLoading && !summary ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin" />
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Loading Verified Committee Ledger...
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
                isAdminLoggedIn={isAdmin}
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
                isAdminLoggedIn={isAdmin}
                onAddExpenseClick={() => setActiveTab('admin')}
                onDeleteExpense={handleDeleteExpense}
              />
            )}

            {activeTab === 'admin' && isAdmin && (
              <AdminPortal
                isAdminLoggedIn={true}
                onLoginSuccess={() => {}}
                onLogout={handleLogout}
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
      <footer className="bg-white border-t border-slate-200 py-6 mt-8 sm:mt-12 pb-24 sm:pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>{settings?.committeeName || 'Committee'} • Signed in as <strong>{currentUser.name}</strong> ({isAdmin ? 'Admin' : 'Member'})</span>
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
              Refresh
            </button>
            <button
              onClick={handleLogout}
              className="text-rose-600 hover:text-rose-700 font-bold transition cursor-pointer"
            >
              Sign Out
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

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isChangePassOpen}
        onClose={() => setIsChangePassOpen(false)}
        onPasswordChanged={(newPass) => {
          setAdminPin(newPass);
          localStorage.setItem('samiti_admin_pin', newPass);
        }}
      />
    </div>
  );
}
