import { useEffect, useState } from 'react'
import { Card } from '../components/Card'
import { MaterialForm } from '../components/MaterialForm'
import { PageHeader } from '../components/PageHeader'
import { Table } from '../components/Table'
import { usePreferences } from '../hooks/usePreferences'
import {
  createMaterial,
  deleteMaterial,
  fetchMaterials,
  updateMaterial,
} from '../services/materialsService'
import type { Material } from '../types/database'

export function MaterialsPage() {
  const { t } = usePreferences()
  const [materials, setMaterials] = useState<Material[]>([])
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  async function loadMaterials() {
    setMaterials(await fetchMaterials())
  }

  useEffect(() => {
    void loadMaterials()
  }, [])

  async function handleSubmit(payload: { name: string; stock: number; unit: string }) {
    setIsSaving(true)
    try {
      if (editingMaterial) {
        await updateMaterial(editingMaterial.id, payload)
        setEditingMaterial(null)
      } else {
        await createMaterial(payload)
      }
      await loadMaterials()
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete(id: string) {
    await deleteMaterial(id)
    await loadMaterials()
    if (editingMaterial?.id === id) {
      setEditingMaterial(null)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title={t('materials.title')} description={t('materials.description')} />

      <Card
        title={editingMaterial ? t('materials.edit') : t('materials.add')}
        description={t('materials.formDescription')}
      >
        <MaterialForm
          initialValue={editingMaterial}
          isSaving={isSaving}
          onCancelEdit={() => setEditingMaterial(null)}
          onSubmit={handleSubmit}
        />
      </Card>

      <Card title={t('materials.catalog')} description={t('materials.catalogDescription')}>
        <Table
          data={materials}
          emptyState={t('materials.empty')}
          columns={[
            {
              header: t('materials.name'),
              render: (material) => (
                <span className="font-medium text-slate-900 dark:text-white">{material.name}</span>
              ),
            },
            {
              header: t('materials.stock'),
              render: (material) => `${material.stock} ${material.unit}`,
            },
            {
              header: t('materials.unit'),
              render: (material) => material.unit,
            },
            {
              header: t('materials.actions'),
              render: (material) => (
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="btn-secondary px-4 py-2"
                    onClick={() => setEditingMaterial(material)}
                  >
                    {t('materials.editAction')}
                  </button>
                  <button
                    type="button"
                    className="rounded-2xl border border-red-100 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100 dark:border-red-900/60 dark:bg-red-950/60 dark:text-red-300 dark:hover:bg-red-950"
                    onClick={() => void handleDelete(material.id)}
                  >
                    {t('materials.deleteAction')}
                  </button>
                </div>
              ),
            },
          ]}
        />
      </Card>
    </div>
  )
}
