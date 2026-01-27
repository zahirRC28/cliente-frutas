import '../../styles/detectorPlagas.css';
import React, { useState, useContext, useRef } from 'react';
import { UserContext } from '../../contexts/UserContext';
import conectar from '../../helpers/fetch';
import { Sprout, Loader2, CheckCircle2 } from 'lucide-react';

export const DetectorPlantas = () => {
    const fileInputRef = useRef(null); //Crea la referencia
    const { token } = useContext(UserContext);
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [resultado, setResultado] = useState(null);
    const [cargando, setCargando] = useState(false);

    const handleFile = (e) => {
        const selected = e.target.files[0];
        if (selected) {
            setFile(selected);
            setPreview(URL.createObjectURL(selected));
        }
    };

    const enviarImagen = async () => {
        setCargando(true);
        const formData = new FormData();
        formData.append('image', file);

        const data = await conectar(`${import.meta.env.VITE_BACKEND_URL}apis/identificar-planta`, 'POST', formData, token);

        if (data && data.ok) setResultado(data);
        setCargando(false);
    };

    return (
        <div className="analisis-card">
            <h3><Sprout /> Identificar Plantas</h3>
           {/*Input escondido con una clase simple */}
            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFile} 
                style={{ display: 'none' }} 
            />

          <button 
                type="button"
                className="btn-file-custom" 
                onClick={() => fileInputRef.current.click()}
            >
                Seleccionar imagen
            </button>
            
            {preview && (
                <div className="preview-container mb10">
                    <img src={preview} width="200" alt="Preview" style={{ borderRadius: '8px' }} />
                </div>
            )}

            <button className="btn-analizar" onClick={enviarImagen} disabled={!file || cargando}>
                {cargando ? <Loader2 className="spinner" /> : 'Identificar Planta'}
            </button>

            {resultado && (
                <div className="res-box plant-result">
                    <div className="result-header">
                        <CheckCircle2 size={20} color="#22c55e" />
                        <span> ¡Planta identificada con éxito!</span>
                    </div>

                    <div className="info-main">
                        <p className="common-name">Nombre común: <strong>{resultado.nombre_comun}</strong></p>
                        <p className="scientific-name">Nombre científico: {resultado.nombre_cientifico}</p>
                    </div>

                    <div className="precision-badge">
                        Precisión: <strong>{resultado.precision}</strong>
                    </div>
                </div>
            )}
        </div>
    );
};