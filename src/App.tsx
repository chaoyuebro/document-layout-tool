import EditorPage from './pages/editor'
import { Toaster } from 'sonner'

function App() {
  return (
    <>
      <EditorPage />
      <Toaster position="top-center" expand={true} richColors />
    </>
  )
}

export default App
