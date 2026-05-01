'use client'

import { useState, useTransition } from 'react'
import {
  createCategoryAction,
  updateCategoryAction,
  deleteCategoryAction,
  createUnitAction,
  updateUnitAction,
  deleteUnitAction,
} from '@/actions/admin.actions'
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react'

interface Category {
  id: string
  name_ar: string
  name_fr: string | null
  slug: string
  icon: string | null
  parent_id: string | null
  sort_order: number | null
  is_active: boolean
}

interface Unit {
  id: string
  name_ar: string
  name_fr: string | null
  symbol: string
  sort_order: number | null
}

interface Region {
  id: string
  name_ar: string
  name_fr: string | null
  code: string
  sort_order: number | null
}

interface Props {
  categories: Category[]
  units: Unit[]
  regions: Region[]
}

// ─── Shared inline edit row ───────────────────────────────────────────────────

function EditableRow({
  children,
  onSave,
  onCancel,
  isPending,
}: {
  children: React.ReactNode
  onSave: () => void
  onCancel: () => void
  isPending: boolean
}) {
  return (
    <tr className="bg-green-50">
      {children}
      <td className="px-4 py-2">
        <div className="flex gap-1">
          <button
            onClick={onSave}
            disabled={isPending}
            className="p-1.5 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            <Check className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onCancel}
            className="p-1.5 rounded bg-stone-200 text-stone-600 hover:bg-stone-300 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>
    </tr>
  )
}

// ─── Categories Tab ───────────────────────────────────────────────────────────

function CategoriesTab({ categories: initial }: { categories: Category[] }) {
  const [categories, setCategories] = useState(initial)
  const [adding, setAdding] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({ name_ar: '', name_fr: '', slug: '', icon: '', sort_order: '' })
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')

  const resetForm = () => setForm({ name_ar: '', name_fr: '', slug: '', icon: '', sort_order: '' })

  const handleAdd = () => {
    setError('')
    startTransition(async () => {
      const result = await createCategoryAction({
        name_ar: form.name_ar,
        name_fr: form.name_fr || null,
        slug: form.slug,
        icon: form.icon || null,
        sort_order: form.sort_order ? parseInt(form.sort_order) : undefined,
      })
      if (result.success) {
        setAdding(false)
        resetForm()
        // Optimistic: reload data via router or refetch — for now show message
        window.location.reload()
      } else {
        setError((result as { error: string }).error)
      }
    })
  }

  const handleEdit = (cat: Category) => {
    setEditId(cat.id)
    setForm({
      name_ar: cat.name_ar,
      name_fr: cat.name_fr ?? '',
      slug: cat.slug,
      icon: cat.icon ?? '',
      sort_order: cat.sort_order?.toString() ?? '',
    })
  }

  const handleSaveEdit = (id: string) => {
    setError('')
    startTransition(async () => {
      const result = await updateCategoryAction(id, {
        name_ar: form.name_ar,
        name_fr: form.name_fr || null,
        slug: form.slug,
        icon: form.icon || null,
        sort_order: form.sort_order ? parseInt(form.sort_order) : undefined,
      })
      if (result.success) {
        setCategories((prev) =>
          prev.map((c) =>
            c.id === id
              ? { ...c, name_ar: form.name_ar, name_fr: form.name_fr || null, slug: form.slug, icon: form.icon || null }
              : c
          )
        )
        setEditId(null)
        resetForm()
      } else {
        setError((result as { error: string }).error)
      }
    })
  }

  const handleDelete = (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الصنف؟')) return
    startTransition(async () => {
      const result = await deleteCategoryAction(id)
      if (result.success) setCategories((prev) => prev.filter((c) => c.id !== id))
      else setError((result as { error: string }).error)
    })
  }

  const input = 'border border-stone-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-green-500 bg-white'

  // Only top-level for simplicity
  const topLevel = categories.filter((c) => !c.parent_id)

  return (
    <div>
      {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden mb-3">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-stone-50 border-b border-stone-100 text-right">
              <th className="px-4 py-2.5 text-xs font-semibold text-stone-500 uppercase">الأيقونة</th>
              <th className="px-4 py-2.5 text-xs font-semibold text-stone-500 uppercase">الاسم (عربي)</th>
              <th className="px-4 py-2.5 text-xs font-semibold text-stone-500 uppercase">الاسم (فرنسي)</th>
              <th className="px-4 py-2.5 text-xs font-semibold text-stone-500 uppercase">Slug</th>
              <th className="px-4 py-2.5 text-xs font-semibold text-stone-500 uppercase">الترتيب</th>
              <th className="px-4 py-2.5 text-xs font-semibold text-stone-500 uppercase">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {topLevel.map((cat) =>
              editId === cat.id ? (
                <EditableRow
                  key={cat.id}
                  onSave={() => handleSaveEdit(cat.id)}
                  onCancel={() => { setEditId(null); resetForm() }}
                  isPending={isPending}
                >
                  <td className="px-4 py-2"><input className={input} value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} placeholder="🌾" style={{ width: 60 }} /></td>
                  <td className="px-4 py-2"><input className={input} value={form.name_ar} onChange={(e) => setForm({ ...form, name_ar: e.target.value })} /></td>
                  <td className="px-4 py-2"><input className={input} value={form.name_fr} onChange={(e) => setForm({ ...form, name_fr: e.target.value })} /></td>
                  <td className="px-4 py-2"><input className={input} value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} dir="ltr" /></td>
                  <td className="px-4 py-2"><input className={input} type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} style={{ width: 60 }} /></td>
                </EditableRow>
              ) : (
                <tr key={cat.id} className="hover:bg-stone-50">
                  <td className="px-4 py-2.5 text-lg">{cat.icon ?? '—'}</td>
                  <td className="px-4 py-2.5 font-medium text-stone-800">{cat.name_ar}</td>
                  <td className="px-4 py-2.5 text-stone-500">{cat.name_fr ?? '—'}</td>
                  <td className="px-4 py-2.5 text-stone-400 font-mono text-xs" dir="ltr">{cat.slug}</td>
                  <td className="px-4 py-2.5 text-stone-400">{cat.sort_order ?? '—'}</td>
                  <td className="px-4 py-2.5">
                    <div className="flex gap-1">
                      <button onClick={() => handleEdit(cat)} className="p-1.5 rounded hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleDelete(cat.id)} className="p-1.5 rounded hover:bg-red-50 text-stone-400 hover:text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              )
            )}

            {/* Add row */}
            {adding && (
              <EditableRow onSave={handleAdd} onCancel={() => { setAdding(false); resetForm() }} isPending={isPending}>
                <td className="px-4 py-2"><input className={input} value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} placeholder="🌾" style={{ width: 60 }} /></td>
                <td className="px-4 py-2"><input className={input} value={form.name_ar} onChange={(e) => setForm({ ...form, name_ar: e.target.value })} placeholder="اسم الصنف" autoFocus /></td>
                <td className="px-4 py-2"><input className={input} value={form.name_fr} onChange={(e) => setForm({ ...form, name_fr: e.target.value })} placeholder="Nom" /></td>
                <td className="px-4 py-2"><input className={input} value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="my-slug" dir="ltr" /></td>
                <td className="px-4 py-2"><input className={input} type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} placeholder="0" style={{ width: 60 }} /></td>
              </EditableRow>
            )}
          </tbody>
        </table>
      </div>

      {!adding && (
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          إضافة صنف
        </button>
      )}
    </div>
  )
}

