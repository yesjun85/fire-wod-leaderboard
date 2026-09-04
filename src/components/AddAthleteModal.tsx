import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { 
  X, 
  UserPlus, 
  Trash2, 
  QrCode, 
  Smartphone, 
  Copy, 
  Check, 
  ExternalLink, 
  Users, 
  Shield, 
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { Athlete } from '../types';

interface AddAthleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  athletes: Athlete[];
  onAddAthlete: (athlete: Athlete) => void;
  onRemoveAthlete: (athleteId: string) => void;
  roomId?: string;
}

export const AddAthleteModal: React.FC<AddAthleteModalProps> = ({
  isOpen,
  onClose,
  athletes,
  onAddAthlete,
  onRemoveAthlete,
  roomId = 'wod-119'
}) => {
  const [activeTab, setActiveTab] = useState<'qr' | 'manual' | 'list'>('qr');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [joinUrl, setJoinUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  // Manual input state
  const [name, setName] = useState('');
  const [rank, setRank] = useState('소방교');
  const [color, setColor] = useState('#f97316');

  const ranks = ['소방사', '소방교', '소방장', '소방위', '소방경', '의용소방대'];
  const colorOptions = ['#f97316', '#ef4444', '#f59e0b', '#10b981', '#0284c7', '#a855f7'];

  // Compute join URL and generate QR code
  useEffect(() => {
    if (isOpen && typeof window !== 'undefined') {
      const url = `${window.location.origin}${window.location.pathname}?mode=join&room=${encodeURIComponent(roomId)}`;
      setJoinUrl(url);

      QRCode.toDataURL(url, {
        width: 320,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff'
        },
        errorCorrectionLevel: 'M'
      })
        .then((dataUrl) => {
          setQrDataUrl(dataUrl);
        })
        .catch((err) => {
          console.error('Failed to generate QR Code', err);
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopyUrl = async () => {
    try {
      if (navigator.clipboard && joinUrl) {
        await navigator.clipboard.writeText(joinUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newAth: Athlete = {
      id: 'ath-' + Date.now(),
      name: name.trim(),
      rank,
      color
    };

    onAddAthlete(newAth);
    setName('');
    setActiveTab('list');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className="bg-[#0c121e] border border-slate-700/90 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="px-4 sm:px-5 py-3.5 border-b border-slate-800 flex items-center justify-between bg-[#080c14]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-600/20 border border-orange-500/40 flex items-center justify-center text-orange-400">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-['Black_Han_Sans',sans-serif] text-lg sm:text-xl text-slate-100 tracking-wide">
                참전 소방대원 추가 & 관리
              </h2>
              <span className="text-[11px] font-mono text-slate-400 block">
                스마트폰 QR 스캔 또는 직접 등록
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="grid grid-cols-3 border-b border-slate-800 bg-[#0a0f19] p-1 gap-1 text-xs font-mono font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('qr')}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-lg transition-all ${
              activeTab === 'qr'
                ? 'bg-orange-600 text-white shadow-md shadow-orange-950'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>스마트폰 QR</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('manual')}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-lg transition-all ${
              activeTab === 'manual'
                ? 'bg-orange-600 text-white shadow-md shadow-orange-950'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>현장 직접 입력</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('list')}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-lg transition-all ${
              activeTab === 'list'
                ? 'bg-orange-600 text-white shadow-md shadow-orange-950'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>명단 ({athletes.length}명)</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          
          {/* TAB 1: QR CODE JOIN */}
          {activeTab === 'qr' && (
            <div className="space-y-4 text-center">
              
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-mono font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>카메라로 비추면 즉시 대원 등록 페이지로 이동</span>
                <span className="bg-orange-600 text-white px-1.5 py-0.5 rounded text-[10px]">방: {roomId}</span>
              </div>

              {/* QR Code Container with Tactical HUD Frame */}
              <div className="relative mx-auto w-64 sm:w-72 p-3 bg-white rounded-2xl shadow-2xl border-4 border-orange-500/80 group">
                
                {/* Tactical Corner Accents */}
                <div className="absolute -top-2 -left-2 w-5 h-5 border-t-4 border-l-4 border-orange-400 rounded-tl pointer-events-none" />
                <div className="absolute -top-2 -right-2 w-5 h-5 border-t-4 border-r-4 border-orange-400 rounded-tr pointer-events-none" />
                <div className="absolute -bottom-2 -left-2 w-5 h-5 border-b-4 border-l-4 border-orange-400 rounded-bl pointer-events-none" />
                <div className="absolute -bottom-2 -right-2 w-5 h-5 border-b-4 border-r-4 border-orange-400 rounded-br pointer-events-none" />

                {qrDataUrl ? (
                  <div className="relative">
                    <img 
                      src={qrDataUrl} 
                      alt="대원 등록 접속 QR 코드" 
                      className="w-full h-auto aspect-square mx-auto block rounded-lg select-none"
                    />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-10 h-10 rounded-xl bg-orange-600 text-white flex items-center justify-center shadow-lg border-2 border-white">
                        <Shield className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="w-full aspect-square flex items-center justify-center text-slate-800 font-mono text-xs">
                    QR 코드 생성 중...
                  </div>
                )}
              </div>

              {/* Instructions Steps */}
              <div className="bg-[#080c14] p-3 rounded-xl border border-slate-800/90 text-left space-y-1.5 text-xs text-slate-300">
                <div className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-orange-600 text-white font-mono font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </span>
                  <span>스마트폰 카메라로 전광판의 QR 코드를 비춥니다.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-orange-600 text-white font-mono font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </span>
                  <span>모바일 화면에서 <strong>본인 성명, 계급</strong>을 입력하고 등록합니다.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-orange-600 text-white font-mono font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </span>
                  <span>등록 즉시 <strong>TV 전광판 순위표에 실시간 합류</strong>되며 개인 타이머가 활성화됩니다.</span>
                </div>
              </div>

              {/* URL Display & Copy */}
              <div className="flex items-center gap-1.5 p-1.5 rounded-xl bg-[#080c14] border border-slate-800">
                <input
                  type="text"
                  readOnly
                  value={joinUrl}
                  className="flex-1 bg-transparent px-2 text-[11px] font-mono text-slate-300 truncate focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleCopyUrl}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-bold border border-slate-700 transition-all shrink-0 cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">복사됨!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                      <span>URL 복사</span>
                    </>
                  )}
                </button>
              </div>

              {/* Status Note */}
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1">
                <span className="flex items-center gap-1 text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                  실시간 전광판 동기화 대기 중
                </span>
                <span className="text-slate-400">
                  현재 등록: <strong className="text-orange-400 font-bold">{athletes.length}명</strong>
                </span>
              </div>

            </div>
          )}

          {/* TAB 2: MANUAL DIRECT ENTRY */}
          {activeTab === 'manual' && (
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div className="bg-[#080c14] p-3 rounded-xl border border-slate-800 text-xs text-slate-400 font-mono">
                체력단련실 전광판 모니터 또는 PC 키보드에서 대원을 직접 수동 등록합니다.
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-1">
                    <label className="text-[11px] font-mono font-bold uppercase text-slate-400 block mb-1">
                      계급
                    </label>
                    <select
                      value={rank}
                      onChange={(e) => setRank(e.target.value)}
                      className="w-full bg-[#080c14] border border-slate-700 rounded-lg px-2 py-2 text-xs text-slate-200 font-bold focus:outline-none focus:border-orange-500"
                    >
                      {ranks.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-2">
                    <label className="text-[11px] font-mono font-bold uppercase text-slate-400 block mb-1">
                      성명 (이름) <span className="text-orange-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="예: 최진압"
                      className="w-full bg-[#080c14] border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 font-bold focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-mono font-bold uppercase text-slate-400 block mb-1">
                    식별 컬러
                  </label>
                  <div className="flex items-center gap-2 pt-1">
                    {colorOptions.map((hex) => (
                      <button
                        type="button"
                        key={hex}
                        onClick={() => setColor(hex)}
                        className={`w-7 h-7 rounded-full border-2 transition-all ${
                          color === hex ? 'scale-110 border-white ring-2 ring-orange-500/50' : 'border-transparent opacity-70 hover:opacity-100'
                        }`}
                        style={{ backgroundColor: hex }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-orange-600 via-red-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-['Black_Han_Sans',sans-serif] text-sm shadow-md shadow-orange-950 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>대원 즉시 등록</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: ATHLETES ROSTER LIST */}
          {activeTab === 'list' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono pb-1 border-b border-slate-800">
                <span>현재 등록 대원 총 {athletes.length}명</span>
                <span className="text-[11px] text-slate-500">휴지통 아이콘 클릭 시 삭제</span>
              </div>

              {athletes.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs font-mono">
                  등록된 대원이 없습니다. QR 코드 또는 직접 등록으로 대원을 추가하세요.
                </div>
              ) : (
                <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                  {athletes.map((ath, idx) => (
                    <div 
                      key={ath.id}
                      className="p-2.5 rounded-lg bg-[#080c14] border border-slate-800 flex items-center justify-between transition-colors hover:border-slate-700"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-5 font-mono text-xs text-slate-500 text-right">
                          {idx + 1}.
                        </span>
                        <div 
                          className="w-2.5 h-2.5 rounded-full" 
                          style={{ backgroundColor: ath.color || '#f97316' }} 
                        />
                        <span className="font-['Black_Han_Sans',sans-serif] text-sm text-slate-100">
                          {ath.name}
                        </span>
                        <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-800 text-slate-300 font-mono font-bold">
                          {ath.rank}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => onRemoveAthlete(ath.id)}
                        className="p-1 text-slate-500 hover:text-red-400 rounded transition-colors"
                        title="대원 삭제"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-4 sm:px-5 py-3 border-t border-slate-800 bg-[#080c14] flex items-center justify-between">
          <div className="text-[11px] font-mono text-slate-500">
            {activeTab === 'qr' ? '스마트폰 카메라로 상단 QR을 촬영하세요' : `총 ${athletes.length}명 대기`}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-bold border border-slate-700 transition-all cursor-pointer"
          >
            확인 및 닫기
          </button>
        </div>

      </div>
    </div>
  );
};
