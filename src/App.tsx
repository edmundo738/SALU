/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { AppShell } from './components/AppShell';
import {
  CreateServiceRequest,
  CustomerDashboard,
  CustomerProfileView,
  ProfessionalDiscovery,
} from './components/CustomerViews';
import {
  AccountSettings,
  FavoritesAndContacts,
  NotificationsCenter,
  ReviewsAndReputation,
  SafetyAndModeration,
} from './components/EcosystemViews';
import { LandingPage } from './components/LandingPage';
import { MessagingView } from './components/MessagingView';
import {
  AuthScreen,
  OnboardingFlow,
  ProviderProfileBuilder,
} from './components/OnboardingAndAuth';
import {
  OpportunityDiscovery,
  ProposalSubmissionModal,
  ProviderDashboard,
} from './components/ProviderViews';
import {
  ProfessionalProfileDetail,
  RequestDetailAndTracking,
  RequestsManagementList,
} from './components/WorkflowViews';
import { SplashScreen } from './components/ui/SplashScreen';
import { InteractiveOnboardingWizard } from './components/ui/InteractiveOnboardingWizard';
import { saluApi } from './lib/api';
import {
  INITIAL_CONVERSATIONS,
  INITIAL_CUSTOMERS,
  INITIAL_MODERATION_CASES,
  INITIAL_NOTIFICATIONS,
  INITIAL_PROFESSIONALS,
  INITIAL_PROVIDER_DRAFT,
  INITIAL_REQUESTS,
  INITIAL_REVIEWS,
} from './data/saluData';
import { Language, LanguageProvider } from './i18n/translations';
import {
  Agreement,
  Conversation,
  CustomerSummary,
  ModerationCase,
  NotificationItem,
  Professional,
  Proposal,
  ProviderProfileDraft,
  ReviewItem,
  ScreenId,
  ServiceRequest,
  UserRole,
  UrgencyLevel,
  RequestState,
} from './types/salu';