// ─── Units Tab ────────────────────────────────────────────────────────────────

function UnitsTab({ units: initial }: { units: Unit[] }) {
  const [units, setUnits] = useState(initial)
  const [adding, setAdding] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({ name_ar: '', name_fr: '', symbol: '', sort_order: '' })
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')

  const resetForm = () => setForm({ name_ar: '', name_fr: '', symbol: '', sort_order: '' })

  const handleAdd = () => {
    setError('')
    startTransition(async () => {
      const result = await createUnitAction({
        name_ar: form.name_ar,
        name_fr: form.name_fr || null,
        symbol: form.symbol,
        sort_order: form.sort_order ? parseInt(form.sort_order) : undefined,
      })
      if (result.success) {
        setAdding(false)
        resetForm()
        window.location.reload()
      } else {
        setError((result as { error: string }).error)
      }
    })
  }

  const handleSaveEdit = (id: string) => {
    setError('')
    startTransition(async () => {
      const result = await updateUnitAction(id, {
        name_ar: form.name_ar,
        name_fr: form.name_fr || null,
        symbol: form.symbol,
        sort_order: form.sort_order ? parseInt(form.sort_order) : undefined,
      })
      if (result.success) {
        setUnits((prev) =>
          prev.map((u) =>
            u.id === id
              ? { ...u, name_ar: form.name_ar, name_fr: form.name_fr || null, symbol: form.symbol }
              : u
          )
        )
        setEditId(null)
        resetForm()
      } else {
        setError((result as { error: string }).error)
      }
    })
  }

  const input = 'border border-stone-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-green-500 bg-white w-full'

  return (
    <div>
      {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden mb-3">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-stone-50 border-b border-stone-100 text-right">
              <th className="px-4 py-2.5 text-xs font-semibold text-stone-500 uppercase">الاسم (عربي)</th>
              <th className="px-4 py-2.5 text-xs font-semibold text-stone-500 uppercase">الاسم (فرنسي)</th>
              <th className="px-4 py-2.5 text-xs font-semibold text-stone-500 uppercase">الرمز</th>
              <th className="px-4 py-2.5 text-xs font-semibold text-stone-500 uppercase">الترتيب</th>
              <th className="px-4 py-2.5 text-xs font-semibold text-stone-500 uppercase">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {units.map((unit) =>
              editId === unit.id ? (
                <EditableRow
                  key={unit.id}
                  onSave={() => handleSaveEdit(unit.id)}
                  onCancel={() => { setEditId(null); resetForm() }}
                  isPending={isPending}
                >
                  <td className="px-4 py-2"><input className={input} value={form.name_ar} onChange={(e) => setForm({ ...form, name_ar: e.target.value })} /></td>
                  <td className="px-4 py-2"><input className={input} value={form.name_fr} onChange={(e) => setForm({ ...form, name_fr: e.target.value })} /></td>
                  <td className="px-4 py-2"><input className={input} value={form.symbol} onChange={(e) => setForm({ ...form, symbol: e.target.value })} style={{ maxWidth: 80 }} /></td>
                  <td className="px-4 py-2"><input className={input} type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} style={{ maxWidth: 60 }} /></td>
                </EditableRow>
              ) : (
                <tr key={unit.id} className="hover:bg-stone-50">
                  <td className="px-4 py-2.5 font-medium text-stone-800">{unit.name_ar}</td>
                  <td className="px-4 py-2.5 text-stone-500">{unit.name_fr ?? '—'}</td>
                  <td className="px-4 py-2.5 font-bold text-stone-700">{unit.symbol}</td>
                  <td className="px-4 py-2.5 text-stone-400">{unit.sort_order ?? '—'}</td>
                  <td className="px-4 py-2.5">
                    <button
                      onClick={() => {
                        setEditId(unit.id)
                        setForm({ name_ar: unit.name_ar, name_fr: unit.name_fr ?? '', symbol: unit.symbol, sort_order: unit.sort_order?.toString() ?? '' })
                      }}
                      className="p-1.5 rounded hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              )
            )}

            {adding && (
              <EditableRow onSave={handleAdd} onCancel={() => { setAdding(false); resetForm() }} isPending={isPending}>
                <td className="px-4 py-2"><input className={input} value={form.name_ar} onChange={(e) => setForm({ ...form, name_ar: e.target.value })} placeholder="كيلوغرام" autoFocus /></td>
                <td className="px-4 py-2"><input className={input} value={form.name_fr} onChange={(e) => setForm({ ...form, name_fr: e.target.value })} placeholder="Kilogramme" /></td>
                <td className="px-4 py-2"><input className={input} value={form.symbol} onChange={(e) => setForm({ ...form, symbol: e.target.value })} placeholder="كغ" style={{ maxWidth: 80 }} /></td>
                <td className="px-4 py-2"><input className={input} type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} placeholder="0" style={{ maxWidth: 60 }} /></td>
              </EditableRow>
            )}
          </tbody>
        </table>
      </div>

      {!adding && (
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          إضافة مقياس
        </button>
      )}
    </div>
  )
}

