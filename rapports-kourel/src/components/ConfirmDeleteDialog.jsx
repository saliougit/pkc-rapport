import { AlertTriangle, Loader, Trash2 } from 'lucide-react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

export function ConfirmDeleteDialog({
  open,
  onOpenChange,
  title = 'Confirmer la suppression',
  description = 'Cette action est irréversible. Êtes-vous sûr de vouloir continuer ?',
  itemName = '',
  onConfirm,
  loading = false,
  variant = 'warning', // 'warning' | 'danger'
}) {
  const isDanger = variant === 'danger'
  const bgColor = isDanger ? 'bg-rouge-50 border-rouge/20' : 'bg-amber-50 border-amber-200'
  const iconColor = isDanger ? 'text-rouge' : 'text-amber-600'
  const confirmButtonColor = isDanger 
    ? 'bg-rouge hover:bg-rouge-600 text-white' 
    : 'bg-amber-600 hover:bg-amber-700 text-white'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-3 ${bgColor}`}>
            <AlertTriangle size={24} className={iconColor} />
          </div>
          <DialogTitle className="text-lg font-bold text-gris-950">
            {title}
          </DialogTitle>
          <DialogDescription className="text-sm text-gris-600 mt-2">
            {description}
            {itemName && (
              <div className="mt-3 p-3 bg-gris-50 border border-gris-200 rounded-lg">
                <p className="text-xs font-semibold text-gris-500 mb-1">ÉLÉMENT À SUPPRIMER</p>
                <p className="text-sm font-semibold text-gris-950 break-words">
                  {itemName}
                </p>
              </div>
            )}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex-row gap-3 pt-6">
          <Button
            variant="outline"
            className="flex-1 rounded-lg"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Annuler
          </Button>
          <Button
            className={`flex-1 rounded-lg gap-2 ${confirmButtonColor}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader size={16} className="animate-spin" />
                Suppression…
              </>
            ) : (
              <>
                <Trash2 size={16} />
                Supprimer définitivement
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
