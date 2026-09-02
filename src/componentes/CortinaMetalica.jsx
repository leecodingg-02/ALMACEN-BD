import { useState, useEffect } from 'react';
import logoBlancoImg from '../imagenes/logo_blanco.png';
import './CortinaMetalica.css';

export default function CortinaMetalica() {
  const [fase, setFase] = useState('cerrada'); // 'cerrada' | 'abriendo' | 'completada'

  useEffect(() => {
    // 1. Pausa de 380ms para presentar el logo
    const timerAbrir = setTimeout(() => {
      setFase('abriendo');
    }, 380);

    // 2. Desmontar del DOM inmediatamente al culminar el deslizamiento (1300ms)
    const timerCompletar = setTimeout(() => {
      setFase('completada');
    }, 1300);

    return () => {
      clearTimeout(timerAbrir);
      clearTimeout(timerCompletar);
    };
  }, []);

  if (fase === 'completada') return null;

  return (
    <div className={`cortina-metalica-overlay ${fase === 'abriendo' ? 'animar-apertura' : ''}`}>
      {/* Persiana enrollable completa */}
      <div className="cortina-persiana">
        {/* Rieles guía laterales */}
        <div className="cortina-riel-izq" />
        <div className="cortina-riel-der" />

        {/* Reflejo metálico dinámico */}
        <div className="cortina-reflejo-metal" />

        {/* Emblema central con placa y logo */}
        <div className="cortina-emblema-contenedor">
          <div className="cortina-placa-metalica">
            <span className="cortina-remache r-tl" />
            <span className="cortina-remache r-tr" />
            <span className="cortina-remache r-bl" />
            <span className="cortina-remache r-br" />

            <img
              src={logoBlancoImg}
              alt="Logo NovaCasa"
              className="cortina-logo-img"
            />
            <span className="cortina-subtitulo">Panel de Administración</span>
          </div>
        </div>

        {/* Zócalo inferior macizo con tiradores y cerradura */}
        <div className="cortina-zocalo-inferior">
          <div className="cortina-tirador" />
          <div className="cortina-cerradura">
            <div className="cortina-cerradura-ojo" />
          </div>
          <div className="cortina-tirador" />
        </div>

        {/* Haz de luz brillante emergente al subir */}
        <div className="cortina-luz-apertura" />
      </div>
    </div>
  );
}
