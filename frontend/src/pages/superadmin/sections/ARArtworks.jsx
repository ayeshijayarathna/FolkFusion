import { useState, useEffect, useRef } from 'react';
import {
  RiAddLine, RiDeleteBinLine, RiEditLine, RiEyeLine,
  RiEyeOffLine, RiLoader4Line, RiCheckLine, RiAlertLine,
  RiCloseLine, RiUploadCloud2Line, RiRefreshLine,
  RiBox3Line, RiImageLine, RiSaveLine, RiExternalLinkLine,
} from 'react-icons/ri';
import { arArtworkAPI } from '../../../services/api';
import { ART_CATEGORIES } from '../../../utils/constants';

/*toast*/
const Toast = ({ msg, type, onDone }) => {
  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(onDone, 4000);
    return () => clearTimeout(t);
  }, [msg, onDone]);
  if (!msg) return null;
  return (
    <div
      className={`fixed top-5 right-5 z-[9999] flex items-center gap-2.5 px-5 py-3 rounded-xl shadow-2xl text-white text-[13px] font-semibold max-w-sm
        ${type === 'error' ? 'bg-red-600' : 'bg-[#3D3530]'}`}
      style={{ fontFamily: "'Libre Baskerville', serif" }}
    >
      {type === 'error'
        ? <RiAlertLine size={16} className="flex-shrink-0"/>
        : <RiCheckLine size={16} className="flex-shrink-0"/>
      }
      <span>{msg}</span>
    </div>
  );
};

