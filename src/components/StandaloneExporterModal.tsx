import React, { useState } from 'react';
import { X, Code2, Copy, Check, Download, ExternalLink } from 'lucide-react';
import { generateStandaloneHTML } from '../utils/standaloneHtml';

interface StandaloneExporterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StandaloneExporterModal: React.FC<StandaloneExporterModalProps> = ({
  isOpen,
  onClose
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const htmlCode = generateStandaloneHTML();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(htmlCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback
    }
  };

  const handleDownload = () => {
    const blob = new Blob([htmlCode], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'fire_wod_board.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-2">
            <Code2 className="w-5 h-5 text-orange-400" />
            <h2 className="font-['Black_Han_Sans',sans-serif] text-xl text-slate-100 tracking-wide">
              단일 index.html 파일 내보내기
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-2">
            <p className="font-bold text-orange-300">
              💡 추가 서버나 패키지 설치 없이 브라우저에서 바로 열리는 단일 HTML 파일입니다.
            </p>
            <p>
              Tailwind CSS CDN, Web Audio API 사운드 합성, 듀얼 모드, 리더보드, 비상 사이렌 및 커피 룰렛이 단 1개의 파일에 모두 패키징되어 있습니다.
            </p>
          </div>

          <div className="relative">
            <pre className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-[11px] font-mono text-slate-400 max-h-48 overflow-y-auto">
              {htmlCode.slice(0, 1000)}
              {'\n... [총 ' + htmlCode.length + ' 자의 완전한 단일 HTML 코드]'}
            </pre>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={handleCopy}
              className="py-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-['Black_Han_Sans',sans-serif] text-sm shadow-md shadow-orange-950 flex items-center justify-center gap-1.5 transition-all"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? '클립보드 복사 완료!' : 'HTML 전체 코드 복사'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-['Black_Han_Sans',sans-serif] text-sm border border-slate-700 flex items-center justify-center gap-1.5 transition-all"
            >
              <Download className="w-4 h-4 text-orange-400" />
              <span>index.html 파일 다운로드</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950 text-right">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl text-slate-400 hover:text-white text-xs font-bold"
          >
            닫기
          </button>
        </div>

      </div>
    </div>
  );
};
