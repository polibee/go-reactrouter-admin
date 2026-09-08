import { Layers } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '~/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { Switch } from '~/components/ui/switch'
import { Textarea } from '~/components/ui/textarea'
import { NameTranslationsInput } from '../../components/name-translations-input'
import type {
  NavLocation,
  SiteNavGroup,
  SiteNavGroupFormValues,
} from '../../types'

export interface NavGroupDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  group?: SiteNavGroup | null
  defaultLocation?: NavLocation
  onSave: (values: SiteNavGroupFormValues & { id?: string }) => Promise<void>
}

export function NavGroupDialog({
  open,
  onOpenChange,
  group,
  defaultLocation = 'footer',
  onSave,
}: NavGroupDialogProps) {
  const { t } = useTranslation()
  const isEditing = Boolean(group)
  const [name, setName] = useState('')
  const [location, setLocation] = useState<NavLocation>(defaultLocation)
  const [sort, setSort] = useState(10)
  const [enabled, setEnabled] = useState(true)
  const [description, setDescription] = useState('')
  const [translations, setTranslations] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  // biome-ignore lint/correctness/useExhaustiveDependencies: sync state when the edited group changes
  useEffect(() => {
    if (group) {
      setName(group.name)
      setLocation(group.location)
      setSort(group.sort)
      setEnabled(group.enabled)
      setDescription(group.description || '')
      setTranslations(group.nameTranslations ?? {})
    } else {
      setName('')
      setLocation(defaultLocation)
      setSort(10)
      setEnabled(true)
      setDescription('')
      setTranslations({})
    }
  }, [group, defaultLocation, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setSubmitting(true)
    try {
      await onSave({
        id: group?.id,
        name: name.trim(),
        location,
        sort: Number(sort),
        enabled,
        description: description.trim() || undefined,
        nameTranslations:
          Object.keys(translations).length > 0 ? translations : undefined,
      })
      onOpenChange(false)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Layers className="text-primary size-4" />
            {isEditing
              ? t('resources.site.navigation.groupDialog.editTitle')
              : t('resources.site.navigation.groupDialog.createTitle')}
          </DialogTitle>
          <DialogDescription className="text-xs">
            {location === 'footer'
              ? t('resources.site.navigation.groupDialog.footerDescription')
              : t('resources.site.navigation.groupDialog.headerDescription')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2 text-xs">
          <div className="space-y-1.5">
            <Label htmlFor="group-name" className="text-xs">
              {t('resources.site.navigation.groupDialog.nameLabel')}
            </Label>
            <Input
              id="group-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t(
                'resources.site.navigation.groupDialog.namePlaceholder',
              )}
              className="h-8 text-xs"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">
                {t('resources.site.navigation.groupDialog.locationLabel')}
              </Label>
              <Select
                value={location}
                onValueChange={(val) => setLocation(val as NavLocation)}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="text-xs">
                  <SelectItem value="footer">
                    {t('resources.site.navigation.locationFooter')}
                  </SelectItem>
                  <SelectItem value="header">
                    {t('resources.site.navigation.locationHeader')}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="group-sort" className="text-xs">
                {t('resources.site.navigation.sortLabel')}
              </Label>
              <Input
                id="group-sort"
                type="number"
                value={sort}
                onChange={(e) => setSort(Number(e.target.value))}
                className="h-8 text-xs"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="group-desc" className="text-xs">
              {t('resources.site.navigation.groupDialog.descriptionLabel')}
            </Label>
            <Textarea
              id="group-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t(
                'resources.site.navigation.groupDialog.descriptionPlaceholder',
              )}
              rows={2}
              className="text-xs"
            />
          </div>

          <NameTranslationsInput
            value={translations}
            onChange={setTranslations}
          />

          <div className="flex items-center justify-between border-t pt-2">
            <div className="flex items-center space-x-2">
              <Switch
                id="group-enabled"
                checked={enabled}
                onCheckedChange={setEnabled}
              />
              <Label htmlFor="group-enabled" className="cursor-pointer text-xs">
                {t('resources.site.navigation.groupDialog.enabledLabel')}
              </Label>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              {t('common.actions.cancel')}
            </Button>
            <Button
              type="submit"
              size="sm"
              className="h-8 gap-1 text-xs"
              disabled={submitting || !name.trim()}
            >
              {submitting
                ? t('common.actions.saving')
                : t('common.actions.save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
