import { useState } from 'react'
import { useLocation, Link, Outlet } from 'react-router-dom'
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup,
  SidebarGroupContent, SidebarGroupLabel, SidebarHeader,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem,
  SidebarProvider, SidebarTrigger, useSidebar,
} from '@/components/ui/sidebar'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Separator } from '@/components/ui/separator'
import {
  LayoutDashboard, FileText, BookOpen,
  ClipboardList, Users, Settings, Bell,
  LogOut, ChevronRight, Calendar, Star, ListChecks, Scale,
  ClipboardCheck, FileSpreadsheet, ExternalLink, KeyRound,
} from 'lucide-react'
import { logoutAdmin } from '@/lib/supabase'
import { ChangePasswordModal } from '@/components/ChangePasswordModal'

const NAV = [
  { title: 'Tableau de bord', icon: LayoutDashboard, href: '/admin' },
  {
    title: 'Rapports & Synthèse',
    icon: FileText,
    children: [
      { icon: FileText, title: 'Rapports PKC',      href: '/admin/rapports',  soon: true },
      { icon: BookOpen,  title: 'Programme Annuel',  href: '/admin/programme', soon: true },
      { icon: FileSpreadsheet, title: 'Synthèse',    href: '/admin/synthese',  soon: true },
      { icon: ClipboardCheck, title: 'Comptes rendus', href: '/admin/comptes-rendus', soon: true },
    ],
  },
  {
    title: 'Comité & Évaluation',
    icon: ClipboardList,
    children: [
      { icon: Users,     title: 'Membres',             href: '/admin/evaluation/membres' },
      { icon: ListChecks,title: 'Types d\'événements', href: '/admin/evaluation/types' },
      { icon: Calendar,  title: 'Événements',          href: '/admin/evaluation/evenements' },
      { icon: Star,      title: 'Évaluations',         href: '/admin/evaluation/evaluations' },
      { icon: Scale,     title: 'Critères',            href: '/admin/evaluation/criteres' },
      { icon: ExternalLink, title: 'Page publique éval', href: '/evaluer', target: '_blank' },
    ],
  },
  {
    title: 'Pôle Administration (PAD)',
    icon: ClipboardCheck,
    children: [
      { icon: Calendar, title: 'Sessions',    href: '/admin/pad/sessions', soon: true },
      { icon: FileText, title: 'Rapports PAD', href: '/admin/pad/rapports', soon: true },
    ],
  },
  {
    title: 'Paramètres',
    icon: Settings,
    children: [
      { icon: Users,     title: 'Kourels',       href: '/admin/kourels' },
      { icon: Bell,      title: 'Notifications', href: '/admin/notifications', soon: true },
    ],
  },
]

const ROLE_LABELS = { admin: 'Administrateur', dieuwrigne: 'Comité Suivi & Évaluation', membre: 'Membre' }

