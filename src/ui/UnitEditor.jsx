import React, { useEffect, useRef, useState } from 'react';
import { ancestors, descendants, itemsToText, textToItems } from '../data';
import { unitTypes, useOrg } from '../store';

const field = 'w-full rounded-md border border-control bg-surface px-3 py-2.5 text-[15px] leading-normal font-normal text-ink';

export default function UnitEditor() {
  const editor = useOrg(s => s.editor);
  const units = useOrg(s => s.units);
  const { setEditor, saveUnit } = useOrg.getState();
  const dialog = useRef(null); const form = useRef(null); const [error, setError] = useState('');
  const original = editor.unit || { name: '', code: '', type: 'Phòng', description: '', parentId: editor.parentId, duties: [], authorities: [] };
  const blocked = editor.unit ? new Set([editor.unit.id, ...descendants(units, editor.unit.id)]) : new Set();
  const types = unitTypes.includes(original.type) ? unitTypes : [...unitTypes, original.type];

  useEffect(() => { const previous = document.activeElement; dialog.current.showModal(); return () => previous?.focus?.(); }, []);
  function close() { if (form.current?.dataset.dirty === 'true' && !window.confirm('Bỏ các thay đổi chưa lưu trong biểu mẫu?')) return; setEditor(null); }
  function submit(event) {
    event.preventDefault(); const v = Object.fromEntries(new FormData(event.currentTarget));
    try { saveUnit({ id: original.id || crypto.randomUUID(), name: v.name.trim(), code: v.code.trim(), type: v.type, description: v.description.trim(), parentId: v.parentId || null, duties: textToItems(v.duties), authorities: textToItems(v.authorities) }); }
    catch (e) { setError(e.message); }
  }

  return (
    <dialog ref={dialog} aria-labelledby="editor-title" onCancel={e => { e.preventDefault(); close(); }}
      className="m-auto max-h-[90dvh] w-[620px] max-w-[calc(100vw-24px)] rounded-2xl border border-line bg-surface p-0 text-ink shadow-panel backdrop:bg-[#0b1d33]/50">
      <form ref={form} onSubmit={submit} onChange={() => { form.current.dataset.dirty = 'true'; }} className="flex max-h-[88dvh] flex-col">
        <div className="flex justify-between border-b border-line px-6 py-5">
          <div><h2 id="editor-title" className="text-xl font-semibold">{editor.mode === 'add' ? 'Thêm đơn vị con' : 'Chỉnh sửa đơn vị'}</h2><p className="mt-1.5 text-[14px] text-muted">Thông tin và nội dung riêng của đơn vị</p></div>
          <button className="min-h-9 rounded-md px-2 text-[14px] text-muted hover:bg-bg hover:text-ink" type="button" onClick={close} aria-label="Đóng biểu mẫu">Đóng</button>
        </div>
        <div className="flex flex-col gap-4 overflow-auto px-6 py-5 text-[14px] font-semibold [&_label]:flex [&_label]:flex-col [&_label]:gap-1.5">
          <label>Tên đơn vị <span className="sr-only">(bắt buộc)</span><input autoFocus required name="name" defaultValue={original.name} maxLength={150} className={field} /></label>
          <div className="flex flex-col gap-4 sm:flex-row [&>label]:flex-1">
            <label>Mã đơn vị<input name="code" defaultValue={original.code} maxLength={40} className={field} /></label>
            <label>Loại đơn vị<select name="type" defaultValue={original.type} className={field}>{types.map(t => <option key={t}>{t}</option>)}</select></label>
          </div>
          <label>Trực thuộc<select name="parentId" defaultValue={original.parentId || ''} className={field}>
            <option value="">Không có đơn vị cha (cấp gốc)</option>
            {units.filter(u => !blocked.has(u.id)).map(u => <option key={u.id} value={u.id}>{ancestors(units, u.id).map(v => v.name).join(' / ')}</option>)}
          </select></label>
          <label>Chức năng<textarea name="description" rows={3} defaultValue={original.description} maxLength={5000} className={`${field} resize-y`} /></label>
          <p className="-mb-1 text-[12px] leading-relaxed font-normal text-muted">Mỗi dòng là một mục. <code>[1.1]</code> ở đầu dòng là số hiệu theo văn bản (tùy chọn). Thụt đầu dòng để ghi ý con a), b)…</p>
          <label>Nhiệm vụ riêng<textarea name="duties" rows={9} defaultValue={itemsToText(original.duties)} className={`${field} resize-y`} /></label>
          <label>Quyền hạn riêng<textarea name="authorities" rows={6} defaultValue={itemsToText(original.authorities)} className={`${field} resize-y`} /></label>
          {error && <p className="text-[14px] font-normal text-danger" role="alert">{error}</p>}
        </div>
        <div className="flex flex-wrap items-center gap-2 border-t border-line px-6 py-4">
          <span className="mr-auto w-full text-[12px] leading-snug text-muted sm:w-auto sm:max-w-[220px]">Thay đổi được lưu trong phiên. Xuất JSON để giữ lại.</span>
          <button type="button" className="btn-secondary flex-1 sm:flex-none" onClick={close}>Hủy</button>
          <button type="submit" className="btn-primary flex-1 sm:flex-none">Lưu thay đổi</button>
        </div>
      </form>
    </dialog>
  );
}
