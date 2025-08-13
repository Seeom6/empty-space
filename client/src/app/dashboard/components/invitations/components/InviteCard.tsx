import React, { memo } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Copy, Ban, Mail, Eye, RotateCcw } from 'lucide-react'
import { InviteCode } from '../types'
import { getInviteStatusBadgeVariant, truncateText, formatDate, canRevokeInvites } from '../utils'
import { DISPLAY_CONFIG } from '../constants'

interface InviteCardProps {
  invite: InviteCode
  userRole: string
  onCopy?: (code: string) => void
  onRevoke?: (inviteId: string) => void
  onResend?: (inviteId: string) => void
  onView?: (invite: InviteCode) => void
  className?: string
}

export const InviteCard = memo<InviteCardProps>(({
  invite,
  userRole,
  onCopy,
  onRevoke,
  onResend,
  onView,
  className = ''
}) => {
  const canRevoke = canRevokeInvites(userRole) && invite.status === 'active'
  const canResend = invite.status === 'active'
  const statusVariant = getInviteStatusBadgeVariant(invite.status)

  const handleCardClick = () => {
    onView?.(invite)
  }

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation()
    onCopy?.(invite.code)
  }

  const handleRevoke = (e: React.MouseEvent) => {
    e.stopPropagation()
    onRevoke?.(invite.id)
  }

  const handleResend = (e: React.MouseEvent) => {
    e.stopPropagation()
    onResend?.(invite.id)
  }

  return (
    <Card 
      className={`group hover:shadow-lg transition-all duration-200 cursor-pointer border-l-4 ${
        invite.status === 'active' ? 'border-green-500' : 
        invite.status === 'used' ? 'border-blue-500' :
        invite.status === 'expired' ? 'border-orange-500' : 'border-red-500'
      } ${className}`}
      onClick={handleCardClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="text-2xl flex-shrink-0">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-lg truncate font-mono" title={invite.code}>
                {truncateText(invite.code, DISPLAY_CONFIG.maxCodeLength)}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={statusVariant} className="text-xs">
                  {invite.status.charAt(0).toUpperCase() + invite.status.slice(1)}
                </Badge>
                {invite.usedBy && (
                  <Badge variant="outline" className="text-xs">
                    Used
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCardClick}
              className="h-8 w-8 p-0"
              title="View details"
            >
              <Eye className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="h-8 w-8 p-0"
              title="Copy code"
            >
              <Copy className="h-4 w-4" />
            </Button>
            
            {canResend && onResend && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResend}
                className="h-8 w-8 p-0"
                title="Resend invite"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            )}
            
            {canRevoke && onRevoke && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    title="Revoke invite"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Ban className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Revoke Invite</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to revoke the invite code "{invite.code}"? This action cannot be undone and the code will no longer be usable.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleRevoke}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Revoke
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium">{invite.department}</p>
            <p className="text-sm text-muted-foreground">{invite.role}</p>
          </div>
          
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{invite.permissions.length} permissions</span>
            <span>Expires: {formatDate(invite.expiresAt)}</span>
          </div>
          
          {invite.usedBy && (
            <div className="text-xs text-muted-foreground">
              <div>Used by: {invite.usedBy}</div>
              <div>Email: {invite.usedByEmail}</div>
              {invite.usedAt && <div>Used on: {formatDate(invite.usedAt)}</div>}
            </div>
          )}
          
          <div className="text-xs text-muted-foreground">
            <div>Created: {formatDate(invite.createdAt)}</div>
            <div>By: {invite.createdBy}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
})

InviteCard.displayName = 'InviteCard'
