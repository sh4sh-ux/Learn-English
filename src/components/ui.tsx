import type { ButtonHTMLAttributes, ReactNode } from 'react'

export function PageHeader({eyebrow,title,description,action}:{eyebrow?:string;title:string;description?:string;action?:ReactNode}) {
  return <header className="flex items-start justify-between gap-4 px-5 pb-5 pt-[max(24px,env(safe-area-inset-top))] sm:px-8">
    <div>{eyebrow&&<p className="mb-1 text-xs font-bold uppercase tracking-[.16em] text-primary">{eyebrow}</p>}<h1 className="text-[28px] font-bold tracking-tight">{title}</h1>{description&&<p className="mt-2 max-w-xl text-sm leading-6 text-muted">{description}</p>}</div>{action}
  </header>
}

export function Button({children,className='',variant='primary',...props}:ButtonHTMLAttributes<HTMLButtonElement>&{variant?:'primary'|'secondary'|'ghost'|'danger'}) {
  const styles={primary:'bg-primary text-white hover:bg-blue-700',secondary:'border border-line bg-white text-ink hover:bg-slate-50',ghost:'text-primary hover:bg-blue-50',danger:'bg-red-50 text-red-700 hover:bg-red-100'}
  return <button className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl px-5 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${styles[variant]} ${className}`} {...props}>{children}</button>
}

export function Progress({value,label}:{value:number;label?:string}) {
  const safe=Math.min(100,Math.max(0,value))
  return <div>{label&&<div className="mb-2 flex justify-between text-xs font-semibold text-muted"><span>{label}</span><span>{Math.round(safe)}%</span></div>}<div className="h-2 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-primary transition-all" style={{width:`${safe}%`}}/></div></div>
}

export function EmptyState({icon,title,description,action}:{icon:ReactNode;title:string;description:string;action?:ReactNode}) {
  return <div className="mx-5 rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center"><div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-primary">{icon}</div><h2 className="font-bold">{title}</h2><p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted">{description}</p>{action&&<div className="mt-5">{action}</div>}</div>
}
