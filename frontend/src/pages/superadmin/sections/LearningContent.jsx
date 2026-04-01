import { useState, useEffect, useRef, useCallback } from 'react';
import {
  RiBookOpenLine, RiEyeLine, RiEyeOffLine,
  RiArrowLeftLine, RiSaveLine, RiImageAddLine,
  RiDeleteBinLine, RiPaletteLine, RiAddLine,
  RiBold, RiItalic, RiListUnordered, RiListOrdered,
  RiH1, RiH2, RiDoubleQuotesL, RiSeparator,
  RiAlignLeft, RiAlignCenter, RiAlignRight,
  RiCheckLine, RiLoader4Line,
} from 'react-icons/ri';
import { learningAPI } from '../../../services/api';

const ToolbarBtn = ({ onClick, active, title, children }) => (
  <button
    type="button"
    title={title}
    onMouseDown={e => { e.preventDefault(); onClick(); }}
    className={`p-1.5 rounded-lg transition-colors text-sm ${
      active ? 'bg-[#C97B5A] text-white' : 'text-[#6B5A50] hover:bg-[#C97B5A]/10 hover:text-[#C97B5A]'
    }`}
  >
    {children}
  </button>
);

const RichEditor = ({ value, onChange, placeholder }) => {
  const editorRef = useRef(null);
  const isInit    = useRef(false);

  useEffect(() => {
    if (editorRef.current && !isInit.current) {
      editorRef.current.innerHTML = value || '';
      isInit.current = true;
    }
  }, []);

  // When value resets (category switch), re-init
  useEffect(() => {
    if (editorRef.current && value === '') {
      editorRef.current.innerHTML = '';
    }
  }, [value]);

  const exec = (cmd, val = null) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, val);
    fire();
  };

  const fire = () => {
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  };

  const queryCmd = (cmd) => {
    try { return document.queryCommandState(cmd); } catch { return false; }
  };

  return (
    <div className="border border-[#E8DDD5] rounded-xl overflow-hidden focus-within:border-[#C97B5A] transition-colors">
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 flex-wrap px-2 py-1.5 bg-[#FAF7F2] border-b border-[#E8DDD5]">
        <ToolbarBtn onClick={() => exec('bold')}          active={queryCmd('bold')}          title="Bold"><RiBold size={15}/></ToolbarBtn>
        <ToolbarBtn onClick={() => exec('italic')}        active={queryCmd('italic')}        title="Italic"><RiItalic size={15}/></ToolbarBtn>
        <div className="w-px h-4 bg-[#E8DDD5] mx-1"/>
        <ToolbarBtn onClick={() => exec('formatBlock','H2')} title="Heading 2"><RiH1 size={15}/></ToolbarBtn>
        <ToolbarBtn onClick={() => exec('formatBlock','H3')} title="Heading 3"><RiH2 size={15}/></ToolbarBtn>
        <ToolbarBtn onClick={() => exec('formatBlock','P')}  title="Paragraph"><span className="text-xs font-medium px-0.5">P</span></ToolbarBtn>
        <div className="w-px h-4 bg-[#E8DDD5] mx-1"/>
        <ToolbarBtn onClick={() => exec('insertUnorderedList')} active={queryCmd('insertUnorderedList')} title="Bullet list"><RiListUnordered size={15}/></ToolbarBtn>
        <ToolbarBtn onClick={() => exec('insertOrderedList')}   active={queryCmd('insertOrderedList')}   title="Numbered list"><RiListOrdered size={15}/></ToolbarBtn>
        <div className="w-px h-4 bg-[#E8DDD5] mx-1"/>
        <ToolbarBtn onClick={() => exec('formatBlock','BLOCKQUOTE')} title="Quote"><RiDoubleQuotesL size={15}/></ToolbarBtn>
        <ToolbarBtn onClick={() => exec('insertHorizontalRule')}     title="Divider"><RiSeparator size={15}/></ToolbarBtn>
        <div className="w-px h-4 bg-[#E8DDD5] mx-1"/>
        <ToolbarBtn onClick={() => exec('justifyLeft')}   active={queryCmd('justifyLeft')}   title="Align left"><RiAlignLeft size={15}/></ToolbarBtn>
        <ToolbarBtn onClick={() => exec('justifyCenter')} active={queryCmd('justifyCenter')} title="Center"><RiAlignCenter size={15}/></ToolbarBtn>
        <ToolbarBtn onClick={() => exec('justifyRight')}  active={queryCmd('justifyRight')}  title="Align right"><RiAlignRight size={15}/></ToolbarBtn>
      </div>

      {/* Editable area */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={fire}
        onBlur={fire}
        data-placeholder={placeholder}
        className="min-h-[220px] p-4 text-sm text-[#3D3530] leading-relaxed outline-none rich-editor"
        style={{ fontFamily: "'Libre Baskerville', serif" }}
      />

      <style>{`
        .rich-editor:empty:before { content: attr(data-placeholder); color: #C4B5AF; }
        .rich-editor h2 { font-size:1.1rem; font-weight:600; margin:0.8rem 0 0.4rem; color:#3D3530; }
        .rich-editor h3 { font-size:1rem; font-weight:600; margin:0.6rem 0 0.3rem; color:#3D3530; }
        .rich-editor p  { margin:0.4rem 0; }
        .rich-editor ul { list-style:disc; padding-left:1.4rem; margin:0.4rem 0; }
        .rich-editor ol { list-style:decimal; padding-left:1.4rem; margin:0.4rem 0; }
        .rich-editor blockquote { border-left:3px solid #C97B5A; padding-left:0.8rem; color:#6B5A50; margin:0.5rem 0; font-style:italic; }
        .rich-editor hr { border:none; border-top:1px solid #E8DDD5; margin:0.8rem 0; }
      `}</style>
    </div>
  );
};

/* image uploader */
const ImageUploader = ({ images = [], onAdd, onRemove, label = 'Add Image' }) => {
  const ref = useRef();

  const handleFile = async (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => onAdd(e.target.result); // base64 preview
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {images.map((src, i) => (
          <div key={i} className="relative group w-20 h-20 rounded-lg overflow-hidden border border-[#E8DDD5]">
            <img src={src} alt="" className="w-full h-full object-cover"/>
            <button
              type="button"
              onClick={() => onRemove(i)}
              className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <RiDeleteBinLine size={16}/>
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => ref.current?.click()}
          className="w-20 h-20 rounded-lg border-2 border-dashed border-[#C97B5A]/30 hover:border-[#C97B5A] text-[#C97B5A]/50 hover:text-[#C97B5A] flex flex-col items-center justify-center gap-1 transition-all"
        >
          <RiImageAddLine size={18}/>
          <span className="text-[9px] font-medium">{label}</span>
        </button>
      </div>
      <input ref={ref} type="file" accept="image/*" className="hidden"
        onChange={e => handleFile(e.target.files[0])}/>
    </div>
  );
};

/* main component */
const CHAPTER_TITLES = [
  'Introduction', 'History', 'Techniques',
  'Cultural Significance', 'Famous Places', 'Artworks & Images',
];

export default function LearningContent() {
  //state
  const [tab, setTab]               = useState('notes');
  const [contents, setContents]     = useState([]);
  const [patterns, setPatterns]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [saved, setSaved]           = useState(false);

  // notes panel
  const [selectedCat, setSelectedCat]       = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(0);
  const [draft, setDraft] = useState({ content: '', images: [], isPublished: false });

  // patterns panel
  const [patternDraft, setPatternDraft] = useState({ title: '', description: '', image: '' });
  const [editingPattern, setEditingPattern] = useState(null); 

  // fetch all data on mount
  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [cRes, pRes] = await Promise.all([
        learningAPI.adminGetAll(),
        learningAPI.adminGetPatterns(),
      ]);
      if (cRes.data.success) {
        setContents(cRes.data.data);
        if (!selectedCat && cRes.data.data.length) {
          loadCategory(cRes.data.data[0], 0, cRes.data.data);
        }
      }
      if (pRes.data.success) setPatterns(pRes.data.data);
    } finally { setLoading(false); }
  };

  const loadCategory = (cat, chIdx = 0, list = contents) => {
    const fresh = list.find(c => c._id === cat._id) || cat;
    setSelectedCat(fresh);
    setSelectedChapter(chIdx);
    const ch = fresh.chapters[chIdx];
    setDraft({
      content:     ch?.content     || '',
      images:      ch?.images      || [],
      isPublished: ch?.isPublished || false,
    });
  };

  const switchChapter = (idx) => {
    if (!selectedCat) return;
    setSelectedChapter(idx);
    const ch = selectedCat.chapters[idx];
    setDraft({
      content:     ch?.content     || '',
      images:      ch?.images      || [],
      isPublished: ch?.isPublished || false,
    });
  };

  // save chapter changes
  const saveChapter = async () => {
    if (!selectedCat) return;
    setSaving(true);
    try {
      await learningAPI.adminUpdateChapter(selectedCat._id, selectedChapter, draft);
      // refresh contents
      const res = await learningAPI.adminGetAll();
      if (res.data.success) {
        setContents(res.data.data);
        const fresh = res.data.data.find(c => c._id === selectedCat._id);
        setSelectedCat(fresh);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally { setSaving(false); }
  };

  // toggle category publish status
  const toggleCatPublish = async (id, e) => {
    e.stopPropagation();
    await learningAPI.adminTogglePublish(id);
    const res = await learningAPI.adminGetAll();
    if (res.data.success) {
      setContents(res.data.data);
      if (selectedCat?._id === id) {
        setSelectedCat(res.data.data.find(c => c._id === id));
      }
    }
  };

  //patterns
  const savePattern = async () => {
    setSaving(true);
    try {
      if (editingPattern) {
        await learningAPI.adminUpdatePattern(editingPattern, patternDraft);
      } else {
        await learningAPI.adminCreatePattern(patternDraft);
      }
      const res = await learningAPI.adminGetPatterns();
      if (res.data.success) setPatterns(res.data.data);
      setPatternDraft({ title: '', description: '', image: '' });
      setEditingPattern(null);
      setSaved(true); setTimeout(() => setSaved(false), 2000);
    } finally { setSaving(false); }
  };

  const deletePattern = async (id) => {
    if (!window.confirm('Delete this pattern?')) return;
    await learningAPI.adminDeletePattern(id);
    setPatterns(p => p.filter(x => x._id !== id));
  };

  // helpers
  const chapterPublishedCount = (cat) =>
    cat.chapters.filter(c => c.isPublished).length;

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <div className="w-9 h-9 rounded-full border-2 border-t-[#C97B5A] border-[#C97B5A]/15 animate-spin"/>
    </div>
  );

  return (
    <div className="flex flex-col h-full" style={{ fontFamily: "'Libre Baskerville', serif" }}>

      {/*top bar */}
      <div className="flex items-center justify-between mb-5 flex-shrink-0">
        <div>
          <h2 className="text-xl font-bold text-[#3D3530]"
            style={{ fontFamily: "'Cinzel Decorative', serif" }}>
            Learning Content
          </h2>
          <p className="text-xs text-[#9A8880] mt-0.5">
            {contents.length} categories · {patterns.length} patterns
          </p>
        </div>
        {/* Tab switcher */}
        <div className="flex gap-1 p-1 bg-[#FAF7F2] border border-[#E8DDD5] rounded-xl">
          {[
            { key: 'notes',    Icon: RiBookOpenLine,  label: 'Notes'    },
            { key: 'patterns', Icon: RiPaletteLine,   label: 'Patterns' },
          ].map(({ key, Icon, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                tab === key
                  ? 'bg-[#C97B5A] text-white shadow-sm'
                  : 'text-[#9A8880] hover:text-[#3D3530]'
              }`}
            >
              <Icon size={14}/>{label}
            </button>
          ))}
        </div>
      </div>

      {/* notes tab */}
      {tab === 'notes' && (
        <div className="flex gap-4 flex-1 min-h-0" style={{ height: 'calc(100vh - 200px)' }}>

          {/* LEFT — category list */}
          <div className="w-56 flex-shrink-0 flex flex-col gap-1 overflow-y-auto pr-1"
            style={{ scrollbarWidth: 'thin' }}>
            <p className="text-[10px] font-semibold text-[#9A8880] uppercase tracking-widest px-2 mb-1">
              Categories
            </p>
            {contents.map(cat => {
              const isActive = selectedCat?._id === cat._id;
              const pCount   = chapterPublishedCount(cat);
              return (
                <button
                  key={cat._id}
                  onClick={() => loadCategory(cat, 0)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl transition-all group ${
                    isActive
                      ? 'bg-[#C97B5A]/12 border border-[#C97B5A]/25'
                      : 'hover:bg-[#FAF7F2] border border-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className={`text-xs font-medium leading-tight ${
                      isActive ? 'text-[#C97B5A]' : 'text-[#3D3530]'
                    }`}>{cat.category}</span>
                    <button
                      onClick={e => toggleCatPublish(cat._id, e)}
                      className={`flex-shrink-0 p-0.5 rounded transition-colors ${
                        cat.isPublished ? 'text-green-500' : 'text-[#C4B5AF]'
                      }`}
                    >
                      {cat.isPublished ? <RiEyeLine size={12}/> : <RiEyeOffLine size={12}/>}
                    </button>
                  </div>
                  <div className="mt-1 text-[9px] text-[#9A8880]">
                    {pCount}/{cat.chapters.length} chapters published
                  </div>
                </button>
              );
            })}
          </div>

          {selectedCat && (
            <div className="flex-1 flex flex-col min-w-0 gap-3">
              {/* Chapter selector */}
              <div className="flex gap-1 flex-wrap">
                {selectedCat.chapters.map((ch, i) => (
                  <button
                    key={i}
                    onClick={() => switchChapter(i)}
                    className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all border ${
                      selectedChapter === i
                        ? 'bg-[#3D3530] text-white border-[#3D3530]'
                        : 'border-[#E8DDD5] text-[#9A8880] hover:border-[#C97B5A]/40 hover:text-[#C97B5A]'
                    }`}
                  >
                    {i + 1}. {ch.title}
                    {ch.isPublished && (
                      <span className="ml-1 inline-block w-1.5 h-1.5 rounded-full bg-green-400 align-middle"/>
                    )}
                  </button>
                ))}
              </div>

              {/* Editor card */}
              <div className="flex-1 bg-white rounded-xl border border-[#E8DDD5] p-5 flex flex-col gap-4 overflow-y-auto">
                {/* Chapter header */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-[#9A8880] uppercase tracking-widest">
                      {selectedCat.category}
                    </p>
                    <h3 className="text-base font-semibold text-[#3D3530]">
                      Chapter {selectedChapter + 1} — {selectedCat.chapters[selectedChapter]?.title}
                    </h3>
                  </div>
                  {/* Publish toggle */}
                  <label className="flex items-center gap-2 cursor-pointer">
                    <span className="text-xs text-[#9A8880]">
                      {draft.isPublished ? 'Published' : 'Draft'}
                    </span>
                    <div
                      onClick={() => setDraft(p => ({ ...p, isPublished: !p.isPublished }))}
                      className={`relative w-10 h-5 rounded-full cursor-pointer transition-colors ${
                        draft.isPublished ? 'bg-green-500' : 'bg-[#D9D0CB]'
                      }`}
                    >
                      <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                        draft.isPublished ? 'translate-x-5' : 'translate-x-0.5'
                      }`}/>
                    </div>
                  </label>
                </div>

                {/* Rich text editor */}
                <div>
                  <label className="text-xs font-semibold text-[#3D3530] block mb-1.5">
                    Chapter Content
                  </label>
                  <RichEditor
                    key={`${selectedCat._id}-${selectedChapter}`}
                    value={draft.content}
                    onChange={v => setDraft(p => ({ ...p, content: v }))}
                    placeholder="Write chapter content here… Use the toolbar to format text."
                  />
                </div>

                {/* Image uploader */}
                <div>
                  <label className="text-xs font-semibold text-[#3D3530] block mb-1.5">
                    Chapter Images
                  </label>
                  <ImageUploader
                    images={draft.images}
                    onAdd={src => setDraft(p => ({ ...p, images: [...p.images, src] }))}
                    onRemove={i => setDraft(p => ({ ...p, images: p.images.filter((_, idx) => idx !== i) }))}
                  />
                  <p className="text-[10px] text-[#9A8880] mt-1">
                    Images will be uploaded to Cloudinary on save.
                  </p>
                </div>

                {/* Save */}
                <div className="flex items-center gap-3 pt-1">
                  <button
                    onClick={saveChapter}
                    disabled={saving}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      saved
                        ? 'bg-green-500 text-white'
                        : 'bg-[#C97B5A] text-white hover:bg-[#b56a4a]'
                    } disabled:opacity-60`}
                  >
                    {saving ? (
                      <><RiLoader4Line size={15} className="animate-spin"/> Saving…</>
                    ) : saved ? (
                      <><RiCheckLine size={15}/> Saved!</>
                    ) : (
                      <><RiSaveLine size={15}/> Save Chapter</>
                    )}
                  </button>
                  <p className="text-xs text-[#9A8880]">
                    Changes are saved per chapter
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* patterns*/}
      {tab === 'patterns' && (
        <div className="flex gap-4 flex-1 min-h-0" style={{ height: 'calc(100vh - 200px)' }}>

          {/* LEFT — pattern list */}
          <div className="w-64 flex-shrink-0 flex flex-col gap-2 overflow-y-auto pr-1"
            style={{ scrollbarWidth: 'thin' }}>
            <button
              onClick={() => { setEditingPattern(null); setPatternDraft({ title: '', description: '', image: '' }); }}
              className="flex items-center gap-2 px-3 py-2 rounded-xl border-2 border-dashed border-[#C97B5A]/30 hover:border-[#C97B5A] text-[#C97B5A] text-sm font-medium transition-all"
            >
              <RiAddLine size={16}/> Add New Pattern
            </button>
            {patterns.map(p => (
              <div
                key={p._id}
                onClick={() => {
                  setEditingPattern(p._id);
                  setPatternDraft({ title: p.title, description: p.description, image: p.image });
                }}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border cursor-pointer transition-all ${
                  editingPattern === p._id
                    ? 'bg-[#C97B5A]/10 border-[#C97B5A]/30'
                    : 'bg-white border-[#E8DDD5] hover:border-[#C97B5A]/30'
                }`}
              >
                {p.image ? (
                  <img src={p.image} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0"/>
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-[#C97B5A]/10 flex items-center justify-center flex-shrink-0">
                    <RiPaletteLine size={16} className="text-[#C97B5A]"/>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#3D3530] truncate">{p.title}</p>
                  <p className="text-xs text-[#9A8880] truncate">{p.description}</p>
                </div>
                <button
                  onClick={e => { e.stopPropagation(); deletePattern(p._id); }}
                  className="p-1 text-[#C4B5AF] hover:text-red-500 transition-colors"
                >
                  <RiDeleteBinLine size={13}/>
                </button>
              </div>
            ))}
          </div>

          {/* RIGHT — pattern editor */}
          <div className="flex-1 bg-white rounded-xl border border-[#E8DDD5] p-5 flex flex-col gap-4 overflow-y-auto">
            <h3 className="text-base font-semibold text-[#3D3530]">
              {editingPattern ? 'Edit Pattern' : 'Add New Pattern'}
            </h3>

            {/* Image */}
            <div>
              <label className="text-xs font-semibold text-[#3D3530] block mb-1.5">Pattern Image</label>
              {patternDraft.image ? (
                <div className="relative w-36 h-36 rounded-xl overflow-hidden border border-[#E8DDD5] group">
                  <img src={patternDraft.image} alt="" className="w-full h-full object-cover"/>
                  <button
                    type="button"
                    onClick={() => setPatternDraft(p => ({ ...p, image: '' }))}
                    className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <RiDeleteBinLine size={20}/>
                  </button>
                </div>
              ) : (
                <label className="w-36 h-36 rounded-xl border-2 border-dashed border-[#C97B5A]/30 hover:border-[#C97B5A] flex flex-col items-center justify-center gap-2 cursor-pointer transition-all text-[#C97B5A]/50 hover:text-[#C97B5A]">
                  <RiImageAddLine size={28}/>
                  <span className="text-xs font-medium">Upload image</span>
                  <input type="file" accept="image/*" className="hidden"
                    onChange={e => {
                      const f = e.target.files[0];
                      if (!f) return;
                      const r = new FileReader();
                      r.onload = ev => setPatternDraft(p => ({ ...p, image: ev.target.result }));
                      r.readAsDataURL(f);
                    }}
                  />
                </label>
              )}
            </div>

            {/* Title */}
            <div>
              <label className="text-xs font-semibold text-[#3D3530] block mb-1.5">Pattern Title</label>
              <input
                type="text"
                value={patternDraft.title}
                onChange={e => setPatternDraft(p => ({ ...p, title: e.target.value }))}
                placeholder="e.g. Dumbara Weave, Kandyan Floral"
                className="w-full border border-[#E8DDD5] rounded-xl px-3 py-2.5 text-sm text-[#3D3530] outline-none focus:border-[#C97B5A] transition-colors"
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-xs font-semibold text-[#3D3530] block mb-1.5">Short Description</label>
              <textarea
                value={patternDraft.description}
                onChange={e => setPatternDraft(p => ({ ...p, description: e.target.value }))}
                rows={3}
                placeholder="Brief description of this traditional pattern…"
                className="w-full border border-[#E8DDD5] rounded-xl px-3 py-2.5 text-sm text-[#3D3530] outline-none focus:border-[#C97B5A] transition-colors resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-1">
              <button
                onClick={savePattern}
                disabled={saving || !patternDraft.title}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  saved ? 'bg-green-500 text-white' : 'bg-[#C97B5A] text-white hover:bg-[#b56a4a]'
                } disabled:opacity-50`}
              >
                {saving ? (
                  <><RiLoader4Line size={15} className="animate-spin"/> Saving…</>
                ) : saved ? (
                  <><RiCheckLine size={15}/> Saved!</>
                ) : (
                  <><RiSaveLine size={15}/> {editingPattern ? 'Update Pattern' : 'Add Pattern'}</>
                )}
              </button>
              {editingPattern && (
                <button
                  onClick={() => { setEditingPattern(null); setPatternDraft({ title: '', description: '', image: '' }); }}
                  className="px-4 py-2.5 rounded-xl text-sm text-[#9A8880] border border-[#E8DDD5] hover:text-[#3D3530] transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}