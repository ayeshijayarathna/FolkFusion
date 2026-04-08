import { useState, useEffect, useRef } from 'react';
import {
  RiBookOpenLine, RiEyeLine, RiEyeOffLine,
  RiSaveLine, RiImageAddLine, RiDeleteBinLine,
  RiPaletteLine, RiAddLine, RiBold, RiItalic,
  RiListUnordered, RiListOrdered, RiH1, RiH2,
  RiDoubleQuotesL, RiSeparator, RiAlignLeft,
  RiAlignCenter, RiAlignRight, RiCheckLine,
  RiLoader4Line, RiArrowRightLine, RiArrowLeftLine,
  RiEditLine, RiCloseLine, RiAlertLine,
  RiCheckboxCircleLine, RiDraftLine, RiRefreshLine,
  RiVideoLine, RiUploadCloud2Line,
} from 'react-icons/ri';
import { learningAPI } from '../../../services/api';
import { ART_CATEGORIES } from '../../../utils/constants';

/*constants*/
const CHAPTER_TITLES = [
  'Introduction', 'History', 'Techniques',
  'Cultural Significance', 'Famous Places', 'Artworks & Images',
];
const EMPTY_CHAPTERS = () =>
  CHAPTER_TITLES.map(title => ({ title, content: '', images: [], videoUrl: '', isPublished: false }));

/*toolbar button */
const ToolbarBtn = ({ onClick, active, title, children }) => (
  <button type="button" title={title}
    onMouseDown={e => { e.preventDefault(); onClick(); }}
    className={`p-1.5 rounded-lg transition-colors text-sm ${active ? 'bg-[#C97B5A] text-white' : 'text-[#6B5A50] hover:bg-[#C97B5A]/10 hover:text-[#C97B5A]'}`}>
    {children}
  </button>
);

/* text editor */
const RichEditor = ({ value, onChange, placeholder, editorKey }) => {
  const ref    = useRef(null);
  const keyRef = useRef(null);

  useEffect(() => {
    if (ref.current) { keyRef.current = editorKey; ref.current.innerHTML = value || ''; }
  }, [editorKey]);

  useEffect(() => {
    if (ref.current && keyRef.current !== editorKey) { keyRef.current = editorKey; ref.current.innerHTML = value || ''; }
  });

  const exec = (cmd, val = null) => { ref.current?.focus(); document.execCommand(cmd, false, val); fire(); };
  const fire = () => { if (ref.current) onChange(ref.current.innerHTML); };
  const qCmd = cmd => { try { return document.queryCommandState(cmd); } catch { return false; } };

  return (
    <div className="border border-[#E8DDD5] rounded-xl overflow-hidden focus-within:border-[#C97B5A] transition-colors">
      <div className="flex items-center gap-0.5 flex-wrap px-2 py-1.5 bg-[#FAF7F2] border-b border-[#E8DDD5]">
        <ToolbarBtn onClick={() => exec('bold')}                active={qCmd('bold')}                title="Bold"><RiBold size={15}/></ToolbarBtn>
        <ToolbarBtn onClick={() => exec('italic')}              active={qCmd('italic')}              title="Italic"><RiItalic size={15}/></ToolbarBtn>
        <div className="w-px h-4 bg-[#E8DDD5] mx-1"/>
        <ToolbarBtn onClick={() => exec('formatBlock','H2')}    title="H2"><RiH1 size={15}/></ToolbarBtn>
        <ToolbarBtn onClick={() => exec('formatBlock','H3')}    title="H3"><RiH2 size={15}/></ToolbarBtn>
        <ToolbarBtn onClick={() => exec('formatBlock','P')}     title="Paragraph"><span className="text-xs font-medium px-0.5">P</span></ToolbarBtn>
        <div className="w-px h-4 bg-[#E8DDD5] mx-1"/>
        <ToolbarBtn onClick={() => exec('insertUnorderedList')} active={qCmd('insertUnorderedList')} title="Bullets"><RiListUnordered size={15}/></ToolbarBtn>
        <ToolbarBtn onClick={() => exec('insertOrderedList')}   active={qCmd('insertOrderedList')}   title="Numbered"><RiListOrdered size={15}/></ToolbarBtn>
        <div className="w-px h-4 bg-[#E8DDD5] mx-1"/>
        <ToolbarBtn onClick={() => exec('formatBlock','BLOCKQUOTE')} title="Quote"><RiDoubleQuotesL size={15}/></ToolbarBtn>
        <ToolbarBtn onClick={() => exec('insertHorizontalRule')}     title="Divider"><RiSeparator size={15}/></ToolbarBtn>
        <div className="w-px h-4 bg-[#E8DDD5] mx-1"/>
        <ToolbarBtn onClick={() => exec('justifyLeft')}   active={qCmd('justifyLeft')}   title="Left"><RiAlignLeft size={15}/></ToolbarBtn>
        <ToolbarBtn onClick={() => exec('justifyCenter')} active={qCmd('justifyCenter')} title="Center"><RiAlignCenter size={15}/></ToolbarBtn>
        <ToolbarBtn onClick={() => exec('justifyRight')}  active={qCmd('justifyRight')}  title="Right"><RiAlignRight size={15}/></ToolbarBtn>
      </div>
      <div ref={ref} contentEditable suppressContentEditableWarning onInput={fire} onBlur={fire}
        data-placeholder={placeholder}
        className="min-h-[200px] p-4 text-sm text-[#3D3530] leading-relaxed outline-none rich-editor"
        style={{ fontFamily: "'Libre Baskerville', serif" }}/>
      <style>{`
        .rich-editor:empty:before{content:attr(data-placeholder);color:#C4B5AF;pointer-events:none}
        .rich-editor h2{font-size:1.1rem;font-weight:600;margin:.8rem 0 .4rem;color:#3D3530}
        .rich-editor h3{font-size:1rem;font-weight:600;margin:.6rem 0 .3rem;color:#3D3530}
        .rich-editor p{margin:.4rem 0}
        .rich-editor ul{list-style:disc;padding-left:1.4rem;margin:.4rem 0}
        .rich-editor ol{list-style:decimal;padding-left:1.4rem;margin:.4rem 0}
        .rich-editor blockquote{border-left:3px solid #C97B5A;padding-left:.8rem;color:#6B5A50;margin:.5rem 0;font-style:italic}
        .rich-editor hr{border:none;border-top:1px solid #E8DDD5;margin:.8rem 0}
      `}</style>
    </div>
  );
};

