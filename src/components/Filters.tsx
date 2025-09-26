'use client'
import type { Category } from '@/lib/types'


export function Filters(
{ q, setQ, cats, setCats, area, setArea }:
{ q: string, setQ: (v:string)=>void, cats: Category[], setCats: (v:Category[])=>void, area: string, setArea: (v:string)=>void }
){
const toggle = (c: Category) => setCats(
cats.includes(c) ? cats.filter(x=>x!==c) : [...cats, c]
)


return (
<div className="kawaii-card p-4 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
<input
value={q}
onChange={e=>setQ(e.target.value)}
placeholder="Search name / concept"
className="w-full sm:w-80 px-4 py-2 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-pastelPurple"
/>


<div className="flex flex-wrap gap-2">
<button onClick={()=>toggle('concafe')} className={`kawaii-chip ${cats.includes('concafe')?'bg-pastelPink/30':''}`}>ConCafe</button>
<button onClick={()=>toggle('girlsbar')} className={`kawaii-chip ${cats.includes('girlsbar')?'bg-pastelMint/40':''}`}>Girls Bar</button>
<button onClick={()=>toggle('hostclub')} className={`kawaii-chip ${cats.includes('hostclub')?'bg-pastelPurple/30':''}`}>Host Club</button>
</div>


<select value={area} onChange={e=>setArea(e.target.value)} className="px-3 py-2 rounded-xl border border-black/10">
<option value="all">All areas</option>
<option value="tokyo">Tokyo</option>
<option value="osaka">Osaka</option>
<option value="kyoto">Kyoto</option>
<option value="fukuoka">Fukuoka</option>
<option value="other">Other</option>
</select>
</div>
)
}