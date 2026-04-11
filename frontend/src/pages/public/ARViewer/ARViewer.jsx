import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  RiArrowLeftLine, RiLoader4Line, RiBox3Line,
  RiSmartphoneLine, RiComputerLine, RiQrCodeLine,
  RiCloseLine, RiWifiLine,
} from 'react-icons/ri';
import { arArtworkAPI } from '../../../services/api';

/*QR modal ── */
const QRModal = ({ url, title, onClose }) => {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(url)}&bgcolor=FDF6EE&color=3D3530&margin=10`;
  const isLocalhost = url.includes('localhost') || url.includes('127.0.0.1');

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}>
      <div className="bg-[#FDF6EE] rounded-2xl p-6 max-w-xs w-full text-center border border-[#C97B5A]/30 shadow-2xl"
        onClick={e => e.stopPropagation()}>

        {/* header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <RiSmartphoneLine size={18} className="text-[#C97B5A]"/>
            <p className="font-heading text-sm text-[#3D3530]">Scan for Mobile AR</p>
          </div>
          <button onClick={onClose} className="text-[#9A8880] hover:text-[#3D3530] transition-colors bg-transparent border-none cursor-pointer">
            <RiCloseLine size={18}/>
          </button>
        </div>

        {/* localhost warning */}
        {isLocalhost && (
          <div className="mb-4 p-3 rounded-xl text-left bg-amber-50 border border-amber-300">
            <p className="text-xs font-body font-semibold mb-1 text-amber-700">⚠ Use ngrok URL for phone access</p>
            <p className="text-[11px] font-body text-amber-800">
              Run ngrok and open this page via ngrok URL, then scan.
            </p>
          </div>
        )}

        {/* QR code */}
        <div className="rounded-xl overflow-hidden mx-auto mb-4 border-2 border-[#C97B5A]/20"
          style={{ width: 220, height: 220 }}>
          <img src={qrUrl} alt="QR Code" className="w-full h-full"/>
        </div>

        <p className="font-heading text-sm text-[#3D3530] mb-1">{title}</p>
        <p className="text-[10px] font-body break-all px-2 mb-4 text-[#C97B5A]">{url}</p>

        {/* steps */}
        <div className="text-left space-y-2 mb-4">
          {[
            'Run: ngrok http 5173',
            'Open ngrok URL in PC browser',
            'Scan QR with phone camera',
            'Tap "View in Your Room (AR)"',
          ].map((step, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-white bg-[#C97B5A] mt-0.5"
                style={{ minWidth: 20 }}>
                {i + 1}
              </div>
              <p className="text-[11px] font-body text-[#6B5A50]">{step}</p>
            </div>
          ))}
        </div>

        <button onClick={onClose}
          className="w-full py-2.5 rounded-xl text-sm font-body font-semibold text-white bg-[#C97B5A] hover:bg-[#b56a4a] transition-colors border-none cursor-pointer">
          Close
        </button>
      </div>
    </div>
  );
};

/*main*/
export default function ARViewer() {
  const { id }    = useParams();
  const navigate  = useNavigate();

  const [art,         setArt]         = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState('');
  const [scriptReady, setScriptReady] = useState(false);
  const [showQR,      setShowQR]      = useState(false);
  const [isMobile,    setIsMobile]    = useState(false);

  const arPageUrl = window.location.href;

  useEffect(() => {
    setIsMobile(/Android|iPhone|iPad|iPod/i.test(navigator.userAgent));
  }, []);

  /* load model-viewer script */
  useEffect(() => {
    const existing = document.querySelector('script[src*="model-viewer"]');
    if (existing) {
      customElements.whenDefined('model-viewer')
        .then(() => setScriptReady(true)).catch(() => setScriptReady(true));
      return;
    }
    const s = document.createElement('script');
    s.type  = 'module';
    s.src   = 'https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js';
    s.onload  = () => customElements.whenDefined('model-viewer')
      .then(() => setScriptReady(true)).catch(() => setScriptReady(true));
    s.onerror = () => setScriptReady(true);
    document.head.appendChild(s);
  }, []);

  /* fetch artwork */
  useEffect(() => {
    arArtworkAPI.getById(id)
      .then(r => { if (r.data?.success) setArt(r.data.data); else setError('Artwork not found.'); })
      .catch(() => setError('Failed to load artwork.'))
      .finally(() => setLoading(false));
  }, [id]);

  /* GLB URL — uses window.location.origin so proxy works */
  const getGlbUrl = (glbModel) => {
    if (!glbModel) return null;
    if (glbModel.startsWith('http')) return glbModel;
    return `${window.location.origin}${glbModel}`;
  };

  /*loading*/
  if (loading) return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#3D3530]">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-[#C97B5A]/12 border border-[#C97B5A]/25">
          <RiLoader4Line size={28} className="animate-spin text-[#C97B5A]"/>
        </div>
        <p className="text-sm font-body text-[#C4917A]">Loading artwork…</p>
      </div>
    </div>
  );

  /*error*/
  if (error || !art) return (
    <div className="fixed inset-0 flex items-center justify-center px-6 bg-[#3D3530]">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-[#C97B5A]/8 border border-[#C97B5A]/20">
          <RiBox3Line size={28} className="text-[#C97B5A]/40"/>
        </div>
        <p className="font-heading text-xl text-[#FDF6EE] mb-2">Artwork not found</p>
        <p className="text-sm font-body text-[#9A8880] mb-6">{error}</p>
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#C97B5A] hover:bg-[#b56a4a] text-white text-sm font-body font-semibold mx-auto transition-colors border-none cursor-pointer">
          <RiArrowLeftLine size={15}/> Go Back
        </button>
      </div>
    </div>
  );

  const glbUrl = getGlbUrl(art.glbModel);
  const hasGlb = !!art.glbModel;

  return (
    <div className="fixed inset-0 flex flex-col bg-[#3D3530]"
      style={{ fontFamily: "'Libre Baskerville', serif" }}>

      {showQR && <QRModal url={arPageUrl} title={art.title} onClose={() => setShowQR(false)}/>}

      {/*top bar*/}
      <div className="flex items-center justify-between px-5 py-3 flex-shrink-0 bg-[#2a2420]/90 backdrop-blur-md border-b border-[#C97B5A]/15">

        <button onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-body text-[#C97B5A] hover:text-[#FDF6EE] transition-colors bg-transparent border-none cursor-pointer">
          <RiArrowLeftLine size={16}/> Back
        </button>

        <div className="text-center flex-1 mx-3">
          <p className="text-sm font-semibold text-[#FDF6EE] truncate">{art.title}</p>
          {art.category && (
            <p className="text-[10px] font-body text-[#C97B5A] uppercase tracking-widest mt-0.5">
              {art.category}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {!isMobile && hasGlb && (
            <button onClick={() => setShowQR(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#C97B5A]/15 border border-[#C97B5A]/30 text-[#C97B5A] text-[11px] font-body hover:bg-[#C97B5A]/25 transition-colors cursor-pointer">
              <RiQrCodeLine size={13}/> Scan for AR
            </button>
          )}
          <div className="flex items-center gap-1.5 text-[10px] font-body text-[#9A8880]">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"/>
            AR Ready
          </div>
        </div>
      </div>

      {/*content*/}
      <div className="flex-1 flex flex-col min-h-0">
        {hasGlb ? (
          <>
            {/* 3D viewer */}
            <div className="flex-1 relative min-h-0">

              {/* Loading overlay */}
              {!scriptReady && (
                <div className="absolute inset-0 flex items-center justify-center z-10 bg-[#2a2420]/70">
                  <div className="text-center">
                    <RiLoader4Line size={24} className="animate-spin text-[#C97B5A] mx-auto mb-2"/>
                    <p className="text-xs font-body text-[#C4917A]">Loading 3D viewer…</p>
                  </div>
                </div>
              )}

              {/* model-viewer */}
              {scriptReady && (
                <model-viewer
                  src={glbUrl}
                  alt={art.title}
                  ar=""
                  ar-modes="webxr scene-viewer quick-look"
                  camera-controls=""
                  auto-rotate=""
                  auto-rotate-delay="300"
                  rotation-per-second="20deg"
                  shadow-intensity="1"
                  environment-image="neutral"
                  exposure="1"
                  style={{
                    width: '100%', height: '100%',
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'transparent',
                    '--progress-bar-color': '#C97B5A',
                  }}
                >
                  {/* AR button */}
                  <button slot="ar-button"
                    className="font-body font-semibold"
                    style={{
                      position: 'absolute', bottom: 24, right: 24,
                      background: 'linear-gradient(135deg, #C97B5A, #b56a4a)',
                      color: 'white', border: 'none', borderRadius: 50,
                      padding: '12px 22px', fontSize: 13,
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                      boxShadow: '0 4px 24px rgba(201,123,90,0.55)',
                    }}>
                    📱 View in Your Room (AR)
                  </button>
                </model-viewer>
              )}

              {/* Desktop QR hint card */}
              {!isMobile && scriptReady && (
                <div onClick={() => setShowQR(true)}
                  className="absolute bottom-6 left-6 flex items-center gap-3 px-4 py-2.5 rounded-2xl cursor-pointer z-10 bg-[#2a2420]/88 backdrop-blur-md border border-[#C97B5A]/25 hover:border-[#C97B5A]/50 transition-all">
                  <div className="w-9 h-9 rounded-lg bg-[#FDF6EE] flex items-center justify-center flex-shrink-0">
                    <RiQrCodeLine size={18} className="text-[#3D3530]"/>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#FDF6EE] mb-0.5">View AR on mobile</p>
                    <p className="text-[10px] font-body text-[#9A8880]">Scan QR with phone camera</p>
                  </div>
                </div>
              )}
            </div>

            {/* info strip*/}
            <div className="flex-shrink-0 px-6 py-4 bg-[#1e1a17]/95 border-t border-[#C97B5A]/12">
              <div className="max-w-2xl mx-auto">
                <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                  <h1 className="font-heading text-sm text-[#FDF6EE] font-normal">{art.title}</h1>
                  <div className="flex gap-4 text-[10px] font-body text-[#9A8880]">
                    <span className="flex items-center gap-1"><RiComputerLine size={11}/> Drag to rotate</span>
                    <span className="flex items-center gap-1"><RiSmartphoneLine size={11}/> Pinch to zoom</span>
                  </div>
                </div>

                {art.description && (
                  <p className="text-xs font-body text-[#C4917A] leading-relaxed mb-3">{art.description}</p>
                )}

                <div className="flex items-start gap-2.5 px-3 py-2.5 rounded-xl bg-[#C97B5A]/8 border border-[#C97B5A]/15">
                  {isMobile
                    ? <RiSmartphoneLine size={13} className="text-[#C97B5A] flex-shrink-0 mt-0.5"/>
                    : <RiWifiLine size={13} className="text-[#C97B5A] flex-shrink-0 mt-0.5"/>
                  }
                  <p className="text-[11px] font-body text-[#C4917A] leading-relaxed">
                    {isMobile ? (
                      <><strong className="text-[#C97B5A]">Tap "View in Your Room"</strong> to place this artwork in your real environment using your camera.</>
                    ) : (
                      <><strong className="text-[#C97B5A]">For AR on phone:</strong> Click the QR card or "Scan for AR" button. Open via ngrok URL for best results.</>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* No GLB fallback */
          <div className="flex-1 flex flex-col items-center justify-center p-8">
            {art.image ? (
              <div className="max-w-md w-full text-center">
                <div className="rounded-2xl overflow-hidden mb-6 border border-[#C97B5A]/20">
                  <img src={art.image} alt={art.title} className="w-full object-cover block"/>
                </div>
                <h1 className="font-heading text-xl text-[#FDF6EE] font-normal mb-2">{art.title}</h1>
                {art.description && (
                  <p className="text-sm font-body text-[#C4917A] leading-relaxed">{art.description}</p>
                )}
                <p className="text-xs font-body text-[#C97B5A] px-4 py-2 rounded-xl inline-block mt-4 bg-[#C97B5A]/10 border border-[#C97B5A]/20">
                  3D model not uploaded yet.
                </p>
              </div>
            ) : (
              <div className="text-center">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-[#C97B5A]/10 border border-[#C97B5A]/20">
                  <RiBox3Line size={36} className="text-[#C97B5A]/40"/>
                </div>
                <p className="font-heading text-[#FDF6EE] mb-2">{art.title}</p>
                <p className="text-sm font-body text-[#9A8880]">No 3D model available.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}