/* image uploader */
const ImageUploader = ({ images = [], onAdd, onRemove, max = 8, label = 'Add Image' }) => {
  const ref = useRef();
  const handleFile = file => {
    if (!file) return;
    const r = new FileReader(); r.onload = e => onAdd(e.target.result); r.readAsDataURL(file);
  };
  return (
    <div className="flex flex-wrap gap-2">
      {images.map((src, i) => (
        <div key={i} className="relative group w-20 h-20 rounded-lg overflow-hidden border border-[#E8DDD5]">
          <img src={src} alt="" className="w-full h-full object-cover"/>
          <button type="button" onClick={() => onRemove(i)}
            className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <RiDeleteBinLine size={16}/>
          </button>
        </div>
      ))}
      {images.length < max && (
        <button type="button" onClick={() => ref.current?.click()}
          className="w-20 h-20 rounded-lg border-2 border-dashed border-[#C97B5A]/30 hover:border-[#C97B5A] text-[#C97B5A]/50 hover:text-[#C97B5A] flex flex-col items-center justify-center gap-1 transition-all">
          <RiImageAddLine size={18}/>
          <span className="text-[9px] font-medium">{label}</span>
        </button>
      )}
      <input ref={ref} type="file" accept="image/*" className="hidden"
        onChange={e => { handleFile(e.target.files[0]); e.target.value = ''; }}/>
    </div>
  );
};

