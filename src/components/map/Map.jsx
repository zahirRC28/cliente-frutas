import React, { useState } from 'react';
import { MapContainer, TileLayer, FeatureGroup } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import L from 'leaflet';

// --- CSS propio de leaflet
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css'; 

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

export default function MapDraw({ onZoneCreated }) {
    
    //aqui tenemos que mandar los datos para la creacion del campo
    const _onCreated = (e) => {
        const { layerType, layer } = e;
        if (layerType === 'polygon') {
            const coordinates = layer.getLatLngs()[0];
            //coordinates tiene los datos que tenemos que mandar o asi
            console.log("Zona creada:", coordinates);
            
            // envio coordenadas al componente padre 
            if (onZoneCreated) {
                onZoneCreated(coordinates);
            }
        }
    };

    const _onDeleted = (e) => {
        console.log("Zona eliminada");
        if (onZoneCreated) onZoneCreated(null); // padre limpito 
    };

    return (
        <div style={{ height: "500px", width: "100%", borderRadius: "10px", overflow: "hidden", border: "1px solid #ccc" }}>
            <MapContainer 
                center={SPAIN_CENTER} 
                zoom={6} 
                style={{ height: "100%", width: "100%" }}
            >
                <TileLayer
                    attribution='&copy; OpenStreetMap contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <FeatureGroup>
                    <EditControl
                        position='topright'
                        onCreated={_onCreated}
                        onDeleted={_onDeleted}
                        draw={{
                            rectangle: false, 
                            circle: false,
                            circlemarker: false,
                            marker: false,
                            polyline: false,
                            polygon: {
                                allowIntersection: true, // arreglamos el tema de los nudos
                                showArea: true,
                                shapeOptions: {
                                    color: '#9b59b6', // ese color es moradito 
                                    fillOpacity: 0.4
                                }
                            }
                        }}
                    />
                </FeatureGroup>
            </MapContainer>
        </div>
    );
}