function AppSidebar({ user, profile, nav, onLogout }) {
  const location = useLocation()
  const { state } = useSidebar()
  const isCollapsed = state === 'collapsed'

  const isGroupActive = (group) =>
    group.children?.some(c => !c.soon && location.pathname.startsWith(c.href))

  const [openGroups, setOpenGroups] = useState(() =>
    nav.filter(n => n.children && n.children.some(c => location.pathname.startsWith(c.href)))
      .map(n => n.title)
  )

  const toggleGroup = (title) => {
    setOpenGroups(g => g.includes(title) ? g.filter(x => x !== title) : [...g, title])
  }

  const isActive = (href) =>
    href === '/admin' ? location.pathname === '/admin' : location.pathname.startsWith(href)

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border px-3 py-4">
        <div className="flex items-center gap-3 group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:justify-center">
          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center overflow-visible flex-shrink-0">
            <img src="/images/logo-dmn.png" alt="DMN" className="w-full h-full object-contain" />
          </div>
          {!isCollapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-white leading-tight truncate">DMN · Pôle Kourel</p>
              <p className="text-[11px] text-vert-200/70 leading-tight">Centrale</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {nav.map((item) => {
                if (!item.children) {
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive(item.href)}
                        className="text-sidebar-foreground data-[active=true]:text-white data-[active=true]:bg-sidebar-primary"
                      >
                        <Link to={item.href}>
                          <item.icon className="flex-shrink-0" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                }

                const isOpen = openGroups.includes(item.title)
                const active = isGroupActive(item)

                return (
                  <Collapsible key={item.title} open={isOpen} onOpenChange={() => toggleGroup(item.title)}>
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton
                          isActive={active && isCollapsed}
                          className={`text-sidebar-foreground w-full ${active && !isCollapsed ? 'text-white' : ''}`}
                        >
                          <item.icon className="flex-shrink-0" />
                          <span className="flex-1 text-left">{item.title}</span>
                          <ChevronRight
                            size={14}
                            className={`flex-shrink-0 transition-transform duration-200 group-data-[collapsible=icon]:hidden ${isOpen ? 'rotate-90' : ''}`}
                          />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                    </SidebarMenuItem>

                    <CollapsibleContent>
                      <SidebarMenuSub className="group-data-[collapsible=icon]:hidden">
                        {item.children.map((child) => (
                          <SidebarMenuSubItem key={child.href}>
                            {child.soon ? (
                              <SidebarMenuSubButton disabled className="opacity-35 cursor-not-allowed">
                                {child.icon && <child.icon size={14} className="opacity-40 flex-shrink-0" />}
                                <span>{child.title}</span>
                                <span className="ml-auto text-[9px] font-semibold bg-vert-900/60 text-vert-400 px-1.5 py-0.5 rounded">soon</span>
                              </SidebarMenuSubButton>
                            ) : (
                              <SidebarMenuSubButton asChild isActive={!child.target && isActive(child.href)}>
                                {child.target ? (
                                  <a href={child.href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                                    {child.icon && <child.icon size={14} className="opacity-60 flex-shrink-0" />}
                                    <span>{child.title}</span>
                                  </a>
                                ) : (
                                  <Link to={child.href} className="flex items-center gap-2">
                                    {child.icon && <child.icon size={14} className="opacity-60 flex-shrink-0" />}
                                    <span>{child.title}</span>
                                  </Link>
                                )}
                              </SidebarMenuSubButton>
                            )}
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </Collapsible>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border px-2 py-3">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-7 h-7 rounded-full bg-vert-600 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold">
              {(user?.email?.[0] || 'A').toUpperCase()}
            </span>
          </div>
          {!isCollapsed && (
            <>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white truncate">{user?.email || 'Admin'}</p>
                <p className="text-[10px] text-vert-200/60">{ROLE_LABELS[profile?.role] || 'Administrateur'}</p>
              </div>
              <button
                onClick={onLogout}
                className="p-1.5 rounded-md text-vert-200/60 hover:bg-vert-900/60 hover:text-white transition-colors flex-shrink-0"
                title="Déconnexion"
              >
                <LogOut size={15} />
              </button>
            </>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}

function TopBar({ user, profile, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [showChangePassword, setShowChangePassword] = useState(false)
  const initiale = (user?.email?.[0] || 'A').toUpperCase()

  const handleLogoutClick = async () => {
    setMenuOpen(false)
    try {
      await onLogout()
    } catch {
      // ignore
    }
    window.location.href = '/login'
  }

  return (
    <header className="flex items-center gap-3 border-b border-gris-200 bg-white px-4 md:px-6 h-14 flex-shrink-0 relative">
      <SidebarTrigger className="text-gris-500 hover:text-gris-700 hover:bg-gris-100 rounded-md p-1.5 transition-colors" />
      <Separator orientation="vertical" className="h-5 bg-gris-200" />
      <span className="text-sm font-medium text-gris-400 hidden sm:block">Espace Admin</span>

      <div className="flex items-center gap-2 ml-auto">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-vert-50 border border-vert-200">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-vert-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-vert-600" />
          </span>
          <span className="text-[11px] font-semibold text-vert-700 hidden sm:block">Connecté</span>
        </div>

        <Separator orientation="vertical" className="h-5 bg-gris-200" />

        <button className="relative p-2 rounded-lg hover:bg-gris-100 text-gris-500 hover:text-gris-700 transition-colors">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange rounded-full border-2 border-white" />
        </button>

        <Separator orientation="vertical" className="h-5 bg-gris-200" />

        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-gris-100 transition-colors group"
          >
            <div className="w-7 h-7 rounded-full bg-vert-700 flex items-center justify-center">
              <span className="text-white text-xs font-bold">{initiale}</span>
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-xs font-semibold text-gris-950 truncate max-w-[120px]">{user?.email}</p>
              <p className="text-[10px] text-gris-500">{ROLE_LABELS[profile?.role] || 'Admin'}</p>
            </div>
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-full mt-1 z-50 w-56 bg-white border border-gris-200 rounded-xl shadow-lg py-1.5">
                <div className="px-3 py-2 border-b border-gris-100">
                  <p className="text-xs font-semibold text-gris-950 truncate">{user?.email}</p>
                  <p className="text-[10px] text-gris-500">{ROLE_LABELS[profile?.role] || 'Admin'}</p>
                </div>
                <button
                  onClick={() => { setMenuOpen(false); setShowChangePassword(true) }}
                  className="flex items-center gap-2.5 w-full px-3 py-2 text-xs font-medium text-gris-700 hover:bg-gris-50 transition-colors"
                >
                  <KeyRound size={14} className="text-gris-400" />
                  Changer le mot de passe
                </button>
                <div className="border-t border-gris-100 my-1" />
                <button
                  onClick={handleLogoutClick}
                  className="flex items-center gap-2.5 w-full px-3 py-2 text-xs font-medium text-rouge hover:bg-rouge-bg transition-colors"
                >
                  <LogOut size={14} />
                  Déconnexion
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <ChangePasswordModal open={showChangePassword} onOpenChange={setShowChangePassword} />
    </header>
  )
}

function filterNavByRole(nav, role) {
  if (role === 'admin') return nav
  if (role === 'dieuwrigne') {
    return nav.filter(g => g.title === 'Comité & Évaluation')
  }
  if (role === 'membre') {
    return nav.filter(g => g.title === 'Comité & Évaluation')
  }
  return nav
}

export function AdminLayout({ user, profile }) {
  const role = profile?.role || 'admin'

  const handleLogout = async () => {
    try { await logoutAdmin() } catch {}
    window.location.replace('/login')
  }

  const filteredNav = filterNavByRole(NAV, role)

  return (
    <SidebarProvider>
      <AppSidebar user={user} profile={profile} nav={filteredNav} onLogout={handleLogout} />
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <TopBar user={user} profile={profile} onLogout={handleLogout} />
        <div className="flex-1 overflow-y-auto bg-white p-4 md:p-6">
          <Outlet />
        </div>
      </div>
    </SidebarProvider>
  )
}