/* cover image uploader*/
const CoverUploader = ({ value, onChange }) => {
  const ref = useRef();
  const handleFile = file => {
    if (!file) return;
    const r = new FileReader(); r.onload = e => onChange(e.target.result); r.readAsDataURL(file);
  };
  return (
    <div>
      {value ? (
        <div className="relative group w-full h-36 rounded-xl overflow-hidden border border-[#E8DDD5]">
          <img src={value} alt="Cover" className="w-full h-full object-cover"/>
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button type="button" onClick={() => ref.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-[#3D3530] text-xs font-medium">
              <RiUploadCloud2Line size={13}/> Change
            </button>
            <button type="button" onClick={() => onChange('')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500 text-white text-xs font-medium">
              <RiDeleteBinLine size={13}/> Remove
            </button>
          </div>
        </div>
      ) : (
        <button type="button" onClick={() => ref.current?.click()}
          className="w-full h-36 rounded-xl border-2 border-dashed border-[#C97B5A]/30 hover:border-[#C97B5A] flex flex-col items-center justify-center gap-2 transition-all text-[#C97B5A]/50 hover:text-[#C97B5A]">
          <RiUploadCloud2Line size={28}/>
          <span className="text-xs font-medium">Upload Cover Image</span>
          <span className="text-[10px] text-[#9A8880]">Recommended: 1280×720px</span>
        </button>
      )}
      <input ref={ref} type="file" accept="image/*" className="hidden"
        onChange={e => { handleFile(e.target.files[0]); e.target.value = ''; }}/>
    </div>
  );
};

/*toast*/
const Toast = ({ msg, type, onDone }) => {
  useEffect(() => { if (!msg) return; const t = setTimeout(onDone, 3000); return () => clearTimeout(t); }, [msg, onDone]);
  if (!msg) return null;
  return (
    <div className={`fixed top-5 right-5 z-[9999] flex items-center gap-2.5 px-5 py-3 rounded-xl shadow-2xl text-white text-[13px] font-semibold ${type === 'error' ? 'bg-red-600' : 'bg-[#3D3530]'}`}
      style={{ fontFamily: "'Libre Baskerville', serif" }}>
      {type === 'error' ? <RiAlertLine size={16}/> : <RiCheckLine size={16}/>}{msg}
    </div>
  );
};

/*confirm */
const Confirm = ({ open, msg, onConfirm, onCancel }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 p-4">
      <div className="bg-[#FDF6EE] rounded-2xl border border-[#E8DDD5] p-6 max-w-sm w-full shadow-2xl">
        <p className="text-sm text-[#3D3530] mb-5 leading-relaxed">{msg}</p>
        <div className="flex gap-2">
          <button onClick={onConfirm} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-red-500 text-white hover:bg-red-600 transition-colors"><RiDeleteBinLine size={13}/> Delete</button>
          <button onClick={onCancel} className="px-4 py-2 rounded-xl text-xs font-semibold border border-[#E8DDD5] text-[#9A8880] hover:text-[#3D3530] transition-colors">Cancel</button>
        </div>
      </div>
    </div>
  );
};

/* main component*/
export default function LearningContent() {
  const [topTab,    setTopTab]    = useState('notes');
  const [notesMode, setNotesMode] = useState('list');
  const [contents,  setContents]  = useState([]);
  const [patterns,  setPatterns]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [toast,     setToast]     = useState({ msg: '', type: 'success' });
  const [confirm,   setConfirm]   = useState({ open: false, msg: '', cb: null });

  /* create/edit state */
  const [selectedCategory, setSelectedCategory] = useState('');
  const [coverImage,       setCoverImage]       = useState(''); 
  const [description,      setDescription]      = useState('');
  const [editingId,        setEditingId]        = useState(null);
  const [currentStep,      setCurrentStep]      = useState(0); 
  const [chapters,         setChapters]         = useState(EMPTY_CHAPTERS());

  /* pattern state */
  const [patternDraft,   setPatternDraft]   = useState({ title:'', description:'', images:[] });
  const [editingPattern, setEditingPattern] = useState(null);

  const notify = (msg, type='success') => setToast({ msg, type });

  /* fetch */
  const fetchAll = async () => {
    setLoading(true);
    try {
      const [cRes, pRes] = await Promise.all([learningAPI.adminGetAll(), learningAPI.adminGetPatterns()]);
      if (cRes.data?.success) setContents(cRes.data.data);
      if (pRes.data?.success) setPatterns(pRes.data.data);
    } catch (err) {
      notify(`Failed to load: ${err?.response?.data?.message || err.message}`, 'error');
    } finally { setLoading(false); }
  };
  useEffect(() => { fetchAll(); }, []);

  const usedCategories    = contents.map(c => c.category);
  const currentChapter    = chapters[currentStep - 1] || {};
  const updateChapterField = (field, value) =>
    setChapters(prev => prev.map((ch, i) => i === currentStep - 1 ? { ...ch, [field]: value } : ch));

  /* start create*/
  const startCreate = () => {
    setEditingId(null); setSelectedCategory(''); setCoverImage(''); setDescription('');
    setChapters(EMPTY_CHAPTERS()); setCurrentStep(0); setNotesMode('create');
  };

  /* start edit */
  const startEdit = doc => {
    setEditingId(doc._id); setSelectedCategory(doc.category);
    setCoverImage(doc.coverImage || ''); setDescription(doc.description || '');
    const merged = CHAPTER_TITLES.map((title, i) => {
      const ex = doc.chapters?.[i];
      return ex
        ? { title: ex.title || title, content: ex.content || '', images: ex.images || [], videoUrl: ex.videoUrl || '', isPublished: ex.isPublished || false }
        : { title, content: '', images: [], videoUrl: '', isPublished: false };
    });
    setChapters(merged); setCurrentStep(1); setNotesMode('edit');
  };

  /* save draft */
  const saveDraft = async () => {
    if (!editingId) return;
    setSaving(true);
    try {
      await learningAPI.adminUpdateChapter(editingId, currentStep - 1, chapters[currentStep - 1]);
      if (currentStep === 1) {
        await learningAPI.adminUpdateMeta(editingId, { description, coverImage });
      }
      notify('Draft saved!');
    } catch (err) { notify(err?.response?.data?.message || 'Save failed.', 'error'); }
    finally { setSaving(false); }
  };

  /* publish */
  const handlePublish = async () => {
    setSaving(true);
    try {
      if (editingId) {
        // Save cover & desc
        await learningAPI.adminUpdateMeta(editingId, { description, coverImage });
        // Save all chapters
        await Promise.all(chapters.map((ch, idx) => learningAPI.adminUpdateChapter(editingId, idx, ch)));
        const existing = contents.find(c => c._id === editingId);
        if (!existing?.isPublished) await learningAPI.adminTogglePublish(editingId);
        notify('Content updated & published!');
      } else {
        await learningAPI.adminCreateContent({ category: selectedCategory, description, coverImage, chapters, isPublished: true });
        notify('Content created & published!');
      }
      await fetchAll(); setNotesMode('list');
    } catch (err) { notify(err?.response?.data?.message || 'Publish failed.', 'error'); }
    finally { setSaving(false); }
  };

  const togglePublish = async id => {
    try { await learningAPI.adminTogglePublish(id); await fetchAll(); }
    catch { notify('Toggle failed.', 'error'); }
  };

  const deleteContent = (id, category) => setConfirm({
    open: true, msg: `Delete "${category}" content? Cannot be undone.`,
    cb: async () => {
      setConfirm(p => ({ ...p, open: false }));
      try { await learningAPI.adminDeleteContent(id); notify('Deleted.'); await fetchAll(); }
      catch { notify('Delete failed.', 'error'); }
    },
  });

  /* patterns */
  const savePattern = async () => {
    if (!patternDraft.title) { notify('Title required.', 'error'); return; }
    setSaving(true);
    try {
      const payload = { title: patternDraft.title, description: patternDraft.description, image: patternDraft.images[0] || '' };
      if (editingPattern) { await learningAPI.adminUpdatePattern(editingPattern, payload); notify('Pattern updated!'); }
      else                { await learningAPI.adminCreatePattern(payload); notify('Pattern added!'); }
      const res = await learningAPI.adminGetPatterns();
      if (res.data?.success) setPatterns(res.data.data);
      setPatternDraft({ title:'', description:'', images:[] }); setEditingPattern(null);
    } catch { notify('Save failed.', 'error'); }
    finally { setSaving(false); }
  };

  const deletePattern = id => setConfirm({
    open: true, msg: 'Delete this pattern?',
    cb: async () => {
      setConfirm(p => ({ ...p, open: false }));
      try { await learningAPI.adminDeletePattern(id); setPatterns(p => p.filter(x => x._id !== id)); notify('Deleted.'); }
      catch { notify('Delete failed.', 'error'); }
    },
  });

  if (loading) return <div className="flex items-center justify-center py-32"><div className="w-9 h-9 rounded-full border-2 border-t-[#C97B5A] border-[#C97B5A]/15 animate-spin"/></div>;

  return (
    <div className="flex flex-col" style={{ fontFamily: "'Libre Baskerville', serif" }}>
      <Toast msg={toast.msg} type={toast.type} onDone={() => setToast({ msg:'', type:'success' })}/>
      <Confirm open={confirm.open} msg={confirm.msg} onConfirm={confirm.cb} onCancel={() => setConfirm(p => ({ ...p, open:false }))}/>

      {/* top bar */}
      <div className="flex items-center justify-between mb-5 flex-shrink-0">
        <div>
          <h2 className="text-xl font-bold text-[#3D3530]" style={{ fontFamily:"'Cinzel Decorative', serif" }}>Learning Content</h2>
          <p className="text-xs text-[#9A8880] mt-0.5">{contents.length} categories · {patterns.length} traditional patterns</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchAll} className="p-2 rounded-xl border border-[#E8DDD5] text-[#9A8880] hover:text-[#3D3530] hover:bg-[#FAF7F2] transition-colors" title="Refresh"><RiRefreshLine size={15}/></button>
          <div className="flex gap-1 p-1 bg-[#FAF7F2] border border-[#E8DDD5] rounded-xl">
            {[{ key:'notes', Icon:RiBookOpenLine, label:'Learning Notes' }, { key:'patterns', Icon:RiPaletteLine, label:'Traditional Patterns' }].map(({ key, Icon, label }) => (
              <button key={key} onClick={() => { setTopTab(key); setNotesMode('list'); }}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${topTab===key ? 'bg-[#C97B5A] text-white shadow-sm' : 'text-[#9A8880] hover:text-[#3D3530]'}`}>
                <Icon size={13}/>{label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* notes tab*/}
      {topTab === 'notes' && (
        <>
          {/* LIST */}
          {notesMode === 'list' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs text-[#9A8880]">{contents.length} of {ART_CATEGORIES.length} categories have content</p>
                <button onClick={startCreate} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[#C97B5A] text-white hover:bg-[#b56a4a] transition-colors">
                  <RiAddLine size={14}/> Add New Content
                </button>
              </div>
              {contents.length === 0 ? (
                <div className="text-center py-20 text-[#9A8880]">
                  <RiBookOpenLine size={40} className="mx-auto mb-3 opacity-20"/>
                  <p className="font-semibold text-[#3D3530] mb-1">No content yet</p>
                  <p className="text-sm">Click "Add New Content" to create your first category.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {contents.map(doc => {
                    const pub = (doc.chapters||[]).filter(c=>c.isPublished).length;
                    return (
                      <div key={doc._id} className="bg-white border border-[#E8DDD5] rounded-xl p-4 flex items-center gap-4">
                        {doc.coverImage && (
                          <img src={doc.coverImage} alt="" className="w-14 h-14 rounded-lg object-cover flex-shrink-0 border border-[#E8DDD5]"/>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="font-semibold text-sm text-[#3D3530]">{doc.category}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${doc.isPublished ? 'bg-green-100 text-green-700' : 'bg-[#FAF7F2] text-[#9A8880] border border-[#E8DDD5]'}`}>
                              {doc.isPublished ? 'Published' : 'Draft'}
                            </span>
                          </div>
                          <p className="text-xs text-[#9A8880]">{pub}/{(doc.chapters||[]).length} chapters published</p>
                          {doc.description && <p className="text-[10px] text-[#9A8880] mt-0.5 truncate">{doc.description}</p>}
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => togglePublish(doc._id)} title={doc.isPublished ? 'Unpublish' : 'Publish'}
                            className={`p-2 rounded-lg border transition-colors ${doc.isPublished ? 'border-green-200 text-green-600 hover:bg-green-50' : 'border-[#E8DDD5] text-[#9A8880] hover:border-[#C97B5A] hover:text-[#C97B5A]'}`}>
                            {doc.isPublished ? <RiEyeLine size={15}/> : <RiEyeOffLine size={15}/>}
                          </button>
                          <button onClick={() => startEdit(doc)} className="p-2 rounded-lg border border-[#E8DDD5] text-[#9A8880] hover:border-[#C97B5A] hover:text-[#C97B5A] transition-colors"><RiEditLine size={15}/></button>
                          <button onClick={() => deleteContent(doc._id, doc.category)} className="p-2 rounded-lg border border-[#E8DDD5] text-[#9A8880] hover:border-red-300 hover:text-red-500 transition-colors"><RiDeleteBinLine size={15}/></button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/*create,edit*/}
          {(notesMode==='create' || notesMode==='edit') && (
            <div>
              <button onClick={() => setNotesMode('list')} className="flex items-center gap-1.5 text-xs text-[#9A8880] hover:text-[#3D3530] mb-4 transition-colors">
                <RiArrowLeftLine size={13}/> Back to list
              </button>

              {/* progress */}
              <div className="mb-5">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-[#3D3530]">
                    {notesMode==='edit' ? `Editing: ${selectedCategory}` :
                     currentStep===0 ? 'Step 1 of 7 — Select Category' :
                     `Step ${currentStep+1} of 7 — ${CHAPTER_TITLES[currentStep-1]}`}
                  </span>
                  <span className="text-xs text-[#9A8880]">{currentStep}/{CHAPTER_TITLES.length} chapters</span>
                </div>
                <div className="h-1.5 bg-[#E8DDD5] rounded-full overflow-hidden">
                  <div className="h-full bg-[#C97B5A] rounded-full transition-all duration-500" style={{ width:`${(currentStep/CHAPTER_TITLES.length)*100}%` }}/>
                </div>
                <div className="flex gap-2 mt-2.5">
                  {CHAPTER_TITLES.map((title, i) => (
                    <button key={i} onClick={() => { if (notesMode==='edit' || i<currentStep) setCurrentStep(i+1); }} title={title}
                      className={`h-2 rounded-full transition-all duration-300 ${currentStep>i ? 'bg-[#C97B5A] w-6 cursor-pointer' : currentStep===i+1 ? 'bg-[#C97B5A]/50 w-4 cursor-default' : notesMode==='edit' ? 'bg-[#E8DDD5] w-2 cursor-pointer hover:bg-[#C97B5A]/30' : 'bg-[#E8DDD5] w-2 cursor-default'}`}/>
                  ))}
                </div>
              </div>

              {/*Category & Cover */}
              {currentStep===0 && notesMode==='create' && (
                <div className="bg-white rounded-xl border border-[#E8DDD5] p-6 space-y-5">
                  <div>
                    <h3 className="text-base font-semibold text-[#3D3530] mb-1">Select a Category</h3>
                    <p className="text-xs text-[#9A8880] mb-4">Choose the art category. Categories with existing content are disabled.</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[260px] overflow-y-auto pr-1" style={{ scrollbarWidth:'thin' }}>
                      {ART_CATEGORIES.map(cat => {
                        const used = usedCategories.includes(cat);
                        const sel  = selectedCategory === cat;
                        return (
                          <button key={cat} onClick={() => !used && setSelectedCategory(cat)} disabled={used}
                            className={`text-left px-3 py-2.5 rounded-xl border text-xs font-medium transition-all ${sel ? 'bg-[#C97B5A] text-white border-[#C97B5A]' : used ? 'border-[#E8DDD5] text-[#C4B5AF] bg-[#FAF7F2]/50 cursor-not-allowed' : 'border-[#E8DDD5] text-[#3D3530] hover:border-[#C97B5A]/50 hover:bg-[#FAF7F2]'}`}>
                            {cat}{used && <span className="ml-1 text-[9px] opacity-60">(exists)</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Cover image */}
                  <div>
                    <label className="text-xs font-semibold text-[#3D3530] block mb-1.5">
                      Cover Image <span className="text-[#9A8880] font-normal">(optional — shown in category grid)</span>
                    </label>
                    <CoverUploader value={coverImage} onChange={setCoverImage}/>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="text-xs font-semibold text-[#3D3530] block mb-1.5">
                      Short Description <span className="text-[#9A8880] font-normal">(optional)</span>
                    </label>
                    <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2}
                      placeholder="Brief description of this art category…"
                      className="w-full border border-[#E8DDD5] rounded-xl px-3 py-2.5 text-sm text-[#3D3530] outline-none focus:border-[#C97B5A] transition-colors resize-none"/>
                  </div>

                  <button onClick={() => selectedCategory && setCurrentStep(1)} disabled={!selectedCategory}
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold bg-[#C97B5A] text-white hover:bg-[#b56a4a] disabled:opacity-40 transition-all">
                    Next — Fill in chapters <RiArrowRightLine size={14}/>
                  </button>
                </div>
              )}

              {/*Chapter editor */}
              {currentStep >= 1 && (
                <div className="bg-white rounded-xl border border-[#E8DDD5] p-5 flex flex-col gap-5">

                  {/* Cover,desc edit */}
                  {notesMode==='edit' && currentStep===1 && (
                    <div className="p-4 bg-[#FAF7F2] rounded-xl border border-[#E8DDD5] space-y-3">
                      <p className="text-xs font-semibold text-[#9A8880] uppercase tracking-wider">Category Info</p>
                      <div>
                        <label className="text-xs font-semibold text-[#3D3530] block mb-1.5">Cover Image</label>
                        <CoverUploader value={coverImage} onChange={setCoverImage}/>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-[#3D3530] block mb-1.5">Description</label>
                        <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2}
                          className="w-full border border-[#E8DDD5] rounded-xl px-3 py-2 text-sm text-[#3D3530] outline-none focus:border-[#C97B5A] transition-colors resize-none"/>
                      </div>
                    </div>
                  )}

                  {/* chapter header */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-[#9A8880] uppercase tracking-widest">{selectedCategory} · Chapter {currentStep} of {CHAPTER_TITLES.length}</p>
                      <h3 className="text-base font-semibold text-[#3D3530]">{CHAPTER_TITLES[currentStep-1]}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[#9A8880]">{currentChapter.isPublished ? 'Published' : 'Draft'}</span>
                      <div onClick={() => updateChapterField('isPublished', !currentChapter.isPublished)}
                        className={`relative w-10 h-5 rounded-full cursor-pointer transition-colors ${currentChapter.isPublished ? 'bg-green-500' : 'bg-[#D9D0CB]'}`}>
                        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${currentChapter.isPublished ? 'translate-x-5' : 'translate-x-0.5'}`}/>
                      </div>
                    </div>
                  </div>

                  {/* rich editor */}
                  <div>
                    <label className="text-xs font-semibold text-[#3D3530] block mb-1.5">Chapter Content</label>
                    <RichEditor
                      editorKey={`${selectedCategory}-ch${currentStep}`}
                      value={currentChapter.content||''}
                      onChange={v => updateChapterField('content', v)}
                      placeholder={`Write content for "${CHAPTER_TITLES[currentStep-1]}"…`}
                    />
                  </div>

                  {/* video URL (all chapters optional) */}
                  <div>
                    <label className="text-xs font-semibold text-[#3D3530] block mb-1.5">
                      <span className="flex items-center gap-1.5"><RiVideoLine size={13} className="text-[#C97B5A]"/> Video <span className="font-normal text-[#9A8880]">(optional — YouTube or Vimeo URL)</span></span>
                    </label>
                    <input type="url" value={currentChapter.videoUrl||''}
                      onChange={e => updateChapterField('videoUrl', e.target.value)}
                      placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
                      className="w-full border border-[#E8DDD5] rounded-xl px-3 py-2.5 text-sm text-[#3D3530] outline-none focus:border-[#C97B5A] transition-colors"/>
                    {currentChapter.videoUrl && (
                      <p className="text-[10px] text-green-600 mt-1 flex items-center gap-1"><RiCheckLine size={11}/> Video URL saved — will be embedded in public view</p>
                    )}
                  </div>

                  {/* images (all chapters optional) */}
                  <div>
                    <label className="text-xs font-semibold text-[#3D3530] block mb-1.5">
                      Chapter Images <span className="text-[#9A8880] font-normal ml-1">optional ({(currentChapter.images||[]).length}/8)</span>
                    </label>
                    <ImageUploader
                      images={currentChapter.images||[]}
                      onAdd={src => updateChapterField('images', [...(currentChapter.images||[]), src])}
                      onRemove={i => updateChapterField('images', (currentChapter.images||[]).filter((_,idx)=>idx!==i))}
                      max={8}
                    />
                    <p className="text-[10px] text-[#9A8880] mt-1.5">Images upload to Cloudinary on publish.</p>
                  </div>

                  {/* nav buttons */}
                  <div className="flex items-center justify-between pt-2 border-t border-[#F5F0EB]">
                    <div className="flex gap-2">
                      <button onClick={() => setCurrentStep(s => Math.max(notesMode==='create'?0:1, s-1))}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border border-[#E8DDD5] text-[#9A8880] hover:text-[#3D3530] transition-colors">
                        <RiArrowLeftLine size={13}/> Back
                      </button>
                      {editingId && (
                        <button onClick={saveDraft} disabled={saving}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border border-[#C97B5A]/40 text-[#C97B5A] hover:bg-[#C97B5A]/5 transition-colors disabled:opacity-50">
                          {saving ? <RiLoader4Line size={13} className="animate-spin"/> : <RiDraftLine size={13}/>} Save Draft
                        </button>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {currentStep < CHAPTER_TITLES.length && (
                        <button onClick={() => setCurrentStep(s=>s+1)}
                          className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-semibold bg-[#3D3530] text-white hover:bg-[#2a2420] transition-colors">
                          Next <RiArrowRightLine size={13}/>
                        </button>
                      )}
                      {currentStep === CHAPTER_TITLES.length && (
                        <button onClick={handlePublish} disabled={saving}
                          className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-semibold bg-[#C97B5A] text-white hover:bg-[#b56a4a] disabled:opacity-50 transition-colors">
                          {saving ? <><RiLoader4Line size={13} className="animate-spin"/> Saving…</> : <><RiCheckboxCircleLine size={13}/> {editingId?'Update & Publish':'Publish'}</>}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* patterns tab */}
      {topTab === 'patterns' && (
        <div className="flex gap-4" style={{ height:'calc(100vh - 210px)' }}>
          <div className="w-64 flex-shrink-0 flex flex-col gap-2 overflow-y-auto pr-1" style={{ scrollbarWidth:'thin' }}>
            <button onClick={() => { setEditingPattern(null); setPatternDraft({ title:'', description:'', images:[] }); }}
              className="flex items-center gap-2 px-3 py-2 rounded-xl border-2 border-dashed border-[#C97B5A]/30 hover:border-[#C97B5A] text-[#C97B5A] text-xs font-medium transition-all">
              <RiAddLine size={15}/> Add New Pattern
            </button>
            {patterns.map(p => (
              <div key={p._id}
                onClick={() => { setEditingPattern(p._id); setPatternDraft({ title:p.title, description:p.description||'', images:p.image?[p.image]:[] }); }}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border cursor-pointer transition-all ${editingPattern===p._id ? 'bg-[#C97B5A]/10 border-[#C97B5A]/30' : 'bg-white border-[#E8DDD5] hover:border-[#C97B5A]/30'}`}>
                {p.image ? <img src={p.image} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0"/>
                  : <div className="w-10 h-10 rounded-lg bg-[#C97B5A]/10 flex items-center justify-center flex-shrink-0"><RiPaletteLine size={15} className="text-[#C97B5A]"/></div>}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-[#3D3530] truncate">{p.title}</p>
                  <p className="text-[10px] text-[#9A8880] truncate">{p.description}</p>
                </div>
                <button onClick={e => { e.stopPropagation(); deletePattern(p._id); }} className="p-1 text-[#C4B5AF] hover:text-red-500 transition-colors flex-shrink-0"><RiDeleteBinLine size={12}/></button>
              </div>
            ))}
          </div>

          <div className="flex-1 bg-white rounded-xl border border-[#E8DDD5] p-5 flex flex-col gap-4 overflow-y-auto">
            <h3 className="text-sm font-semibold text-[#3D3530]">{editingPattern ? 'Edit Pattern' : 'New Pattern'}</h3>
            <div>
              <label className="text-xs font-semibold text-[#3D3530] block mb-1.5">Pattern Name <span className="text-[#C97B5A]">*</span></label>
              <input type="text" value={patternDraft.title} onChange={e => setPatternDraft(p=>({...p,title:e.target.value}))}
                placeholder="e.g. Dumbara Weave, Kandyan Floral"
                className="w-full border border-[#E8DDD5] rounded-xl px-3 py-2.5 text-sm text-[#3D3530] outline-none focus:border-[#C97B5A] transition-colors"/>
            </div>
            <div>
              <label className="text-xs font-semibold text-[#3D3530] block mb-1.5">Learning Description</label>
              <textarea value={patternDraft.description} onChange={e => setPatternDraft(p=>({...p,description:e.target.value}))} rows={4}
                placeholder="Describe the pattern…"
                className="w-full border border-[#E8DDD5] rounded-xl px-3 py-2.5 text-sm text-[#3D3530] outline-none focus:border-[#C97B5A] transition-colors resize-none"/>
            </div>
            <div>
              <label className="text-xs font-semibold text-[#3D3530] block mb-1.5">Images</label>
              <ImageUploader images={patternDraft.images}
                onAdd={src => setPatternDraft(p=>({...p,images:[...p.images,src]}))}
                onRemove={i => setPatternDraft(p=>({...p,images:p.images.filter((_,idx)=>idx!==i)}))}
                max={4}/>
              <p className="text-[10px] text-[#9A8880] mt-1">First image = thumbnail.</p>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <button onClick={savePattern} disabled={saving||!patternDraft.title}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-semibold bg-[#C97B5A] text-white hover:bg-[#b56a4a] disabled:opacity-50 transition-colors">
                {saving ? <><RiLoader4Line size={13} className="animate-spin"/> Saving…</> : <><RiSaveLine size={13}/> {editingPattern?'Update':'Add Pattern'}</>}
              </button>
              {editingPattern && (
                <button onClick={() => { setEditingPattern(null); setPatternDraft({ title:'',description:'',images:[] }); }}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-medium border border-[#E8DDD5] text-[#9A8880] hover:text-[#3D3530] transition-colors">
                  <RiCloseLine size={13}/> Cancel
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}