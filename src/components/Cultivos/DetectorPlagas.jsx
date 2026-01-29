import '../../styles/detectorPlagas.css';
import React, { useState, useContext, useRef } from 'react';
import { UserContext } from '../../contexts/UserContext';
import conectar from '../../helpers/fetch';
import { Bug, Loader2, CheckCircle2 } from 'lucide-react';

export const DetectorPlagas = () => {
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
        }
    };

    const enviarImagen = async () => {
        setCargando(true);
        const formData = new FormData();
        formData.append('file', file);

        const data = await conectar(`${import.meta.env.VITE_BACKEND_URL}apis/identificar-plaga`, 'POST', formData, token);

        if (data && data.ok) setResultado(data);
        setCargando(false);
    };

    return (
        <div className="analisis-card">
            <h3><Bug /> Identificar Plaga</h3>
            {/* Input escondido con una clase simple */}
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFile}
                style={{ display: 'none' }}
            />

            {/* Un botón normal que activa el de arriba */}
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

            <button className="btn-analizar" onClick={enviarImagen} disabled={!file || cargando}>
                {cargando ? <Loader2 className="spinner" /> : 'Enviar Imagen'}
            </button>

            {resultado && (
                <>
                    {/* Si total es mayor a 0, mostramos los resultados */}
                    {resultado.total > 0 ? (
                        <div className="res-box plant-result">
                            <div className="result-header">
                                <CheckCircle2 size={20} color="#22c55e" />
                                <span> ¡Análisis finalizado!</span>
                            </div>

                            <div className="info-main">
                                <p className="common-name">
                                    Plaga detectada: <strong>{resultado.detecciones[0].plaga}</strong>
                                </p>
                            </div>

                            <div className="precision-badge">
                                Precisión: <strong>{(resultado.detecciones[0].confianza * 100).toFixed(2)}%</strong>
                            </div>
                        </div>
                    ) : (
                        /* Si el total es 0, mostramos que no hay plagas */
                        <div className="res-box plant-result">
                            <p className="info-text">
                                No se ha podido reconocer la plaga.
                            </p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};