// ─── Regions Tab ─────────────────────────────────────────────────────────────
// Regions are seeded from official Tunisian governorate data and are intentionally
// read-only in the UI. deleteRegionAction and updateRegionAction exist for use via
// direct API/script only. If region management is ever needed in the UI, wire them
// up here following the same pattern as CategoriesTab.

function RegionsTab({ regions }: { regions: Region[] }) {
  return (
    <div>
      <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-4 text-sm text-amber-700">
        الولايات التونسية محددة مسبقاً وفق البيانات الرسمية. يمكن تعديل الترتيب فقط.
      </div>
      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 divide-x divide-x-reverse divide-stone-100">
          {regions.map((region) => (
            <div
              key={region.id}
              className="px-4 py-3 border-b border-stone-100 flex items-center justify-between"
            >
              <div>
                <p className="text-sm font-medium text-stone-800">{region.name_ar}</p>
                <p className="text-xs text-stone-400">{region.name_fr}</p>
              </div>
              <span className="text-xs text-stone-300 font-mono">{region.code}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Main Tabs Component ──────────────────────────────────────────────────────

const TABS = [
  { key: 'categories', label: 'الأصناف' },
  { key: 'units',      label: 'المقاييس' },
  { key: 'regions',    label: 'الولايات' },
] as const

export default function AdminCatalogTabs({ categories, units, regions }: Props) {
  const [tab, setTab] = useState<'categories' | 'units' | 'regions'>('categories')

  return (
    <div>
      {/* Tab Bar */}
      <div className="flex gap-1 mb-6 bg-stone-100 p-1 rounded-lg w-fit">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              tab === t.key
                ? 'bg-white text-stone-900 shadow-sm'
                : 'text-stone-500 hover:text-stone-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'categories' && <CategoriesTab categories={categories} />}
      {tab === 'units' && <UnitsTab units={units} />}
      {tab === 'regions' && <RegionsTab regions={regions} />}
    </div>
  )
}
