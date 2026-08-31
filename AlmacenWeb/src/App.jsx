import { useState } from 'react'
import { Encabezado } from './componentes/encabezado'

import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <Encabezado/>
    <Routes>
      <Route path="/" element={<Pagina_inicio />} />
    </Routes>
    </>
  )
}

export default App
