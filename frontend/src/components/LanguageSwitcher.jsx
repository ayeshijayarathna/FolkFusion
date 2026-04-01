import { useEffect, useState, useCallback, useRef } from 'react';
import { HiChevronDown, HiCheck } from 'react-icons/hi';
import { HiGlobeAlt } from 'react-icons/hi2';

const LANGUAGES = [
  { code: 'en', label: 'EN',  full: 'English', flag: '🇬🇧', fontSize: '14px'   },
  { code: 'si', label: 'සිං', full: 'සිංහල',  flag: '🇱🇰', fontSize: '15.5px' },
  { code: 'ta', label: 'தமி', full: 'தமிழ்',  flag: '🇱🇰', fontSize: '15px'   },
];

const forceBodyFix = () => {
  document.body.style.top       = '0px';
  document.body.style.position  = 'static';
  document.body.style.marginTop = '0px';
  const banners = document.querySelectorAll(
    '.goog-te-banner-frame, .skiptranslate:not(#google_translate_element_hidden)'
  );
  banners.forEach(el => { el.style.display = 'none'; el.style.height = '0'; });
};

const patchReactDOMForGoogleTranslate = () => {
  const nativeRemoveChild = Node.prototype.removeChild;
  Node.prototype.removeChild = function(child) {
    if (child.parentNode !== this) return child;
    return nativeRemoveChild.call(this, child);
  };

  const nativeInsertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function(newNode, referenceNode) {
    if (referenceNode && referenceNode.parentNode !== this) return newNode;
    return nativeInsertBefore.call(this, newNode, referenceNode);
  };
};

export default function LanguageSwitcher({ onLangChange }) {
  const [current, setCurrent] = useState('en');
  const [open, setOpen]       = useState(false);
  const observerRef           = useRef(null);

  const applyFontSize = useCallback((code) => {
    const lang = LANGUAGES.find((l) => l.code === code) || LANGUAGES[0];
    document.documentElement.setAttribute('data-lang', code);
    document.documentElement.lang = code;
    document.documentElement.style.setProperty('--lang-font-size', lang.fontSize);
  }, []);

  useEffect(() => {
    patchReactDOMForGoogleTranslate();

    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        { pageLanguage: 'en', includedLanguages: 'en,si,ta', autoDisplay: false },
        'google_translate_element_hidden'
      );
    };

    if (!document.getElementById('gt-script')) {
      const s = document.createElement('script');
      s.id    = 'gt-script';
      s.src   = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      s.async = true;
      document.body.appendChild(s);
    }

    const saved = localStorage.getItem('ff_lang') || 'en';
    setCurrent(saved);
    applyFontSize(saved);

    observerRef.current = new MutationObserver(() => {
      if (document.body.style.top && document.body.style.top !== '0px') {
        forceBodyFix();
      }
    });
    observerRef.current.observe(document.body, {
      attributes: true,
      attributeFilter: ['style'],
    });

    return () => observerRef.current?.disconnect();
  }, [applyFontSize]);

  const switchLang = (code) => {
    setCurrent(code);
    setOpen(false);
    localStorage.setItem('ff_lang', code);
    applyFontSize(code);
    if (onLangChange) onLangChange(code);

    if (code === 'en') {
      document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname}`;
      const select = document.querySelector('.goog-te-combo');
      if (select) {
        select.value = 'en';
        select.dispatchEvent(new Event('change'));
        setTimeout(forceBodyFix, 200);
        setTimeout(forceBodyFix, 600);
      } else {
        window.location.reload();
      }
      return;
    }

    document.cookie = `googtrans=/en/${code}; path=/`;
    document.cookie = `googtrans=/en/${code}; path=/; domain=${window.location.hostname}`;
    const select = document.querySelector('.goog-te-combo');
    if (select) {
      select.value = code;
      select.dispatchEvent(new Event('change'));
      setTimeout(forceBodyFix, 200);
      setTimeout(forceBodyFix, 600);
    } else {
      window.location.reload();
    }
  };

  const activeLang = LANGUAGES.find((l) => l.code === current) || LANGUAGES[0];

  return (
    <>
      {/* Hidden Google Translate mount point */}
      <div
        id="google_translate_element_hidden"
        className="absolute opacity-0 pointer-events-none overflow-hidden h-0"
        style={{ top: -9999, left: -9999 }}
      />

      <div className="relative font-body">
        <button
          onClick={() => setOpen((o) => !o)}
          title="Change Language"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-700/30 bg-white/80 hover:bg-amber-50 transition-colors text-amber-900 text-[12px] font-bold"
        >
          <span className="text-[15px]">{activeLang.flag}</span>
          <span>{activeLang.label}</span>
          <HiChevronDown
            size={13}
            className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          />
        </button>

        {open && (
          <>
            <div className="fixed inset-0 z-[9998]" onClick={() => setOpen(false)} />
            <div className="absolute right-0 top-full mt-2 z-[9999] bg-white rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.15)] border border-amber-700/15 overflow-hidden min-w-[155px]">

              <div className="px-4 py-2 border-b border-amber-700/10 bg-amber-50 flex items-center gap-1.5">
                <HiGlobeAlt size={13} className="text-amber-700" />
                <p className="text-[10px] font-bold text-amber-700 tracking-widest uppercase m-0">
                  Language
                </p>
              </div>

              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => switchLang(lang.code)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left border-none cursor-pointer transition-colors
                    ${current === lang.code
                      ? 'bg-teal-600/10 text-teal-700'
                      : 'bg-white text-amber-900 hover:bg-amber-50'}`}
                >
                  <span className="text-[17px]">{lang.flag}</span>
                  <div>
                    <div className="font-bold leading-tight" style={{ fontSize: lang.fontSize }}>
                      {lang.full}
                    </div>
                    <div className="text-[10px] text-amber-600 mt-0.5">{lang.label}</div>
                  </div>
                  {current === lang.code && (
                    <HiCheck size={15} className="ml-auto text-teal-600 font-bold" />
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}