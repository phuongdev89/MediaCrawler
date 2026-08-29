import { useState } from 'react'
import { Toaster } from 'sonner'
import { Sidebar } from '@/components/layout/Sidebar'
import { MainContent } from '@/components/layout/MainContent'
import { CrawlerConfigPanel } from '@/components/config/CrawlerConfigPanel'
import { EnvironmentCheck, isEnvChecked } from '@/components/env/EnvironmentCheck'
import { isLicenseAccepted, LicenseDisclaimer } from '@/components/license/LicenseDisclaimer'
import { XiaohongshuPage } from '@/components/xhs/XiaohongshuPage'

type AppPage = 'dashboard' | 'xhs'

function App() {
  const [licenseAccepted, setLicenseAccepted] = useState(() => isLicenseAccepted())
  const [envChecked, setEnvChecked] = useState(() => isEnvChecked())
  const [activePage, setActivePage] = useState<AppPage>('dashboard')

  const handleEnvCheckComplete = () => {
    setEnvChecked(true)
  }

  const handleLicenseAccept = () => {
    setLicenseAccepted(true)
  }

  return (
    <div className="flex flex-col h-screen cyber-grid overflow-hidden relative">
      {!licenseAccepted && <LicenseDisclaimer onAccept={handleLicenseAccept} />}

      {licenseAccepted && !envChecked && (
        <EnvironmentCheck onCheckComplete={handleEnvCheckComplete} />
      )}

      <Sidebar activePage={activePage} onPageChange={setActivePage} />

      <div className="flex-1 flex flex-col gap-4 p-4 overflow-hidden min-h-0">
        {activePage === 'dashboard' ? (
          <>
            <div className="flex-shrink-0">
              <CrawlerConfigPanel />
            </div>
            <MainContent />
          </>
        ) : (
          <XiaohongshuPage />
        )}
      </div>

      <Toaster
        position="top-right"
        toastOptions={{
          className: 'glass-panel font-mono text-cyber-text-primary',
          style: {
            fontFamily: 'JetBrains Mono, monospace',
          },
        }}
      />
    </div>
  )
}

export default App
