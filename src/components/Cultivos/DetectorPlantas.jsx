import '../../styles/detectorPlagas.css';
import React, { useState, useContext, useRef } from 'react';
import { UserContext } from '../../contexts/UserContext';
import conectar from '../../helpers/fetch';
import { Sprout, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export const DetectorPlantas = () => {
    const fileInputRef = useRef(null);
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
            setResultado(null);
        }
    };

    const enviarImagen = async () => {
        setCargando(true);
        const formData = new FormData();
        formData.append('image', file);

        const data = await conectar(`${import.meta.env.VITE_BACKEND_URL}apis/identificar-planta`, 'POST', formData, token);

        if (data) setResultado(data);
        setCargando(false);
    };

    return (

        <div className="analisis-card">
            <h3 className="card-title"><Sprout /> Identificar Plantas</h3>

            {/* Input escondido con una clase simple */}
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFile}
                style={{ display: 'none' }}
            />

            {/*botón normal que activa el de arriba */}
            <button
                type="button"
                className="btn-file-custom"
                onClick={() => fileInputRef.current.click()}
            >
                Subir Imagen
            </button>

            {preview && (
                <div className="preview-container mb10">
                    <img src={preview} width="200" alt="Preview" style={{ borderRadius: '8px' }} />
                </div>
            )}

            <button
                className="btn-analizar"
                onClick={enviarImagen}
                disabled={!file || cargando}
            >
                {cargando ? <Loader2 className="spinner" /> : 'Enviar Imagen'}
            </button>

            {resultado && (
                <div className="resultado-container">
                    {resultado.ok ? (
                        <div className="res-box plant-result">
                            <div className="result-header">
                                <CheckCircle2 className="icon-success" size={20} color="#22c55e"/>
                                <span className="text-success"> ¡Planta identificada con éxito!</span>
                            </div>

                            <div className="info-main">
                                <p className="common-name">Nombre común: <strong>{resultado.nombre_comun}</strong></p>
                                <p className="scientific-name">Nombre científico: <em>{resultado.nombre_cientifico}</em></p>
                            </div>

                            <div className="precision-badge">
                                Precisión: <strong>{resultado.precision}</strong>
                            </div>
                        </div>
                    ) : (
                        <div className="res-box plant-result">
                            <p className="info-text">
                                No se ha podido reconocer la planta.
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};