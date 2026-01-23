import React from 'react';
import { MapContainer, TileLayer, FeatureGroup, Polygon, Popup } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import L from 'leaflet';

import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';

// Configuración de iconos de Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const SPAIN_CENTER = [40.4637, -3.7492];

// 1. AÑADIDOS LOS NUEVOS PROPS: onZoneClicked y readOnly
export default function MapDraw({ onZoneCreated, onZoneClicked, readOnly, zonasVisibles = [] }) {
    
    const _onCreated = (e) => {
        const { layerType, layer } = e;
        if (layerType === 'polygon') {
            const coordinates = layer.getLatLngs()[0];
            if (onZoneCreated) {
                onZoneCreated(coordinates, layer);
            }
        }
    };

    const _onEdited = (e) => {
        const layers = e.layers;
        layers.eachLayer((layer) => {
            const coordinates = layer.getLatLngs()[0];
            if (onZoneCreated) {
                onZoneCreated(coordinates, layer);
            }
        });
    };

    return (
        <div style={{ height: '500px', width: '100%' }}>
            <MapContainer center={SPAIN_CENTER} zoom={6} style={{ height: '100%', width: '100%' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                
                {/* 2. OCULTAR HERRAMIENTAS SI ES SOLO LECTURA (readOnly) */}
                {!readOnly && (
                    <FeatureGroup>
                        <EditControl
                            position="topright"
                            onCreated={_onCreated}
                            onEdited={_onEdited}
                            draw={{
                                rectangle: false,
                                circle: false,
                                polyline: false,
                                circlemarker: false,
                                marker: false,
                                polygon: {
                                    allowIntersection: false,
                                    shapeOptions: { color: '#9b59b6' }
                                }
                            }}
                        />
                    </FeatureGroup>
                )}

                {/* 3. CORREGIDAS LAS PROPIEDADES (id_cultivo, poligono) Y AÑADIDO EL CLICK */}
               // En tu archivo components/map/Map.jsx
{zonasVisibles.map((zona) => (
    <Polygon 
        key={zona.id} 
        positions={zona.coords}
        // 👇 Esto es lo que activa los gráficos
        eventHandlers={{ click: () => onZoneClicked(zona.id) }} 
        pathOptions={{ color: zona.color || '#3388ff' }}
    >
        <Popup><strong>{zona.nombre}</strong></Popup>
    </Polygon>
))}
            </MapContainer>
        </div>
    );
}