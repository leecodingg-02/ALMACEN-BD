import { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Encabezado from './componentes/Encabezado'
import Inicio from './paginas/Inicio'
import Productos from './paginas/Productos'
import DetalleProducto from './paginas/DetalleProducto'

function RestaurarScroll() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}

function App() {
  return (
    <>
      <Encabezado />
      <RestaurarScroll />
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/productos" element={<Productos />} />
        <Route path="/productos/:id" element={<DetalleProducto />} />
      </Routes>
    </>
  )
}

export default App
