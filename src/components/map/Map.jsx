// src/components/map/Map.jsx
import React, { useEffect } from 'react';
import { MapContainer, TileLayer, FeatureGroup, Polygon, Popup, useMap } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';

// Configuración de iconos (Igual que tenías)
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

// Componente para recentrar cámara
const RecenterMap = ({ coords }) => {
    const map = useMap();
    useEffect(() => {
        if (coords && coords.length > 0) {
            if (coords.length === 1) {
                map.flyTo(coords[0], 13);
            } else {
                const bounds = L.latLngBounds(coords);
                map.flyToBounds(bounds, { padding: [50, 50] });
            }
        }
    }, [coords, map]);
    return null;
};

// AÑADIDO: prop 'onZoneDeleted'
export default function MapDraw({ onZoneCreated, onZoneClicked, onZoneDeleted, readOnly, zonasVisibles = [], poligonoActual }) {    
    const _onCreated = (e) => {
        const { layerType, layer } = e;
        if (layerType === 'polygon') {
            const coordinates = layer.getLatLngs()[0];
            if (onZoneCreated) onZoneCreated(coordinates, layer);
        }
    };

    const _onEdited = (e) => {
        const layers = e.layers;
        layers.eachLayer((layer) => {
            const coordinates = layer.getLatLngs()[0];
            if (onZoneCreated) onZoneCreated(coordinates, layer);
        });
    };

    
const _onDeleted = (e) => {
   onZoneDeleted()
    };

    return (
        <div style={{ height: '500px', width: '100%' }}>
                <MapContainer 
                center={SPAIN_CENTER} 
                zoom={6} 
                minZoom={3} 
                maxBounds={[
                    [-90, -180],
                    [90, 180]
                ]} 
                maxBoundsViscosity={1.0}
                style={{ height: '100%', width: '100%' }}
>                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" noWrap={true} />
                
                
                <RecenterMap coords={poligonoActual} />

                {!readOnly && (
                    <FeatureGroup>
                        <EditControl
                            position="topright"
                            onCreated={_onCreated}
                            onEdited={_onEdited}
                            onDeleted={_onDeleted}
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

                {/* Polígono Manual (Naranja) */}
                {poligonoActual && poligonoActual.length > 0 && (
                    <Polygon 
                        positions={poligonoActual}
                        pathOptions={{ color: '#f97316', dashArray: '5, 5', fillColor: '#f97316', fillOpacity: 0.4 }}
                    />
                )}

                {/* Polígonos Guardados (Verde/Rojo) */}
                {zonasVisibles.map((zona) => (
                    <Polygon 
                        key={zona.id} 
                        positions={zona.coords}
                        eventHandlers={{ click: () => onZoneClicked && onZoneClicked(zona.id) }} 
                        pathOptions={{ color: zona.color || '#3388ff' }}
                    >
                        <Popup><strong>{zona.nombre}</strong></Popup>
                    </Polygon>
                ))}
            </MapContainer>
        </div>
    );
}