import { Routes, Route } from 'react-router-dom'
import Encabezado from './componentes/encabezado'
import Pagina_inicio from './paginas/pagina_inicio'

function App() {
  return (
    <>
      <Encabezado />
      <Routes>
        <Route path="/" element={<Pagina_inicio />} />
      </Routes>
    </>
  )
}

export default App
