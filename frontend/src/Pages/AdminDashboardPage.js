import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './AdminDashboardPage.css';

// Mock location coordinates
const locationCoords = {
    'Mylapore': [13.033, 80.266],
    'Kodambakkam': [13.061, 80.228],
    'Tambaram': [12.923, 80.117],
    'Adyar': [12.99, 80.25],
    'T Nagar': [13.041, 80.244],
    'Velachery': [12.986, 80.219],
    'Madipakkam': [12.985, 80.203],
};

// Generate mock reports
const fetchProcessedReports = () => {
    const data = [];
    const subLocations = Object.keys(locationCoords);
    const types = ['Cyclone', 'Floods', 'Infrastructure Collapse'];
    const intensityLevels = ['low', 'medium', 'high'];
    const categories = ['Food', 'Medical', 'Rescue', 'Water', 'Shelter', 'Infrastructure'];

    for (let i = 0; i < 50; i++) {
        const district = 'Chennai';
        const state = 'Tamil Nadu';
        const subLocation = subLocations[Math.floor(Math.random() * subLocations.length)];
        const latLong = locationCoords[subLocation] || [13.0827, 80.2707];
        const type = types[Math.floor(Math.random() * types.length)];
        const intensity = intensityLevels[Math.floor(Math.random() * intensityLevels.length)];
        const reportCount = Math.floor(Math.random() * 20) + 1;
        const categoryCounts = categories.reduce((acc, cat) => {
            acc[cat] = Math.floor(Math.random() * 10);
            return acc;
        }, {});
        const source = ['twitter', 'reddit', 'facebook'][Math.floor(Math.random() * 3)];
        const description = `This is a report from ${source} about ${type} in ${subLocation}.`;

        const contributingReports = [];
        for (const cat in categoryCounts) {
            for (let j = 0; j < categoryCounts[cat]; j++) {
                contributingReports.push(`User report: Need for ${cat} in ${subLocation}.`);
            }
        }

        data.push({
            id: '_' + Math.random().toString(36).substr(2, 9),
            type,
            district,
            state,
            location: { lat: latLong[0], long: latLong[1] },
            intensity,
            reportCount,
            contributingReports,
            categoryCounts,
            description,
        });
    }

    return data;
};

// Custom marker icon
const getIcon = (intensity) => {
    let color = intensity === 'high' ? 'red' : intensity === 'medium' ? 'orange' : 'green';
    return new L.DivIcon({
        className: `custom-marker ${color}`,
        html: `<div style="background-color: ${color}; width: 10px; height: 10px; border-radius: 50%;"></div>`,
        iconSize: [12, 12],
    });
};

const AdminDashboardPage = () => {
    const [reports, setReports] = useState([]);
    const [circleCenter, setCircleCenter] = useState([13.0827, 80.2707]);

    useEffect(() => {
        const data = fetchProcessedReports();
        setReports(data);

        // Calculate center of all reports
        if (data.length > 0) {
            const avgLat = data.reduce((sum, r) => sum + r.location.lat, 0) / data.length;
            const avgLng = data.reduce((sum, r) => sum + r.location.long, 0) / data.length;
            setCircleCenter([avgLat, avgLng]);
        }
    }, []);

    return (
        <div className="dashboard-container">
            <h2 className="dashboard-title">Maritime Emergency Response Portal</h2>
            <p className="dashboard-subtitle">Real-time Social Media Post Visualization</p>

            <div className="map-container">
                <MapContainer center={circleCenter} zoom={11} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
                    <TileLayer
                        attribution='&copy; OpenStreetMap contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {/* Circle covering affected area */}
                    <Circle
                        center={circleCenter}
                        radius={7500} // Adjust radius as needed (in meters)
                        pathOptions={{ color: 'red', fillColor: 'red', fillOpacity: 0.1 }}
                    />

                    {reports.map((report) => (
                        <Marker
                            key={report.id}
                            position={[report.location.lat, report.location.long]}
                            icon={getIcon(report.intensity)}
                        >
                            <Popup>
                                <h3>🚨 Report Details:</h3>
                                <p><strong>Event Type:</strong> {report.type}</p>
                                <p><strong>District:</strong> {report.district}</p>
                                <p><strong>State:</strong> {report.state}</p>
                                <p><strong>Intensity:</strong> <span className={`intensity-${report.intensity}`}>{report.intensity.toUpperCase()}</span></p>
                                <p><strong>Total Reports:</strong> {report.reportCount}</p>
                                <p><strong>Description:</strong> {report.description}</p>
                                <h4>Categorized Needs:</h4>
                                <ul>
                                    {Object.entries(report.categoryCounts).map(([cat, count]) => (
                                        <li key={cat}><strong>{cat}:</strong> {count}</li>
                                    ))}
                                </ul>
                                <h4>Contributing Reports:</h4>
                                <ul className="contributing-reports-list">
                                    {report.contributingReports.map((desc, idx) => <li key={idx}>{desc}</li>)}
                                </ul>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </div>
        </div>
    );
};

export default AdminDashboardPage;
