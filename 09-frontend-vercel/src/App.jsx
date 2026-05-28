import { Route, Routes } from 'react-router-dom'
import { TooltipProvider } from '@/components/ui/tooltip'
import Layout from '@/components/Layout'
import Overview from '@/pages/Overview'
import AlertsMap from '@/pages/AlertsMap'
import Assistant from '@/pages/Assistant'

function App() {
  return (
    <TooltipProvider delayDuration={150}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Overview />} />
          <Route path="mapa" element={<AlertsMap />} />
          <Route path="assistente" element={<Assistant />} />
        </Route>
      </Routes>
    </TooltipProvider>
  )
}

export default App