/*confirm dialog*/
const Confirm = ({ open, msg, onConfirm, onCancel }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 p-4">
      <div className="bg-[#FDF6EE] rounded-2xl border border-[#E8DDD5] p-6 max-w-sm w-full shadow-2xl">
        <p className="text-sm text-[#3D3530] mb-5 leading-relaxed">{msg}</p>
        <div className="flex gap-2">
          <button
            onClick={onConfirm}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-red-500 text-white hover:bg-red-600 transition-colors"
          >
            <RiDeleteBinLine size={13}/> Delete
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-xl text-xs font-semibold border border-[#E8DDD5] text-[#9A8880] hover:text-[#3D3530] transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

/*image picker*/
const ImagePicker = ({ value, onChange }) => {
  const ref = useRef();

  const handleFile = file => {
    if (!file) return;
    const r = new FileReader();
    r.onload = e => onChange(e.target.result);
    r.readAsDataURL(file);
  };

  return (
    <div>
      {value ? (
        <div className="relative group w-full h-36 rounded-xl overflow-hidden border border-[#E8DDD5]">
          <img src={value} alt="" className="w-full h-full object-cover"/>
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button type="button" onClick={() => ref.current?.click()}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white text-[#3D3530] text-xs font-medium">
              <RiUploadCloud2Line size={12}/> Change
            </button>
            <button type="button" onClick={() => onChange('')}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500 text-white text-xs font-medium">
              <RiDeleteBinLine size={12}/> Remove
            </button>
          </div>
        </div>
      ) : (
        <button type="button" onClick={() => ref.current?.click()}
          className="w-full h-36 rounded-xl border-2 border-dashed border-[#C97B5A]/30 hover:border-[#C97B5A] flex flex-col items-center justify-center gap-2 transition-all text-[#C97B5A]/50 hover:text-[#C97B5A]">
          <RiImageLine size={24}/>
          <span className="text-xs font-medium">Upload Thumbnail</span>
        </button>
      )}
      <input ref={ref} type="file" accept="image/*" className="hidden"
        onChange={e => { handleFile(e.target.files[0]); e.target.value = ''; }}/>
    </div>
  );
};

/*GLB Picker — no size limit, saved to local server*/
const GLBPicker = ({ value, onChange }) => {
  const ref = useRef();
  const [fileInfo, setFileInfo] = useState('');

  const isExistingPath = value && (value.startsWith('/models/') || value.startsWith('http'));
  const isNewFile      = value && value.startsWith('data:');
  const hasModel       = isExistingPath || isNewFile;

  const handleFile = file => {
    if (!file) return;

    if (!file.name.endsWith('.glb') && !file.name.endsWith('.gltf')) {
      alert('Please select a .glb or .gltf file');
      return;
    }

    const sizeMB = (file.size / 1024 / 1024).toFixed(1);
    setFileInfo(`${file.name} · ${sizeMB}MB`);

    const r = new FileReader();
    r.onload = e => onChange(e.target.result);
    r.readAsDataURL(file);
  };

  // build preview URL for existing local/cloudinary models
  const previewUrl = isExistingPath
    ? (value.startsWith('/models/')
        ? `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${value}`
        : value)
    : null;

  return (
    <div>
      {hasModel ? (
        <div className="flex items-center gap-3 p-3 bg-[#FAF7F2] border border-[#E8DDD5] rounded-xl">
          <div className="w-10 h-10 rounded-lg bg-[#C97B5A]/10 flex items-center justify-center flex-shrink-0">
            <RiBox3Line size={20} className="text-[#C97B5A]"/>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-[#3D3530] truncate">
              {isNewFile
                ? (fileInfo || 'New model ready')
                : value.split('/').pop()
              }
            </p>
            <p className={`text-[10px] flex items-center gap-1 mt-0.5 ${isExistingPath ? 'text-green-600' : 'text-amber-600'}`}>
              <RiCheckLine size={10}/>
              {isExistingPath ? 'Saved on server' : 'Will save on server when you click Save'}
            </p>
          </div>
          <div className="flex gap-1.5">
            <button type="button" onClick={() => ref.current?.click()}
              className="px-2.5 py-1.5 rounded-lg bg-[#C97B5A]/10 text-[#C97B5A] text-[10px] font-medium hover:bg-[#C97B5A]/20 transition-colors">
              Replace
            </button>
            <button type="button" onClick={() => { onChange(''); setFileInfo(''); }}
              className="px-2.5 py-1.5 rounded-lg bg-red-50 text-red-500 text-[10px] font-medium hover:bg-red-100 transition-colors">
              Remove
            </button>
          </div>
        </div>
      ) : (
        <button type="button" onClick={() => ref.current?.click()}
          className="w-full h-20 rounded-xl border-2 border-dashed border-[#C97B5A]/30 hover:border-[#C97B5A] flex items-center justify-center gap-3 transition-all text-[#C97B5A]/50 hover:text-[#C97B5A]">
          <RiBox3Line size={24}/>
          <div className="text-left">
            <p className="text-xs font-medium">Upload 3D Model</p>
            <p className="text-[10px] opacity-70">.glb or .gltf · any size · saved on server</p>
          </div>
        </button>
      )}

      {/* 3D preview for saved models */}
      {previewUrl && (
        <div className="mt-2 rounded-xl overflow-hidden border border-[#E8DDD5] bg-[#0D0B0A]">
          <p className="text-[10px] text-[#9A8880] px-3 py-1.5 bg-[#1A1510] uppercase tracking-wider font-semibold">
            3D Preview
          </p>
          <model-viewer
            src={previewUrl}
            camera-controls
            auto-rotate
            style={{ width: '100%', height: '200px', background: 'transparent' }}
          />
        </div>
      )}

      <input ref={ref} type="file" accept=".glb,.gltf" className="hidden"
        onChange={e => { handleFile(e.target.files[0]); e.target.value = ''; }}/>
    </div>
  );
};

/*main component*/
export default function ARArtworks() {
  const [artworks,  setArtworks]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [toast,     setToast]     = useState({ msg: '', type: 'success' });
  const [confirm,   setConfirm]   = useState({ open: false, msg: '', cb: null });
  const [mode,      setMode]      = useState('list');
  const [editingId, setEditingId] = useState(null);

  const EMPTY = {
    title: '', description: '', category: '',
    image: '', glbModel: '', isPublished: false,
  };
  const [form, setForm] = useState(EMPTY);

  const notify = (msg, type = 'success') => setToast({ msg, type });
  const setV   = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  /*fetch all*/
  const fetchAll = async () => {
    setLoading(true);
    try {
      const res = await arArtworkAPI.adminGetAll();
      if (res.data?.success) setArtworks(res.data.data);
    } catch (err) {
      notify(err?.response?.data?.message || 'Failed to load.', 'error');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  /*start create*/
  const startCreate = () => {
    setForm(EMPTY);
    setEditingId(null);
    setMode('create');
  };

  /*start edit*/
  const startEdit = doc => {
    setForm({
      title:       doc.title       || '',
      description: doc.description || '',
      category:    doc.category    || '',
      image:       doc.image       || '',
      glbModel:    doc.glbModel    || '',
      isPublished: doc.isPublished || false,
    });
    setEditingId(doc._id);
    setMode('edit');
  };

  /*save*/
  const handleSave = async () => {
    if (!form.title.trim()) { notify('Title is required.', 'error'); return; }
    setSaving(true);
    try {
      const res = editingId
        ? await arArtworkAPI.adminUpdate(editingId, form)
        : await arArtworkAPI.adminCreate(form);
      notify(res.data?.message || (editingId ? 'Updated!' : 'Created!'));
      await fetchAll();
      setMode('list');
    } catch (err) {
      console.error('AR save error:', err);
      notify(err?.response?.data?.message || 'Save failed.', 'error');
    } finally { setSaving(false); }
  };

  /*toggle publish*/
  const togglePublish = async id => {
    try {
      await arArtworkAPI.adminToggle(id);
      await fetchAll();
      notify('Status updated!');
    } catch { notify('Toggle failed.', 'error'); }
  };

  /*delete */
  const handleDelete = id => setConfirm({
    open: true,
    msg:  'Delete this 3D artwork? This cannot be undone.',
    cb: async () => {
      setConfirm(p => ({ ...p, open: false }));
      try {
        await arArtworkAPI.adminDelete(id);
        notify('Deleted successfully.');
        await fetchAll();
      } catch { notify('Delete failed.', 'error'); }
    },
  });

  const inp = "w-full border border-[#E8DDD5] rounded-xl px-3 py-2.5 text-sm text-[#3D3530] outline-none focus:border-[#C97B5A] transition-colors bg-white";

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <div className="w-9 h-9 rounded-full border-2 border-t-[#C97B5A] border-[#C97B5A]/15 animate-spin"/>
    </div>
  );

  return (
    <div style={{ fontFamily: "'Libre Baskerville', serif" }}>
      <Toast msg={toast.msg} type={toast.type} onDone={() => setToast({ msg: '', type: 'success' })}/>
      <Confirm
        open={confirm.open}
        msg={confirm.msg}
        onConfirm={confirm.cb}
        onCancel={() => setConfirm(p => ({ ...p, open: false }))}
      />

      {/*header*/}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-[#3D3530]"
            style={{ fontFamily: "'Cinzel Decorative', serif" }}>
            3D Artworks
          </h2>
          <p className="text-xs text-[#9A8880] mt-0.5">
            {artworks.length} model{artworks.length !== 1 ? 's' : ''} · GLB files saved on server · No size limit
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchAll} title="Refresh"
            className="p-2 rounded-xl border border-[#E8DDD5] text-[#9A8880] hover:text-[#3D3530] transition-colors">
            <RiRefreshLine size={15}/>
          </button>
          {mode === 'list' ? (
            <button onClick={startCreate}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[#C97B5A] text-white hover:bg-[#b56a4a] transition-colors">
              <RiAddLine size={14}/> Add 3D Artwork
            </button>
          ) : (
            <button onClick={() => setMode('list')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border border-[#E8DDD5] text-[#9A8880] hover:text-[#3D3530] transition-colors">
              <RiCloseLine size={14}/> Cancel
            </button>
          )}
        </div>
      </div>

      {/* create / edit form*/}
      {(mode === 'create' || mode === 'edit') && (
        <div className="bg-white rounded-2xl border border-[#E8DDD5] p-6 mb-6">
          <h3 className="text-sm font-semibold text-[#3D3530] mb-5">
            {mode === 'edit' ? `Editing: ${form.title || 'Artwork'}` : 'Add New 3D Artwork'}
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* lrftcolumn */}
            <div className="space-y-4">

              {/* title */}
              <div>
                <label className="text-[10px] font-bold text-[#9A8880] uppercase tracking-wider block mb-1.5">
                  Title <span className="text-[#C97B5A]">*</span>
                </label>
                <input
                  value={form.title}
                  onChange={setV('title')}
                  placeholder="e.g. Traditional Rabana Drum"
                  className={inp}
                />
              </div>

              {/* description */}
              <div>
                <label className="text-[10px] font-bold text-[#9A8880] uppercase tracking-wider block mb-1.5">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={setV('description')}
                  rows={3}
                  placeholder="Describe this folk art piece, its origin and cultural significance…"
                  className={`${inp} resize-none`}
                />
              </div>

              {/* category */}
              <div>
                <label className="text-[10px] font-bold text-[#9A8880] uppercase tracking-wider block mb-1.5">
                  Art Category
                </label>
                <select value={form.category} onChange={setV('category')} className={inp}>
                  <option value="">Select category…</option>
                  {ART_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* published toggle */}
              <div className="flex items-center justify-between p-3 bg-[#FAF7F2] rounded-xl border border-[#E8DDD5]">
                <div>
                  <p className="text-xs font-semibold text-[#3D3530]">Published</p>
                  <p className="text-[10px] text-[#9A8880]">Show in public learning page AR section</p>
                </div>
                <div
                  onClick={() => setForm(p => ({ ...p, isPublished: !p.isPublished }))}
                  className={`relative w-11 h-6 rounded-full cursor-pointer transition-colors ${
                    form.isPublished ? 'bg-green-500' : 'bg-[#D9D0CB]'
                  }`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    form.isPublished ? 'translate-x-5' : 'translate-x-0.5'
                  }`}/>
                </div>
              </div>
            </div>

            {/*right column */}
            <div className="space-y-4">

              {/* thumbnail image */}
              <div>
                <label className="text-[10px] font-bold text-[#9A8880] uppercase tracking-wider block mb-1.5">
                  Thumbnail Image
                  <span className="ml-1 font-normal normal-case">(shown in card)</span>
                </label>
                <ImagePicker
                  value={form.image}
                  onChange={v => setForm(p => ({ ...p, image: v }))}
                />
              </div>

              {/* GLB model */}
              <div>
                <label className="text-[10px] font-bold text-[#9A8880] uppercase tracking-wider block mb-1.5">
                  3D Model File (.glb / .gltf)
                  <span className="ml-1 font-normal normal-case">(saved on server — any size)</span>
                </label>
                <GLBPicker
                  value={form.glbModel}
                  onChange={v => setForm(p => ({ ...p, glbModel: v }))}
                />
                <p className="text-[10px] text-[#9A8880] mt-1.5">
                  Free models:{' '}
                  <a href="https://sketchfab.com" target="_blank" rel="noreferrer"
                    className="text-[#C97B5A] underline">Sketchfab.com</a>
                  {' '}· AI generate:{' '}
                  <a href="https://meshy.ai" target="_blank" rel="noreferrer"
                    className="text-[#C97B5A] underline">Meshy.ai</a>
                </p>
              </div>
            </div>
          </div>

          {/* save / cancel */}
          <div className="flex gap-2 mt-6 pt-4 border-t border-[#E8DDD5]">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold bg-[#C97B5A] text-white hover:bg-[#b56a4a] disabled:opacity-50 transition-colors"
            >
              {saving
                ? <><RiLoader4Line size={14} className="animate-spin"/> Saving…</>
                : <><RiSaveLine size={14}/> {mode === 'edit' ? 'Update Artwork' : 'Save & Upload'}</>
              }
            </button>
            <button
              onClick={() => setMode('list')}
              className="px-4 py-2.5 rounded-xl text-sm font-medium border border-[#E8DDD5] text-[#9A8880] hover:text-[#3D3530] transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* list */}
      {mode === 'list' && (
        artworks.length === 0 ? (
          <div className="text-center py-20 text-[#9A8880]">
            <RiBox3Line size={44} className="mx-auto mb-3 opacity-20"/>
            <p className="font-semibold text-[#3D3530] mb-1">No 3D artworks yet</p>
            <p className="text-sm mb-1">Click "Add 3D Artwork" to upload your first GLB model.</p>
            <p className="text-xs text-[#C97B5A]">GLB files saved on server — no size limit</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {artworks.map(doc => (
              <div
                key={doc._id}
                className="bg-white border border-[#E8DDD5] rounded-2xl overflow-hidden hover:border-[#C97B5A]/30 hover:shadow-lg transition-all duration-300"
              >
                {/* thumbnail */}
                <div className="relative h-44 bg-gradient-to-br from-[#C97B5A]/10 to-[#7A9E8E]/10">
                  {doc.image ? (
                    <img src={doc.image} alt={doc.title} className="w-full h-full object-cover"/>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <RiBox3Line size={40} className="text-[#C97B5A]/30"/>
                    </div>
                  )}
                  {/* status badges */}
                  <div className="absolute top-2 left-2 flex gap-1.5 flex-wrap">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      doc.isPublished
                        ? 'bg-green-100 text-green-700'
                        : 'bg-white/90 text-[#9A8880] border border-[#E8DDD5]'
                    }`}>
                      {doc.isPublished ? 'Published' : 'Draft'}
                    </span>
                    {doc.glbModel && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-[#C97B5A]/15 text-[#C97B5A] flex items-center gap-1">
                        <RiBox3Line size={9}/> GLB
                      </span>
                    )}
                  </div>
                </div>

                {/* info */}
                <div className="p-4">
                  <h3 className="font-semibold text-sm text-[#3D3530] mb-1 truncate">{doc.title}</h3>
                  {doc.category && (
                    <p className="text-[10px] text-[#C97B5A] mb-1">{doc.category}</p>
                  )}
                  {doc.description && (
                    <p className="text-xs text-[#9A8880] line-clamp-2">{doc.description}</p>
                  )}

                  {/* GLB status */}
                  <div className={`mt-2 flex items-center gap-1.5 text-[10px] ${
                    doc.glbModel ? 'text-green-600' : 'text-[#9A8880]'
                  }`}>
                    {doc.glbModel
                      ? <><RiCheckLine size={11}/> 3D model saved</>
                      : <><RiBox3Line size={11}/> No 3D model yet</>
                    }
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#F5F0EB]">

                    {/* Publish toggle */}
                    <button
                      onClick={() => togglePublish(doc._id)}
                      title={doc.isPublished ? 'Unpublish' : 'Publish'}
                      className={`p-1.5 rounded-lg border transition-colors ${
                        doc.isPublished
                          ? 'border-green-200 text-green-600 hover:bg-green-50'
                          : 'border-[#E8DDD5] text-[#9A8880] hover:border-[#C97B5A] hover:text-[#C97B5A]'
                      }`}
                    >
                      {doc.isPublished ? <RiEyeLine size={14}/> : <RiEyeOffLine size={14}/>}
                    </button>

                    {/* edit */}
                    <button
                      onClick={() => startEdit(doc)}
                      title="Edit"
                      className="p-1.5 rounded-lg border border-[#E8DDD5] text-[#9A8880] hover:border-[#C97B5A] hover:text-[#C97B5A] transition-colors"
                    >
                      <RiEditLine size={14}/>
                    </button>

                    {/* AR View */}
                    {doc.glbModel && (
                      <a
                        href={`/ar-view/${doc._id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#C97B5A]/30 text-[#C97B5A] text-[10px] font-medium hover:bg-[#C97B5A]/5 transition-colors"
                      >
                        <RiExternalLinkLine size={11}/> AR View
                      </a>
                    )}

                    {/* delete */}
                    <button
                      onClick={() => handleDelete(doc._id)}
                      title="Delete"
                      className="p-1.5 rounded-lg border border-[#E8DDD5] text-[#9A8880] hover:border-red-300 hover:text-red-500 transition-colors ml-auto"
                    >
                      <RiDeleteBinLine size={14}/>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}