import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from './context/AuthContext';
import { api } from './api/client';
import AuthView from './components/views/AuthView';
import Navbar from './components/common/Navbar';
import WalletDashboardView from './components/views/WalletDashboardView';
import SavingsHubView from './components/views/SavingsHubView';
import SavingsPlanDetailView from './components/views/SavingsPlanDetailView';
import FundWalletModal from './components/modals/FundWalletModal';
import SendP2PModal from './components/modals/SendP2PModal';
import CreatePlanModal from './components/modals/CreatePlanModal';
import JoinPlanModal from './components/modals/JoinPlanModal';
import ContributeModal from './components/modals/ContributeModal';
import RequestPaymentModal from './components/modals/RequestPaymentModal';
import NotificationsDrawer from './components/views/NotificationsDrawer';
import Toast from './components/common/Toast';

export default function App() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('wallet'); // 'wallet', 'savings'
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [plans, setPlans] = useState([]);

  // Modals state
  const [fundModalOpen, setFundModalOpen] = useState(false);
  const [p2pModalOpen, setP2pModalOpen] = useState(false);
  const [createPlanModalOpen, setCreatePlanModalOpen] = useState(false);
  const [joinPlanModalOpen, setJoinPlanModalOpen] = useState(false);
  const [contributePlan, setContributePlan] = useState(null);
  const [splitPlanId, setSplitPlanId] = useState(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const fetchPlans = useCallback(async () => {
    if (!user) return;
    try {
      const res = await api.savings.getPlans();
      setPlans(res.plans || []);
    } catch (err) {
      console.error("Failed to load plans:", err);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchPlans();
    }
  }, [user, fetchPlans]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F8FF] flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-[#1D4ED8] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <AuthView />
        <Toast />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F8FF] text-[#0F172A] flex flex-col pb-16 lg:pb-0">
      {/* Sticky Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setSelectedPlanId(null);
        }}
        onOpenFund={() => setFundModalOpen(true)}
        onOpenP2P={() => setP2pModalOpen(true)}
        onOpenNotifications={() => setNotificationsOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {selectedPlanId ? (
          <SavingsPlanDetailView
            planId={selectedPlanId}
            onBack={() => {
              setSelectedPlanId(null);
              fetchPlans();
            }}
            onOpenContribute={(plan) => setContributePlan(plan)}
            onOpenSplit={(id) => setSplitPlanId(id)}
          />
        ) : activeTab === 'wallet' ? (
          <WalletDashboardView
            plans={plans}
            onOpenFund={() => setFundModalOpen(true)}
            onOpenP2P={() => setP2pModalOpen(true)}
            onOpenCreatePlan={() => setCreatePlanModalOpen(true)}
            onOpenJoinPlan={() => setJoinPlanModalOpen(true)}
            onSelectPlan={(id) => setSelectedPlanId(id)}
          />
        ) : (
          <SavingsHubView
            plans={plans}
            onSelectPlan={(id) => setSelectedPlanId(id)}
            onOpenCreate={() => setCreatePlanModalOpen(true)}
            onOpenJoin={() => setJoinPlanModalOpen(true)}
          />
        )}
      </main>

      {/* Global Modals */}
      <FundWalletModal
        isOpen={fundModalOpen}
        onClose={() => {
          setFundModalOpen(false);
          fetchPlans();
        }}
      />

      <SendP2PModal
        isOpen={p2pModalOpen}
        onClose={() => setP2pModalOpen(false)}
      />

      <CreatePlanModal
        isOpen={createPlanModalOpen}
        onClose={() => setCreatePlanModalOpen(false)}
        onPlanCreated={(plan) => {
          fetchPlans();
          setSelectedPlanId(plan.id);
        }}
      />

      <JoinPlanModal
        isOpen={joinPlanModalOpen}
        onClose={() => setJoinPlanModalOpen(false)}
        onJoined={(id) => {
          fetchPlans();
          setSelectedPlanId(id);
        }}
      />

      <ContributeModal
        isOpen={!!contributePlan}
        plan={contributePlan}
        onClose={() => {
          setContributePlan(null);
          fetchPlans();
        }}
        onContributed={() => {
          fetchPlans();
        }}
      />

      <RequestPaymentModal
        isOpen={!!splitPlanId}
        planId={splitPlanId}
        onClose={() => setSplitPlanId(null)}
        onCreated={() => {
          fetchPlans();
        }}
      />

      <NotificationsDrawer
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
      />

      <Toast />
    </div>
  );
}
