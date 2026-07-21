import { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'

function DashboardLayout({ children, navItems, sidebarTitle, sidebarSubtitle, topbarTitle, user, role, action }) {
  // Sidebar is open by default on desktop (> 980px), closed by default on mobile (<= 980px)
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => window.innerWidth > 980)

  useEffect(() => {
    const handleResize = () => {
      // Keep desktop open when switching to desktop screen
      if (window.innerWidth > 980) {
        setIsSidebarOpen(true)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev)
  }

  const closeSidebarMobile = () => {
    if (window.innerWidth <= 980) {
      setIsSidebarOpen(false)
    }
  }

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isSidebarOpen && (
        <div 
          className="sidebar-backdrop" 
          onClick={() => setIsSidebarOpen(false)} 
          aria-label="Close sidebar overlay"
        />
      )}

      <div className={`dashboard-shell ${isSidebarOpen ? 'sidebar-open' : 'sidebar-collapsed'}`}>
        <Sidebar 
          title={sidebarTitle} 
          subtitle={sidebarSubtitle} 
          navItems={navItems} 
          action={action}
          isOpen={isSidebarOpen}
          onToggle={toggleSidebar}
          onNavClick={closeSidebarMobile}
        />
        <main className="dashboard-main">
          <Topbar 
            title={topbarTitle} 
            user={user} 
            role={role} 
            onToggleSidebar={toggleSidebar}
            isSidebarOpen={isSidebarOpen}
          />
          <div className="dashboard-content">{children}</div>
        </main>
      </div>
    </>
  )
}

export default DashboardLayout
