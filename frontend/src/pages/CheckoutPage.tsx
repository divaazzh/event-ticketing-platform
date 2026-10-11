import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBookingStore } from '@/store/bookingStore';
import { formatCurrency, formatSecondsToMMSS } from '@/utils/format';
import { 
  Clock, 
  CreditCard, 
  QrCode, 
  Building2, 
  Wallet, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  ArrowLeft,
  Ticket as TicketIcon
} from 'lucide-react';

const PAYMENT_METHODS = [
  {
    id: 'qris',
    title: 'QRIS Instant Pay',
    desc: 'Instant dynamic QR scan (GoPay, OVO, BCA, Dana)',
    icon: QrCode,
    badge: 'Popular',
  },
  {
    id: 'bank_transfer',
    title: 'Virtual Account Transfer',
    desc: 'BCA, Mandiri, BNI & BRI Automatic Verification',
    icon: Building2,
    badge: 'Zero Fee',
  },
  {
    id: 'credit_card',
    title: 'Credit / Debit Card',
    desc: 'Visa, MasterCard, JCB with 3D Secure Verification',
    icon: CreditCard,
    badge: null,
  },
  {
    id: 'e_wallet',
    title: 'Direct E-Wallet',
    desc: 'One-click wallet authorization checkout',
    icon: Wallet,
    badge: null,
  },
];

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { 
    activeOrder, 
    secondsRemaining, 
    isHolding, 
    tickTimer, 
    payOrder, 
    resetBooking 
  } = useBookingStore();

  const [selectedMethod, setSelectedMethod] = useState<string>('qris');
  const [paymentState, setPaymentState] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle');
  const [feedbackMessage, setFeedbackMessage] = useState<string>('');

  // 1-second countdown interval
  useEffect(() => {
    if (!isHolding) return;
    const interval = setInterval(() => {
      tickTimer();
    }, 1000);
    return () => clearInterval(interval);
  }, [isHolding, tickTimer]);

  // If no active order, return to home
  useEffect(() => {
    if (!activeOrder && paymentState === 'idle') {
      navigate('/');
    }
  }, [activeOrder, paymentState, navigate]);

  const handleSimulatePayment = async (simulateSuccess: boolean) => {
    setPaymentState('processing');
    setFeedbackMessage('');

    try {
      const res = await payOrder(selectedMethod, simulateSuccess);
      if (res.success) {
        setPaymentState('success');
        setFeedbackMessage('Payment confirmed! Your event tickets and verifiable QR codes have been issued.');
      } else {
        setPaymentState('failed');
        setFeedbackMessage('Payment declined by mock gateway. You can retry simulation before the hold expires.');
      }
    } catch (err: unknown) {
      setPaymentState('failed');
      setFeedbackMessage(err instanceof Error ? err.message : 'Transaction could not be completed.');
    }
  };

  const isExpired = secondsRemaining <= 0;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
      {/* Header breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Event
        </button>
        <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
          <ShieldCheck className="h-4 w-4" /> 256-Bit SSL Encrypted Checkout
        </div>
      </div>

      {/* Reservation Countdown Alert Bar */}
      {isHolding && !isExpired && paymentState !== 'success' && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-200">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-300">
              <Clock className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">Tickets Held in Reservation</div>
              <p className="text-xs text-amber-300/80">
                Please complete mock payment before your hold reservation expires.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-slate-950/80 px-4 py-2 border border-amber-500/30">
            <span className="text-xs uppercase tracking-wider text-slate-400">Time Left:</span>
            <span className="font-mono text-xl font-black text-amber-400">
              {formatSecondsToMMSS(secondsRemaining)}
            </span>
          </div>
        </div>
      )}

      {isExpired && paymentState !== 'success' && (
        <div className="flex items-center gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-5 text-rose-300">
          <AlertTriangle className="h-6 w-6 shrink-0 text-rose-400" />
          <div className="space-y-1">
            <div className="text-sm font-bold text-white">Reservation Expired</div>
            <p className="text-xs text-rose-300/90">
              Your 15-minute ticket hold duration has elapsed and quotas have been safely released to other customers.
            </p>
            <button
              onClick={() => {
                resetBooking();
                navigate('/');
              }}
              className="mt-2 text-xs font-semibold underline hover:text-white"
            >
              Start new reservation
            </button>
          </div>
        </div>
      )}

      {/* Success Dialog View */}
      {paymentState === 'success' && (
        <div className="rounded-3xl border border-emerald-500/30 bg-slate-900/90 p-8 sm:p-12 text-center space-y-6 shadow-2xl backdrop-blur-xl">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <CheckCircle className="h-10 w-10 animate-bounce" />
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <h2 className="text-3xl font-black text-white">Payment Confirmed!</h2>
            <p className="text-sm text-slate-300">{feedbackMessage}</p>
            <p className="text-xs text-slate-500">
              Order Ref: <code className="text-emerald-400">{activeOrder?.order_reference}</code>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={() => navigate('/my-tickets')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/25 hover:from-emerald-400 hover:to-teal-500 transition-all hover:scale-[1.02]"
            >
              <TicketIcon className="h-4 w-4" />
              View Issued Tickets & QR Codes
            </button>
            <button
              onClick={() => {
                resetBooking();
                navigate('/');
              }}
              className="w-full sm:w-auto rounded-xl border border-slate-700 bg-slate-800 px-6 py-3.5 text-sm font-semibold text-slate-200 hover:bg-slate-700 transition-all"
            >
              Browse More Events
            </button>
          </div>
        </div>
      )}

      {/* Standard Checkout Grid */}
      {paymentState !== 'success' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Payment Methods Selection */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6 sm:p-8 space-y-6">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white">Select Mock Payment Method</h3>
                <p className="text-xs text-slate-400">
                  Select how you want to simulate clearing the transaction.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {PAYMENT_METHODS.map((method) => {
                  const Icon = method.icon;
                  const selected = selectedMethod === method.id;
                  return (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setSelectedMethod(method.id)}
                      className={`flex flex-col justify-between rounded-2xl border p-5 text-left transition-all ${
                        selected
                          ? 'border-indigo-500 bg-indigo-950/20 ring-1 ring-indigo-500 shadow-lg shadow-indigo-500/10'
                          : 'border-slate-800 bg-slate-950/40 hover:border-slate-700 hover:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-start justify-between w-full mb-3">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-xl border ${
                            selected
                              ? 'border-indigo-500/40 bg-indigo-500/20 text-indigo-400'
                              : 'border-slate-800 bg-slate-900 text-slate-400'
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        {method.badge && (
                          <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-[10px] font-semibold text-indigo-300">
                            {method.badge}
                          </span>
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="text-sm font-bold text-white">{method.title}</div>
                        <div className="text-xs text-slate-400 leading-relaxed">
                          {method.desc}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Simulation Sandbox Notice */}
              <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-4 text-xs text-indigo-300 space-y-1">
                <div className="font-semibold text-indigo-200">Mock Payment Sandbox Activated</div>
                <p className="text-slate-400">
                  This platform implements realistic gateway simulation without real banking charges. You can simulate either successful completion or gateway errors to test rollback stability.
                </p>
              </div>

              {/* Error feedback if failed */}
              {paymentState === 'failed' && (
                <div className="flex items-start gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-300">
                  <XCircle className="h-5 w-5 shrink-0 text-rose-400 mt-0.5" />
                  <div>
                    <div className="font-semibold text-rose-200">Simulation Decline</div>
                    <p>{feedbackMessage}</p>
                  </div>
                </div>
              )}

              {/* Simulation Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => handleSimulatePayment(true)}
                  disabled={isExpired || paymentState === 'processing'}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 hover:from-emerald-400 hover:to-teal-500 disabled:opacity-40 disabled:pointer-events-none transition-all hover:scale-[1.01]"
                >
                  {paymentState === 'processing' ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <CheckCircle className="h-4 w-4" />
                  )}
                  Simulate Successful Payment
                </button>

                <button
                  type="button"
                  onClick={() => handleSimulatePayment(false)}
                  disabled={isExpired || paymentState === 'processing'}
                  className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-5 py-3.5 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 disabled:opacity-40 disabled:pointer-events-none transition-all"
                >
                  Simulate Payment Decline
                </button>
              </div>
            </div>
          </div>

          {/* Order Summary Card */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl backdrop-blur-xl space-y-6">
            <div className="border-b border-slate-800 pb-4 space-y-1">
              <h3 className="text-base font-bold text-white">Order Summary</h3>
              <p className="text-xs text-slate-400">
                Order Ref: <span className="font-mono text-slate-300">{activeOrder?.order_reference}</span>
              </p>
            </div>

            {/* Items Breakdown */}
            <div className="space-y-3">
              {activeOrder?.items?.map((item) => (
                <div key={item.id} className="flex justify-between items-start text-xs">
                  <div className="space-y-0.5">
                    <div className="font-semibold text-white">
                      {item.ticketCategory?.name || 'Ticket Pass'}
                    </div>
                    <div className="text-slate-400">
                      {item.quantity} × {formatCurrency(item.unit_price)}
                    </div>
                  </div>
                  <div className="font-bold text-slate-200">
                    {formatCurrency(item.subtotal)}
                  </div>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="border-t border-slate-800 pt-4 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal</span>
                <span>{formatCurrency(activeOrder?.total_amount || 0)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Processing & Platform Fee</span>
                <span className="text-emerald-400">Rp 0 (Waived)</span>
              </div>
              <div className="border-t border-slate-800/80 pt-3 flex justify-between items-center text-sm font-bold text-white">
                <span>Total Amount</span>
                <span className="text-lg font-black text-indigo-400">
                  {formatCurrency(activeOrder?.total_amount || 0)}
                </span>
              </div>
            </div>

            {/* Security Guarantee */}
            <div className="rounded-2xl border border-slate-800/80 bg-slate-950/60 p-4 space-y-2 text-[11px] text-slate-400">
              <div className="flex items-center gap-1.5 font-semibold text-slate-300">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                Anti-Scalper Guarantee
              </div>
              <p>
                Once processed, non-transferable cryptographic QR passes will be generated immediately into your profile.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
