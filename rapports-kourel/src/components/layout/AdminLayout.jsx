import { useState } from 'react'
import { useNavigate, useLocation, Link, Outlet } from 'react-router-dom'
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
  LayoutDashboard, FileText, BookOpen, BarChart2,
  ClipboardList, Users, FileCheck, Settings, Bell,
  LogOut, ChevronRight, UserCheck, Calendar, Star, ListChecks,
} from 'lucide-react'
import { logoutAdmin } from '@/lib/supabase'

// ─── Structure de navigation ──────────────────────────────────────────────────

const NAV = [
  { title: 'Tableau de bord', icon: LayoutDashboard, href: '/admin' },
  {
    title: 'Rapports',
    icon: FileText,
    children: [
      { title: 'Rapports PKC',    href: '/admin/rapports',  soon: true },
      { title: 'Programme Annuel', href: '/admin/programme', soon: true },
      { title: 'Synthèse',        href: '/admin/synthese',   soon: true },
    ],
  },
  {
    title: 'Comité & Évaluation',
    icon: ClipboardList,
    children: [
      { title: 'Membres',             icon: Users,       href: '/admin/evaluation/membres' },
      { title: 'Types d\'événements', icon: ListChecks,  href: '/admin/evaluation/types' },
      { title: 'Événements',          icon: Calendar,    href: '/admin/evaluation/evenements' },
      { title: 'Évaluations',         icon: Star,        href: '/admin/evaluation/evaluations' },
      { title: 'Critères',            icon: UserCheck,   href: '/admin/evaluation/criteres' },
    ],
  },
  {
    title: 'Paramètres',
    icon: Settings,
    children: [
      { title: 'Kourels',       href: '/admin/kourels' },
      { title: 'Notifications', href: '/admin/notifications', soon: true },
    ],
  },
]

// ─── Sidebar component ────────────────────────────────────────────────────────

function AppSidebar({ user, onLogout }) {
  const location = useLocation()
  const { state } = useSidebar()
  const isCollapsed = state === 'collapsed'

  const isGroupActive = (group) =>
    group.children?.some(c => !c.soon && location.pathname.startsWith(c.href))

  const [openGroups, setOpenGroups] = useState(() =>
    NAV.filter(n => n.children && n.children.some(c => location.pathname.startsWith(c.href)))
      .map(n => n.title)
  )

  const toggleGroup = (title) => {
    setOpenGroups(g => g.includes(title) ? g.filter(x => x !== title) : [...g, title])
  }

  const isActive = (href) =>
    href === '/admin' ? location.pathname === '/admin' : location.pathname.startsWith(href)

  return (
    <Sidebar collapsible="icon">
      {/* Header */}
      <SidebarHeader className="border-b border-sidebar-border px-3 py-4">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
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

      {/* Navigation */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV.map((item) => {
                // ── Item simple ──
                if (!item.children) {
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive(item.href)}
                        tooltip={item.title}
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

                // ── Groupe dépliant ──
                const isOpen = openGroups.includes(item.title)
                const active = isGroupActive(item)

                return (
                  <Collapsible key={item.title} open={isOpen} onOpenChange={() => toggleGroup(item.title)}>
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton
                          tooltip={item.title}
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
                                <span>{child.title}</span>
                                <span className="ml-auto text-[9px] font-semibold bg-vert-900/60 text-vert-400 px-1.5 py-0.5 rounded">soon</span>
                              </SidebarMenuSubButton>
                            ) : (
                              <SidebarMenuSubButton asChild isActive={isActive(child.href)}>
                                <Link to={child.href}>{child.title}</Link>
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

      {/* Footer */}
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
                <p className="text-[10px] text-vert-200/60">Administrateur</p>
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

// ─── Topbar ───────────────────────────────────────────────────────────────────

function TopBar({ user, onLogout }) {
  const initiale = (user?.email?.[0] || 'A').toUpperCase()
  return (
    <header className="flex items-center gap-3 border-b border-gris-200 bg-white px-4 md:px-6 h-14 flex-shrink-0">
      <SidebarTrigger className="text-gris-500 hover:text-gris-700 hover:bg-gris-100 rounded-md p-1.5 transition-colors" />
      <Separator orientation="vertical" className="h-5 bg-gris-200" />
      <span className="text-sm font-medium text-gris-400 hidden sm:block">Espace Admin</span>

      <div className="flex items-center gap-2 ml-auto">
        {/* Statut connecté */}
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

        <button
          onClick={onLogout}
          className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-gris-100 transition-colors group"
        >
          <div className="w-7 h-7 rounded-full bg-vert-700 flex items-center justify-center">
            <span className="text-white text-xs font-bold">{initiale}</span>
          </div>
          <div className="hidden lg:block text-left">
            <p className="text-xs font-semibold text-gris-950 truncate max-w-[120px]">{user?.email}</p>
            <p className="text-[10px] text-gris-500">Admin · Déconnexion</p>
          </div>
          <LogOut size={13} className="text-gris-400 group-hover:text-rouge hidden lg:block" />
        </button>
      </div>
    </header>
  )
}

// ─── Layout principal ─────────────────────────────────────────────────────────

export function AdminLayout({ user }) {
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logoutAdmin()
    navigate('/login', { replace: true })
  }

  return (
    <SidebarProvider>
      <AppSidebar user={user} onLogout={handleLogout} />
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <TopBar user={user} onLogout={handleLogout} />
        <div className="flex-1 overflow-y-auto bg-white p-6">
          <Outlet />
        </div>
      </div>
    </SidebarProvider>
  )
}
