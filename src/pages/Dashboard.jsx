import { AlertTriangle, BrainCircuit, Clock3, ShieldAlert, Siren, Sparkles, Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Layout/Sidebar';
import CrisisMap from '../components/Map/CrisisMap';
import Button from '../components/UI/Button';
import Badge from '../components/UI/Badge';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { MOCK_CRISIS_EVENTS, MOCK_VOLUNTEERS } from '../config/mockData';
import useGemini from '../hooks/useGemini';
import { useToast } from '../hooks/useToast';
import { activateBreakGlass } from '../services/firebaseService';

function timeAgo(dateString) {
  const diffMinutes = Math.max(1, Math.round((Date.now() - new Date(dateString).getTime()) / 60000));
  if (diffMinutes < 60) {
    return `${diffMinutes} mins ago`;
  }
  const hours = Math.round(diffMinutes / 60);
  return `${hours} hr${hours > 1 ? 's' : ''} ago`;
}

function severityStyles(severity) {
  if (severity === 'critical') {
    return { border: 'border-red-500', badge: 'red' };
  }
  if (severity === 'high') {
    return { border: 'border-amber-500', badge: 'amber' };
  }
  return { border: 'border-yellow-500', badge: 'yellow' };
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { analyzeCrisis, loading: aiLoading } = useGemini();
  const { showToast } = useToast();
  const [selectedCrisisId, setSelectedCrisisId] = useState(MOCK_CRISIS_EVENTS[0]?.id || '');
  const [analysisCache, setAnalysisCache] = useState({});
  const [now, setNow] = useState(new Date());
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [activating, setActivating] = useState(false);

  const selectedCrisis = useMemo(
    () => MOCK_CRISIS_EVENTS.find((crisis) => crisis.id === selectedCrisisId) || MOCK_CRISIS_EVENTS[0],
    [selectedCrisisId],
  );

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let active = true;

    async function loadAnalysis() {
      if (!selectedCrisis || analysisCache[selectedCrisis.id]) {
        return;
      }

      try {
        const analysis = await analyzeCrisis(selectedCrisis);
        if (active) {
          setAnalysisCache((current) => ({ ...current, [selectedCrisis.id]: analysis }));
        }
      } catch (error) {
        showToast(error.message || 'Unable to analyze crisis.', 'warning');
      }
    }

    loadAnalysis();

    return () => {
      active = false;
    };
  }, [selectedCrisis, analysisCache, analyzeCrisis, showToast]);

  const handleBreakGlass = async () => {
    if (!selectedCrisis) {
      showToast('Select a crisis before activating Break-Glass.', 'warning');
      return;
    }

    setActivating(true);
    try {
      await activateBreakGlass(selectedCrisis.id, 'coordinator_demo');
      showToast('Break-Glass activated. Redirecting to response matching.', 'success');
      setTimeout(() => {
        navigate(`/matching?crisisId=${selectedCrisis.id}`);
      }, 2000);
    } catch (error) {
      showToast(error.message || 'Break-Glass activation failed.', 'error');
    } finally {
      setActivating(false);
      setConfirmOpen(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-80px)] bg-slate-100">
      <div className="grid min-h-[calc(100vh-80px)] lg:grid-cols-[320px_1fr]">
        <Sidebar className="p-6">
          <div className="flex h-full flex-col">
            <div className="border-b border-white/10 pb-5">
              <p className="text-sm uppercase tracking-[0.2em] text-primary-100">Crisis Command Center</p>
              <h1 className="mt-3 text-2xl font-bold">Kothamangalam Ops</h1>
              <p className="mt-2 flex items-center gap-2 text-sm text-white/75">
                <Clock3 className="h-4 w-4" />
                {now.toLocaleString('en-IN', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                  second: '2-digit',
                })}
              </p>
            </div>

            <div className="mt-6 min-h-0 flex-1 overflow-hidden">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-heading text-lg font-semibold">Active Alerts</h2>
                <Badge color="red" className="animate-pulse">
                  LIVE
                </Badge>
              </div>
              <div className="max-h-[340px] space-y-4 overflow-y-auto pr-1">
                {MOCK_CRISIS_EVENTS.map((crisis) => {
                  const style = severityStyles(crisis.severity);
                  const expanded = crisis.id === selectedCrisisId;

                  return (
                    <div
                      key={crisis.id}
                      className={`w-full rounded-2xl border-l-4 bg-white/10 p-4 text-left backdrop-blur ${
                        style.border
                      } ${expanded ? 'ring-2 ring-white/20' : 'hover:bg-white/15'}`}
                    >
                      <button
                        type="button"
                        onClick={() => setSelectedCrisisId(crisis.id)}
                        className="w-full text-left"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold">{crisis.type}</p>
                            <p className="mt-1 text-sm text-white/70">{crisis.location}</p>
                          </div>
                          <Badge color={style.badge}>{crisis.confidence}%</Badge>
                        </div>
                        <div className="mt-3 flex items-center justify-between text-xs text-white/70">
                          <span>{timeAgo(crisis.reportedAt)}</span>
                          <span>{crisis.affectedEstimate}</span>
                        </div>
                      </button>

                      {expanded && (
                        <div className="mt-4 border-t border-white/10 pt-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-100">Signals</p>
                          <ul className="mt-2 space-y-2 text-sm text-white/80">
                            {crisis.signals.map((signal) => (
                              <li key={signal} className="flex gap-2">
                                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary-100" />
                                <span>{signal}</span>
                              </li>
                            ))}
                          </ul>
                          <Button type="button" variant="danger" className="mt-4 w-full" onClick={() => setConfirmOpen(true)}>
                            Activate Break-Glass
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {selectedCrisis && (
                <div className="mt-6 rounded-3xl bg-white/10 p-5 backdrop-blur">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-primary-100">Selected Crisis</p>
                      <h3 className="mt-2 text-xl font-semibold">{selectedCrisis.type}</h3>
                    </div>
                    <Badge color={severityStyles(selectedCrisis.severity).badge}>{selectedCrisis.status}</Badge>
                  </div>
                  <p className="mt-3 text-sm text-white/75">{selectedCrisis.location}</p>
                  <div className="mt-5">
                    <div className="mb-3 flex items-center gap-2">
                      <BrainCircuit className="h-4 w-4 text-primary-100" />
                      <p className="text-sm font-semibold">Gemini AI Analysis</p>
                    </div>
                    {aiLoading && !analysisCache[selectedCrisis.id] ? (
                      <div className="rounded-2xl bg-white/10 p-4">
                        <LoadingSpinner label="Gemini AI is analyzing..." />
                      </div>
                    ) : (
                      <div className="space-y-3 text-sm text-white/80">
                        <p>{analysisCache[selectedCrisis.id]?.summary || 'Awaiting AI assessment.'}</p>
                        <ul className="space-y-2">
                          {(analysisCache[selectedCrisis.id]?.recommendedActions || []).map((action) => (
                            <li key={action} className="flex gap-2">
                              <Siren className="mt-0.5 h-4 w-4 shrink-0 text-primary-100" />
                              <span>{action}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  <Button type="button" variant="danger" className="mt-6 w-full text-base breakglass-active" onClick={() => setConfirmOpen(true)}>
                    🔴 ACTIVATE BREAK-GLASS
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Sidebar>

        <section className="p-4 sm:p-6 lg:p-8">
          <div className="mb-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl bg-white p-5 shadow-card">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-red-50 p-3 text-red-600">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Active crises</p>
                  <p className="font-heading text-2xl font-bold text-navy">{MOCK_CRISIS_EVENTS.filter((item) => item.status === 'active').length}</p>
                </div>
              </div>
            </div>
            <div className="rounded-3xl bg-white p-5 shadow-card">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-primary-50 p-3 text-primary-600">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Registered responders</p>
                  <p className="font-heading text-2xl font-bold text-navy">{MOCK_VOLUNTEERS.length}</p>
                </div>
              </div>
            </div>
            <div className="rounded-3xl bg-white p-5 shadow-card">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-amber-50 p-3 text-amber-600">
                  <ShieldAlert className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Privacy status</p>
                  <p className="font-heading text-2xl font-bold text-navy">Encrypted by default</p>
                </div>
              </div>
            </div>
          </div>

          <div className="h-[620px]">
            <CrisisMap crises={MOCK_CRISIS_EVENTS} volunteers={MOCK_VOLUNTEERS} selectedCrisis={selectedCrisis} />
          </div>
        </section>
      </div>

      {confirmOpen && selectedCrisis && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-navy/55 px-4">
          <div className="w-full max-w-lg rounded-[28px] bg-white p-8 shadow-card">
            <div className="flex items-start gap-4">
              <div className="rounded-2xl bg-red-50 p-3 text-red-600">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-navy">Confirm Break-Glass activation</h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  This will temporarily grant access to minimum necessary volunteer data. All access will be logged. Continue?
                </p>
              </div>
            </div>
            <div className="mt-8 flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={() => setConfirmOpen(false)} disabled={activating}>
                Cancel
              </Button>
              <Button type="button" variant="danger" onClick={handleBreakGlass} loading={activating}>
                {activating ? 'Gemini AI activating...' : 'Continue'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