export function App() {
  const getScreenFromPath = (): ScreenId => {
    const path = window.location.pathname;
    if (path === '/entrar' || path === '/login') return 'auth';
    if (path === '/painel' || path === '/dashboard') return 'dashboard';
    if (path === '/explorar') return 'discover-pros';
    if (path === '/oportunidades') return 'opportunities';
    if (path === '/pedidos') return 'requests';
    if (path === '/publicar-pedido') return 'create-request';
    if (path === '/mensagens') return 'messages';
    if (path === '/notificacoes') return 'notifications';
    if (path === '/seguranca') return 'safety';
    if (path === '/confianca') return 'reviews';
    if (path === '/favoritos') return 'favorites';
    if (path === '/definicoes') return 'settings';
    return 'landing';
  };

  const [lang, setLang] = useState<Language>('pt');
  const [darkMode, setDarkMode] = useState(false);
  const [screen, setScreen] = useState<ScreenId>(getScreenFromPath);
  const [authMode, setAuthMode] = useState<'signin' | 'register'>('signin');
  const [activeRole, setActiveRole] = useState<UserRole>('customer');
  const [userName, setUserName] = useState(() => localStorage.getItem('salu_user_name') || 'Edmundo Bunga');
  const [currentUserId, setCurrentUserId] = useState<string>('cust-1');
  const [municipality, setMunicipality] = useState('Talatona, Luanda');
  const [showSplash, setShowSplash] = useState(true);
  const [showOnboardingWizard, setShowOnboardingWizard] = useState(false);

  const [professionals, setProfessionals] = useState<Professional[]>(INITIAL_PROFESSIONALS);
  const [customers, setCustomers] = useState<CustomerSummary[]>(INITIAL_CUSTOMERS);
  const [requests, setRequests] = useState<ServiceRequest[]>(INITIAL_REQUESTS);
  const [conversations, setConversations] = useState<Conversation[]>(INITIAL_CONVERSATIONS);
  const [reviews, setReviews] = useState<ReviewItem[]>(INITIAL_REVIEWS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [moderationCases, setModerationCases] = useState<ModerationCase[]>(INITIAL_MODERATION_CASES);
  const [providerDraft, setProviderDraft] = useState<ProviderProfileDraft>(INITIAL_PROVIDER_DRAFT);

  const [selectedRequestId, setSelectedRequestId] = useState<string>(INITIAL_REQUESTS[0].id);
  const [selectedProId, setSelectedProId] = useState<string>(INITIAL_PROFESSIONALS[0].id);
  const [activeConvId, setActiveConvId] = useState<string>(INITIAL_CONVERSATIONS[0].id);
  const [discoverInitialSearch, setDiscoverInitialSearch] = useState<string>('');
  const [discoverInitialCategory, setDiscoverInitialCategory] = useState<string>('ALL');
  const [discoverInitialMunicipality, setDiscoverInitialMunicipality] = useState<string>('ALL');
  const [createRequestInitialTitle, setCreateRequestInitialTitle] = useState<string>('');
  const [proposalTargetReq, setProposalTargetReq] = useState<ServiceRequest | null>(null);
  const [reportSubjectDraft, setReportSubjectDraft] = useState<string>('');

  useEffect(() => {
    const map: Record<ScreenId, string> = {
      'landing': '/',
      'auth': '/entrar',
      'onboarding': '/perfil/novo',
      'dashboard': '/painel',
      'create-request': '/publicar-pedido',
      'discover-pros': '/explorar',
      'opportunities': '/oportunidades',
      'profile-detail': `/perfil/${selectedProId}`,
      'customer-profile': '/perfil/cliente',
      'provider-onboarding': '/perfil/novo',
      'requests': '/pedidos',
      'request-detail': `/pedidos/${selectedRequestId}`,
      'messages': '/mensagens',
      'reviews': '/confianca',
      'favorites': '/favoritos',
      'notifications': '/notificacoes',
      'safety': '/seguranca',
      'settings': '/definicoes',
    };
    const target = map[screen] || '/';
    if (window.location.pathname !== target) {
      window.history.pushState(null, '', target);
    }
  }, [screen, selectedRequestId, selectedProId]);

  useEffect(() => {
    const onPop = () => {
      setScreen(getScreenFromPath());
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    saluApi.getRequests()
      .then((data) => {
        if (data.success && data.requests && data.requests.length > 0) {
          const urgencyMap: Record<string, UrgencyLevel> = {
            'URGENT': 'Urgent (48h)',
            'NORMAL': 'This Week',
          };
          const mapped: ServiceRequest[] = data.requests.map((r) => ({
            id: r.id,
            title: r.title,
            category: r.category,
            description: r.description,
            location: r.municipality,
            municipality: r.municipality,
            distanceKm: 2.5,
            budgetKz: r.budget_amount > 0 ? r.budget_amount : undefined,
            urgency: urgencyMap[r.urgency] || 'This Week',
            availability: 'Disponibilidade flexível',
            state: (r.status === 'OPEN' ? 'OPEN' : r.status === 'COMPLETED' ? 'COMPLETED' : 'IN_PROGRESS') as RequestState,
            createdAt: r.created_at.slice(0, 10),
            customerId: r.user_id,
            customerName: r.user_name,
            customerReliabilityScore: 95,
            photos: [],
            proposals: [],
            customerConfirmedCompletion: r.status === 'COMPLETED',
            providerConfirmedCompletion: r.status === 'COMPLETED',
            timeline: [
              {
                id: `tl-${r.id}`,
                label: 'Pedido Publicado',
                detail: `Registado em ${r.municipality}`,
                timestamp: r.created_at.slice(0, 10),
                actor: r.user_name,
              },
            ],
          }));

          setRequests((prev) => {
            const apiIds = new Set(mapped.map((m) => m.id));
            const remaining = prev.filter((p) => !apiIds.has(p.id));
            return [...mapped, ...remaining];
          });
        }
      })
      .catch((err) => {
        console.warn('Backend requests load fallback:', err);
      });
  }, []);

  const unreadMessages = conversations.reduce((sum, c) => sum + c.unreadCount, 0);
  const unreadNotifications = notifications.filter((n) => !n.read).length;

  const pushNotification = (
    item: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>
  ) => {
    setNotifications((prev) => [
      {
        ...item,
        id: `notif-${Date.now()}`,
        timestamp: 'Just now',
        read: false,
      },
      ...prev,
    ]);
  };

  // Navigation helpers
  const openRequestDetail = (id: string) => {
    setSelectedRequestId(id);
    setScreen('request-detail');
  };

  const openProfessionalDetail = (id: string) => {
    setSelectedProId(id);
    setScreen('profile-detail');
  };

  const handleSwitchRole = (role: UserRole) => {
    setActiveRole(role);
    setDiscoverInitialSearch('');
    setDiscoverInitialCategory('ALL');
    setDiscoverInitialMunicipality('ALL');
    if (
      ['create-request', 'discover-pros', 'opportunities', 'provider-onboarding'].includes(
        screen
      )
    ) {
      setScreen('dashboard');
    }
  };

  const handleToggleFavoritePro = (id: string) => {
    setProfessionals((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isFavorite: !p.isFavorite } : p))
    );
  };

  const handleStartChatWithPro = (pro: Professional) => {
    const existing = conversations.find((c) => c.otherPartyId === pro.id);
    if (existing) {
      setActiveConvId(existing.id);
      setScreen('messages');
      return;
    }
    const newConv: Conversation = {
      id: `conv-${Date.now()}`,
      requestId: requests[0]?.id || 'req-101',
      requestTitle: requests[0]?.title || 'General Service Inquiry',
      otherPartyId: pro.id,
      otherPartyName: pro.name,
      otherPartyRoleLabel: pro.profession,
      otherPartyAvatar: pro.avatarUrl,
      otherPartyLocation: pro.location,
      lastMessageAt: 'Just now',
      unreadCount: 0,
      whatsappAvailable: Boolean(pro.whatsappNumber),
      messages: [
        {
          id: `msg-${Date.now()}`,
          senderRole: 'customer',
          senderName: userName,
          text: `Hello ${pro.name.split(' ')[0]}, I would like to discuss a service request in ${municipality}.`,
          timestamp: 'Just now',
        },
      ],
    };
    setConversations((prev) => [newConv, ...prev]);
    setActiveConvId(newConv.id);
    setScreen('messages');
  };

  const handleOpenChatForRequest = (
    requestId: string,
    partyName: string,
    partyId: string
  ) => {
    const existing = conversations.find(
      (c) => c.requestId === requestId || c.otherPartyId === partyId
    );
    if (existing) {
      setActiveConvId(existing.id);
      setScreen('messages');
      return;
    }
    const req = requests.find((r) => r.id === requestId);
    const pro = professionals.find((p) => p.id === partyId);
    const newConv: Conversation = {
      id: `conv-${Date.now()}`,
      requestId,
      requestTitle: req?.title || 'Service Discussion',
      otherPartyId: partyId,
      otherPartyName: partyName,
      otherPartyRoleLabel: pro?.profession || 'Service Specialist',
      otherPartyAvatar: pro?.avatarUrl || '',
      otherPartyLocation: pro?.location || municipality,
      lastMessageAt: 'Just now',
      unreadCount: 0,
      whatsappAvailable: true,
      messages: [
        {
          id: `msg-${Date.now()}`,
          senderRole: activeRole,
          senderName: userName,
          text: `Opening conversation regarding "${req?.title || 'your request'}".`,
          timestamp: 'Just now',
        },
      ],
    };
    setConversations((prev) => [newConv, ...prev]);
    setActiveConvId(newConv.id);
    setScreen('messages');
  };

  const handleSendMessage = (
    conversationId: string,
    text: string,
    attachmentName?: string
  ) => {
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== conversationId) return c;
        return {
          ...c,
          lastMessageAt: 'Just now',
          unreadCount: 0,
          messages: [
            ...c.messages,
            {
              id: `msg-${Date.now()}`,
              senderRole: activeRole,
              senderName: userName,
              text,
              timestamp: 'Just now',
              attachmentName,
            },
          ],
        };
      })
    );

    saluApi.sendMessage(conversationId, {
      sender_id: currentUserId,
      sender_name: userName,
      sender_role: activeRole,
      text,
    }).catch((err) => console.warn('Could not sync message to backend:', err));
  };

  const handleCreateRequest = (
    draft: Omit<
      ServiceRequest,
      | 'id'
      | 'createdAt'
      | 'proposals'
      | 'timeline'
      | 'customerConfirmedCompletion'
      | 'providerConfirmedCompletion'
      | 'customerId'
      | 'customerName'
      | 'customerReliabilityScore'
    >
  ) => {
    const newReq: ServiceRequest = {
      ...draft,
      id: `req-${Math.floor(110 + Math.random() * 800)}`,
      createdAt: '2026-11-20',
      customerId: currentUserId,
      customerName: userName,
      customerReliabilityScore: 96,
      proposals: [],
      customerConfirmedCompletion: false,
      providerConfirmedCompletion: false,
      timeline: [
        {
          id: `tl-${Date.now()}`,
          label: draft.state === 'DRAFT' ? 'Saved as Draft' : 'Request Published',
          detail:
            draft.state === 'DRAFT'
              ? 'Stored privately until you choose to publish.'
              : `Visible to ${draft.category} providers near ${draft.municipality}.`,
          timestamp: 'Just now',
          actor: userName,
        },
      ],
    };
    setRequests((prev) => [newReq, ...prev]);
    pushNotification({
      category: 'request',
      title:
        draft.state === 'DRAFT'
          ? 'Draft Request Saved'
          : 'Service Request Published',
      description: newReq.title,
      targetScreen: 'request-detail',
      targetId: newReq.id,
    });
    setSelectedRequestId(newReq.id);
    setCreateRequestInitialTitle('');
    setScreen('request-detail');

    saluApi.createRequest({
      user_id: currentUserId,
      user_name: userName,
      title: draft.title,
      category: draft.category,
      municipality: draft.municipality,
      description: draft.description,
      budget_type: draft.budgetKz ? 'FIXED' : 'INSPECTION_NEEDED',
      budget_amount: draft.budgetKz || 0,
      urgency: draft.urgency === 'Urgent (48h)' ? 'URGENT' : 'NORMAL',
    }).catch((err) => console.warn('Could not sync request to backend:', err));
  };

  const handleSubmitProposal = (
    requestId: string,
    proposalInput: Omit<Proposal, 'id' | 'submittedAt' | 'status'>
  ) => {
    const newProposal: Proposal = {
      ...proposalInput,
      id: `prop-${Date.now()}`,
      submittedAt: '2026-11-20 Just now',
      status: 'PENDING',
    };
    setRequests((prev) =>
      prev.map((r) => {
        if (r.id !== requestId) return r;
        const nextState = r.state === 'OPEN' ? 'PROPOSALS_RECEIVED' : r.state;
        return {
          ...r,
          state: nextState,
          proposals: [...r.proposals, newProposal],
          timeline: [
            ...r.timeline,
            {
              id: `tl-${Date.now()}`,
              label: 'New Proposal Submitted',
              detail: `${proposalInput.providerName} proposed ${proposalInput.suggestedPriceKz.toLocaleString('en-US')} Kz (${proposalInput.estimatedDays} days).`,
              timestamp: 'Just now',
              actor: proposalInput.providerName,
            },
          ],
        };
      })
    );
    pushNotification({
      category: 'proposal',
      title: 'Proposal Submitted',
      description: `Sent to ${proposalTargetReq?.customerName || 'Customer'}.`,
      targetScreen: 'request-detail',
      targetId: requestId,
    });
    setProposalTargetReq(null);
    setSelectedRequestId(requestId);
    setScreen('request-detail');

    saluApi.submitProposal(requestId, {
      provider_id: proposalInput.providerId || currentUserId,
      provider_name: proposalInput.providerName,
      provider_profession: proposalInput.providerProfession,
      amount: proposalInput.suggestedPriceKz,
      is_inspection_needed: false,
      estimated_days: proposalInput.estimatedDays,
      message: proposalInput.message || proposalInput.approach,
    }).catch((err) => console.warn('Could not sync proposal to backend:', err));
  };

  const handleAcceptProposalToNegotiate = (requestId: string, proposal: Proposal) => {
    setRequests((prev) =>
      prev.map((r) => {
        if (r.id !== requestId) return r;
        const newAgreement: Agreement = {
          id: `agr-${Date.now()}`,
          requestId,
          providerId: proposal.providerId,
          providerName: proposal.providerName,
          customerName: r.customerName,
          agreedPriceKz: proposal.suggestedPriceKz,
          hidePricePublicly: true,
          scopeOfWork: proposal.approach,
          deadline: '2026-11-27',
          location: r.location,
          providerResponsibilities: 'Supply required tools, execute agreed scope safely, and test before handover.',
          customerResponsibilities: 'Provide site access during agreed availability window.',
          additionalConditions: 'Agreed price remains confidential inside SALU.',
          customerAccepted: true,
          providerAccepted: false,
        };
        return {
          ...r,
          state: 'NEGOTIATING',
          proposals: r.proposals.map((p) =>
            p.id === proposal.id ? { ...p, status: 'NEGOTIATING' } : p
          ),
          agreement: newAgreement,
          timeline: [
            ...r.timeline,
            {
              id: `tl-${Date.now()}`,
              label: 'Negotiation & Draft Agreement',
              detail: `Draft agreement opened with ${proposal.providerName}.`,
              timestamp: 'Just now',
              actor: userName,
            },
          ],
        };
      })
    );
  };

  const handleDeclineProposal = (requestId: string, proposalId: string) => {
    setRequests((prev) =>
      prev.map((r) => {
        if (r.id !== requestId) return r;
        return {
          ...r,
          proposals: r.proposals.map((p) =>
            p.id === proposalId ? { ...p, status: 'DECLINED' } : p
          ),
        };
      })
    );
  };

  const handleUpdateAgreement = (requestId: string, updated: Agreement) => {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              agreement: {
                ...updated,
                customerAccepted: activeRole === 'customer',
                providerAccepted: activeRole === 'provider',
              },
              timeline: [
                ...r.timeline,
                {
                  id: `tl-${Date.now()}`,
                  label: 'Agreement Terms Updated',
                  detail: 'Terms adjusted; awaiting bilateral acceptance.',
                  timestamp: 'Just now',
                  actor: userName,
                },
              ],
            }
          : r
      )
    );
  };

  const handleAcceptAgreement = (requestId: string, role: UserRole) => {
    setRequests((prev) =>
      prev.map((r) => {
        if (r.id !== requestId || !r.agreement) return r;
        const custAcc = role === 'customer' ? true : r.agreement.customerAccepted;
        const provAcc = role === 'provider' ? true : r.agreement.providerAccepted;
        const both = custAcc && provAcc;
        return {
          ...r,
          state: both ? 'AGREEMENT_CONFIRMED' : 'NEGOTIATING',
          proposals: both
            ? r.proposals.map((p) =>
                p.providerId === r.agreement?.providerId
                  ? { ...p, status: 'ACCEPTED' }
                  : p
              )
            : r.proposals,
          agreement: {
            ...r.agreement,
            customerAccepted: custAcc,
            providerAccepted: provAcc,
            confirmedAt: both ? '2026-11-20' : undefined,
          },
          timeline: [
            ...r.timeline,
            {
              id: `tl-${Date.now()}`,
              label: both ? 'Agreement Confirmed by Both Parties' : 'Agreement Accepted',
              detail: both
                ? 'Scope, deadline, and private price locked by customer and provider.'
                : `${role === 'customer' ? 'Customer' : 'Provider'} accepted the terms.`,
              timestamp: 'Just now',
              actor: userName,
            },
          ],
        };
      })
    );
  };

  const handleStartWork = (requestId: string) => {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              state: 'IN_PROGRESS',
              timeline: [
                ...r.timeline,
                {
                  id: `tl-${Date.now()}`,
                  label: 'Work In Progress',
                  detail: 'Provider started work on site.',
                  timestamp: 'Just now',
                  actor: userName,
                },
              ],
            }
          : r
      )
    );
  };

  const handleMarkComplete = (requestId: string, role: UserRole) => {
    setRequests((prev) =>
      prev.map((r) => {
        if (r.id !== requestId) return r;
        const custDone = role === 'customer' ? true : r.customerConfirmedCompletion;
        const provDone = role === 'provider' ? true : r.providerConfirmedCompletion;
        const bothDone = custDone && provDone;
        return {
          ...r,
          customerConfirmedCompletion: custDone,
          providerConfirmedCompletion: provDone,
          state: bothDone ? 'COMPLETED' : 'COMPLETION_PENDING',
          timeline: [
            ...r.timeline,
            {
              id: `tl-${Date.now()}`,
              label: bothDone
                ? 'Service Completed & Verified'
                : 'Completion Confirmation Logged',
              detail: bothDone
                ? 'Both parties confirmed completion. Bilateral reviews unlocked.'
                : `${role === 'customer' ? 'Customer' : 'Provider'} confirmed completion; awaiting counterparty.`,
              timestamp: 'Just now',
              actor: userName,
            },
          ],
        };
      })
    );
  };

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  if (showOnboardingWizard) {
    return (
      <LanguageProvider lang={lang} setLang={setLang}>
        <InteractiveOnboardingWizard
          initialRole={activeRole}
          onComplete={(data) => {
            setActiveRole(data.role);
            setMunicipality(data.municipality);
            setShowOnboardingWizard(false);
            setScreen('dashboard');
          }}
          onSkip={() => {
            setShowOnboardingWizard(false);
            setScreen('dashboard');
          }}
        />
      </LanguageProvider>
    );
  }

  if (screen === 'landing') {
    return (
      <LanguageProvider lang={lang} setLang={setLang}>
        <LandingPage
          darkMode={darkMode}
          onToggleDark={() => setDarkMode((d) => !d)}
          onOpenAuth={(mode = 'signin') => {
            setAuthMode(mode);
            setScreen('auth');
          }}
          onStartRole={(role) => {
            setActiveRole(role);
            setShowOnboardingWizard(true);
          }}
          onQuickExplore={(role, searchQuery = '', category = 'ALL', area = 'ALL') => {
            const hasFilter =
              Boolean(searchQuery.trim()) ||
              (Boolean(category) && category !== 'ALL') ||
              (Boolean(area) && area !== 'ALL');
            setActiveRole(role);
            setDiscoverInitialSearch(searchQuery);
            setDiscoverInitialCategory(category || 'ALL');
            setDiscoverInitialMunicipality(area || 'ALL');
            if (role === 'customer' && hasFilter) {
              setScreen('discover-pros');
            } else {
              setScreen('dashboard');
            }
          }}
        />
      </LanguageProvider>
    );
  }

  if (screen === 'auth') {
    return (
      <LanguageProvider lang={lang} setLang={setLang}>
        <AuthScreen
          key={authMode}
          initialMode={authMode}
          onBackToLanding={() => setScreen('landing')}
          onCompleteAuth={(name, role, goToOnboarding) => {
            setUserName(name);
            setActiveRole(role);
            if (goToOnboarding) {
              setShowOnboardingWizard(true);
            } else {
              setScreen('dashboard');
            }
          }}
        />
      </LanguageProvider>
    );
  }

  if (screen === 'onboarding') {
    return (
      <LanguageProvider lang={lang} setLang={setLang}>
        <OnboardingFlow
          initialRole={activeRole}
          userName={userName}
          onSkip={() => setScreen('dashboard')}
          onFinishOnboarding={({ role, municipality: area, openProviderBuilder }) => {
            setActiveRole(role);
            setMunicipality(area);
            setScreen(openProviderBuilder ? 'provider-onboarding' : 'dashboard');
          }}
        />
      </LanguageProvider>
    );
  }

  const activeRequest =
    requests.find((r) => r.id === selectedRequestId) || requests[0];
  const activePro =
    professionals.find((p) => p.id === selectedProId) || professionals[0];

  const activeRequestsCount = requests.filter(
    (r) => !['COMPLETED', 'CANCELLED'].includes(r.state)
  ).length;

  return (
    <LanguageProvider lang={lang} setLang={setLang}>
    <AppShell
      activeRole={activeRole}
      activeScreen={screen}
      userName={userName}
      municipality={municipality}
      activeRequestsCount={activeRequestsCount}
      unreadMessages={unreadMessages}
      unreadNotifications={unreadNotifications}
      darkMode={darkMode}
      onToggleDark={() => setDarkMode((d) => !d)}
      onSwitchRole={handleSwitchRole}
      onNavigate={(s) => setScreen(s)}
      onGlobalSearch={(query) => {
        setDiscoverInitialSearch(query);
        setDiscoverInitialCategory('ALL');
        setDiscoverInitialMunicipality('ALL');
        setScreen(activeRole === 'customer' ? 'discover-pros' : 'opportunities');
      }}
      onChangeMunicipality={(area) => setMunicipality(area)}
      onBackToLanding={() => setScreen('landing')}
    >
      {screen === 'dashboard' && activeRole === 'customer' && (
        <CustomerDashboard
          userName={userName}
          municipality={municipality}
          requests={requests}
          professionals={professionals}
          notifications={notifications}
          onNavigate={setScreen}
          onSelectRequest={openRequestDetail}
          onSelectProfessional={openProfessionalDetail}
          onSelectCategorySearch={(cat) => {
            setDiscoverInitialSearch('');
            setDiscoverInitialCategory(cat || 'ALL');
            setDiscoverInitialMunicipality('ALL');
            setScreen('discover-pros');
          }}
          onStartChat={handleStartChatWithPro}
          onToggleFavoritePro={handleToggleFavoritePro}
          onStartRequestWithTitle={(title) => {
            setCreateRequestInitialTitle(title);
            setScreen('create-request');
          }}
        />
      )}

      {screen === 'dashboard' && activeRole === 'provider' && (
        <ProviderDashboard
          profileDraft={providerDraft}
          requests={requests}
          reviews={reviews}
          notifications={notifications}
          onNavigate={setScreen}
          onSelectRequest={openRequestDetail}
          onOpenProposalModal={(req) => setProposalTargetReq(req)}
        />
      )}

      {screen === 'create-request' && (
        <CreateServiceRequest
          defaultMunicipality={municipality}
          initialTitle={createRequestInitialTitle}
          onCreateRequest={handleCreateRequest}
          onCancel={() => {
            setCreateRequestInitialTitle('');
            setScreen('dashboard');
          }}
        />
      )}

      {screen === 'discover-pros' && (
        <ProfessionalDiscovery
          professionals={professionals}
          initialSearch={discoverInitialSearch}
          initialCategory={discoverInitialCategory}
          initialMunicipality={discoverInitialMunicipality}
          onSelectProfessional={openProfessionalDetail}
          onToggleFavorite={handleToggleFavoritePro}
          onStartChat={handleStartChatWithPro}
        />
      )}

      {screen === 'opportunities' && (
        <OpportunityDiscovery
          requests={requests}
          initialSearch={discoverInitialSearch}
          onSelectRequest={openRequestDetail}
          onOpenProposalModal={(req) => setProposalTargetReq(req)}
        />
      )}

      {screen === 'provider-onboarding' && (
        <ProviderProfileBuilder
          draft={providerDraft}
          onSave={(updated) => setProviderDraft(updated)}
          onCancel={() => setScreen('dashboard')}
        />
      )}

      {screen === 'customer-profile' && (
        <CustomerProfileView
          customer={{
            ...customers[0],
            name: userName,
            location: municipality,
          }}
          requests={requests}
          reviews={reviews}
          onSwitchToProvider={() => {
            setActiveRole('provider');
            setScreen('provider-onboarding');
          }}
          onSelectRequest={openRequestDetail}
        />
      )}

      {screen === 'profile-detail' && (
        <ProfessionalProfileDetail
          professional={activePro}
          reviews={reviews}
          onBack={() => setScreen('discover-pros')}
          onToggleFavorite={(id) =>
            setProfessionals((prev) =>
              prev.map((p) => (p.id === id ? { ...p, isFavorite: !p.isFavorite } : p))
            )
          }
          onStartChat={handleStartChatWithPro}
          onInviteToRequest={() => setScreen('create-request')}
          onReportUser={(name) => {
            setReportSubjectDraft(name);
            setScreen('safety');
          }}
        />
      )}

      {screen === 'requests' && (
        <RequestsManagementList
          requests={requests}
          activeRole={activeRole}
          onSelectRequest={openRequestDetail}
          onCreateRequest={() => setScreen('create-request')}
          onBrowseOpportunities={() => setScreen('opportunities')}
        />
      )}

      {screen === 'request-detail' && activeRequest && (
        <RequestDetailAndTracking
          request={activeRequest}
          activeRole={activeRole}
          onBack={() => setScreen('requests')}
          onSelectProfessional={openProfessionalDetail}
          onOpenChat={handleOpenChatForRequest}
          onPublishDraft={(reqId) =>
            setRequests((prev) =>
              prev.map((r) =>
                r.id === reqId
                  ? {
                      ...r,
                      state: 'OPEN',
                      timeline: [
                        ...r.timeline,
                        {
                          id: `tl-${Date.now()}`,
                          label: 'Published to Network',
                          detail: 'Draft published and open for proposals.',
                          timestamp: 'Just now',
                          actor: userName,
                        },
                      ],
                    }
                  : r
              )
            )
          }
          onAcceptProposalToNegotiate={handleAcceptProposalToNegotiate}
          onDeclineProposal={handleDeclineProposal}
          onUpdateAgreement={handleUpdateAgreement}
          onAcceptAgreement={handleAcceptAgreement}
          onStartWork={handleStartWork}
          onMarkComplete={handleMarkComplete}
          onCancelRequest={(reqId) =>
            setRequests((prev) =>
              prev.map((r) =>
                r.id === reqId
                  ? {
                      ...r,
                      state: 'CANCELLED',
                      timeline: [
                        ...r.timeline,
                        {
                          id: `tl-${Date.now()}`,
                          label: 'Request Cancelled',
                          detail: 'Closed by customer prior to completion.',
                          timestamp: 'Just now',
                          actor: userName,
                        },
                      ],
                    }
                  : r
              )
            )
          }
          onReportDispute={(reqId) => {
            setRequests((prev) =>
              prev.map((r) =>
                r.id === reqId
                  ? {
                      ...r,
                      state: 'DISPUTED',
                      timeline: [
                        ...r.timeline,
                        {
                          id: `tl-${Date.now()}`,
                          label: 'Dispute Flagged',
                          detail: 'Moved to SALU Safety & Mediation review.',
                          timestamp: 'Just now',
                          actor: userName,
                        },
                      ],
                    }
                  : r
              )
            );
            setReportSubjectDraft(activeRequest.title);
            setScreen('safety');
          }}
          onGoToReview={() => setScreen('reviews')}
          onOpenProposalModal={(req) => setProposalTargetReq(req)}
        />
      )}

      {screen === 'messages' && (
        <MessagingView
          conversations={conversations}
          activeConversationId={activeConvId}
          requests={requests}
          activeRole={activeRole}
          userName={userName}
          onSelectConversation={(id) => {
            setActiveConvId(id);
            setConversations((prev) =>
              prev.map((c) => (c.id === id ? { ...c, unreadCount: 0 } : c))
            );
          }}
          onSendMessage={handleSendMessage}
          onOpenRequestDetail={openRequestDetail}
        />
      )}

      {screen === 'reviews' && (
        <ReviewsAndReputation
          reviews={reviews}
          completedRequests={requests.filter((r) =>
            ['COMPLETED', 'COMPLETION_PENDING'].includes(r.state)
          )}
          activeRole={activeRole}
          userName={userName}
          onAddReview={(rev) =>
            setReviews((prev) => [
              { ...rev, id: `rev-${Date.now()}`, date: '20 Nov 2026' },
              ...prev,
            ])
          }
        />
      )}

      {screen === 'favorites' && (
        <FavoritesAndContacts
          professionals={professionals}
          customers={customers}
          activeRole={activeRole}
          onToggleFavoritePro={(id) =>
            setProfessionals((prev) =>
              prev.map((p) => (p.id === id ? { ...p, isFavorite: !p.isFavorite } : p))
            )
          }
          onToggleFavoriteCustomer={(id) =>
            setCustomers((prev) =>
              prev.map((c) => (c.id === id ? { ...c, isFavorite: !c.isFavorite } : c))
            )
          }
          onSelectProfessional={openProfessionalDetail}
          onStartChat={handleStartChatWithPro}
          onCreateRequest={() => {
            setActiveRole('customer');
            setScreen('create-request');
          }}
        />
      )}

      {screen === 'notifications' && (
        <NotificationsCenter
          notifications={notifications}
          onMarkRead={(id) =>
            setNotifications((prev) =>
              prev.map((n) => (n.id === id ? { ...n, read: true } : n))
            )
          }
          onMarkAllRead={() =>
            setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
          }
          onOpenTarget={(targetScreen, targetId) => {
            if (targetScreen === 'request-detail' && targetId) {
              openRequestDetail(targetId);
            } else {
              setScreen(targetScreen);
            }
          }}
        />
      )}

      {screen === 'safety' && (
        <SafetyAndModeration
          cases={moderationCases}
          initialReportSubject={reportSubjectDraft}
          onSubmitReport={(report) => {
            setModerationCases((prev) => [
              {
                ...report,
                id: `MOD-${Math.floor(210 + Math.random() * 700)}`,
                status: 'UNDER_REVIEW',
                submittedAt: '20 Nov 2026',
                resolutionNote:
                  'Logged for review by the SALU Safety & Trust Desk.',
              },
              ...prev,
            ]);
          }}
          onSubmitAppeal={(caseId, appealText) => {
            setModerationCases((prev) =>
              prev.map((c) =>
                c.id === caseId
                  ? {
                      ...c,
                      status: 'APPEAL_SUBMITTED',
                      resolutionNote: `Appeal received: "${appealText}"`,
                    }
                  : c
              )
            );
          }}
        />
      )}

      {screen === 'settings' && (
        <AccountSettings
          userName={userName}
          municipality={municipality}
          activeRole={activeRole}
          darkMode={darkMode}
          onToggleDark={() => setDarkMode((d) => !d)}
          onUpdateProfile={(name, area) => {
            setUserName(name);
            setMunicipality(area);
          }}
          onSwitchRole={(r) => setActiveRole(r)}
        />
      )}

      {proposalTargetReq && (
        <ProposalSubmissionModal
          request={proposalTargetReq}
          providerName={
            providerDraft.entityType === 'INDIVIDUAL'
              ? providerDraft.displayName
              : providerDraft.businessName || providerDraft.displayName
          }
          providerProfession={providerDraft.profession}
          onClose={() => setProposalTargetReq(null)}
          onSubmitProposal={handleSubmitProposal}
        />
      )}
    </AppShell>
    </LanguageProvider>
  );
}

export default App;
