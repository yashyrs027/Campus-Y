import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'

function DashboardLayout({ children, navItems, sidebarTitle, sidebarSubtitle, topbarTitle, user, role, action }) {
  return (
    <div className="dashboard-shell">
      <Sidebar title={sidebarTitle} subtitle={sidebarSubtitle} navItems={navItems} action={action} />
      <main className="dashboard-main">
        <Topbar title={topbarTitle} user={user} role={role} />
        <div className="dashboard-content">{children}</div>
      </main>
    </div>
  )
}

export default DashboardLayout
