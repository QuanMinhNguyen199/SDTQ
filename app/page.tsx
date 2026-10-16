'use client';
import dynamic from 'next/dynamic';
// WebGL, file import/export and the existing workspace run only in the browser.
const Workspace = dynamic(() => import('../src/App'), { ssr:false, loading:() => <main className="grid h-dvh place-items-center bg-bg text-ink">Đang mở không gian tổ chức…</main> });
export default function Page() { return <Workspace />; }
