import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster';

import { FaRegCompass, FaUser, FaExclamationTriangle, FaRegLifeRing, FaPhone, FaAmbulance, FaShieldAlt } from 'react-icons/fa';
import { MdOutlineWarning, MdOutlineWaves } from 'react-icons/md';

import './EarlyWarningPage.css';
import AlertFilter from '../components/Alerts/AlertFilter';
import AlertList from '../components/Alerts/AlertList';
import { fetchAllAlerts, searchAlerts } from '../services/AlertService';

// Helper function to get icon based on alert type
const getAlertIcon = (type) => {
    switch (type.toLowerCase()) {
        case 'cyclone': return <FaRegCompass />;
        case 'high wave': return <MdOutlineWaves />;
        case 'ocean current': return <FaRegLifeRing />;
        case 'tsunami': return <MdOutlineWarning />;
        default: return <FaExclamationTriangle />;
    }
};

const EarlyWarningPage = () => {
    const mapRef = useRef(null);
    const alertsLayerRef = useRef(null);
    const clusteredAlertsLayerRef = useRef(null);
    const [markers, setMarkers] = useState({});
    const [alerts, setAlerts] = useState([]);
    const [filteredAlerts, setFilteredAlerts] = useState([]);

    // ✅ 1. Fetch all alerts on load
    useEffect(() => {
        const loadAlerts = async () => {
            try {
                const data = await fetchAllAlerts();
                setAlerts(data);
                setFilteredAlerts(data);
            } catch (error) {
                console.error("Failed to fetch alerts:", error);
            }
        };
        loadAlerts();
    }, []);

    // ✅ 2. Init map once
    useEffect(() => {
        if (!mapRef.current) {
            mapRef.current = L.map('map').setView([22.5, 82.5], 5);
            L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; OpenStreetMap &copy; CARTO',
                maxZoom: 19
            }).addTo(mapRef.current);

            mapRef.current.setMaxBounds([[5, 68], [38, 98]]);
            mapRef.current.setMinZoom(5);

            alertsLayerRef.current = L.layerGroup().addTo(mapRef.current);
            clusteredAlertsLayerRef.current = L.markerClusterGroup().addTo(mapRef.current);
        }

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, []);

    // ✅ 3. Update markers when filteredAlerts changes
    useEffect(() => {
        renderMapMarkers(filteredAlerts);
    }, [filteredAlerts]);

    // ✅ 4. When filters change → call backend search
    const handleFilterChange = async (filters) => {
        try {
            const results = await searchAlerts(filters);
            setFilteredAlerts(results);
        } catch (error) {
            console.error("Failed to search alerts:", error);
        }
    };

    // Function to create the HTML for the Leaflet popup
    const createPopupContent = (alert) => {
        const type = alert.type.toLowerCase();
        let detailsHtml = '';

        if (type === 'cyclone') {
            detailsHtml = `
                <div class="popup-row"><strong>Wind Speed:</strong> <span>${alert.details?.wind_speed || 'N/A'} km/h</span></div>
                <div class="popup-row"><strong>Status:</strong> <span>${alert.details?.status || 'N/A'}</span></div>
            `;
        } else if (type === 'high wave') {
            detailsHtml = `
                <div class="popup-row"><strong>Issued:</strong> <span>${alert.details?.issue_date || alert.issueDate}</span></div>
            `;
        } else if (type === 'ocean current') {
            detailsHtml = `
                <div class="popup-row"><strong>Issued:</strong> <span>${alert.details?.issue_date || alert.issueDate}</span></div>
            `;
        } else if (type === 'tsunami') {
            detailsHtml = `
                <div class="popup-row"><strong>Station:</strong> <span>${alert.details?.station_real_name || 'N/A'}</span></div>
                <div class="popup-row"><strong>Status:</strong> <span>${alert.details?.status || 'N/A'}</span></div>
                <div class="popup-row"><strong>Last Report:</strong> <span>${alert.details?.raw_date || alert.issueDate}</span></div>
            `;
        }

        return `
            <div class="popup-header">
                <h3>${alert.type} Alert</h3>
                <p>${alert.district}, ${alert.state}</p>
            </div>
            <div class="popup-body">
                ${detailsHtml}
                <div class="popup-message">${alert.message}</div>
            </div>
        `;
    };

    // Helper functions for custom SVG icons
    const dotSvg = (color) => `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><circle cx="16" cy="16" r="8" fill="${color}" stroke="white" stroke-width="1.5"/><circle cx="16" cy="16" r="14" fill="none" stroke="${color}" stroke-width="2" opacity="0.6"/></svg>`;
    const radarSvg = (color) => `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><circle cx="16" cy="16" r="14" fill="none" stroke="${color}" stroke-width="0.75" opacity="0.4"/><circle cx="16" cy="16" r="9" fill="none" stroke="${color}" stroke-width="0.75" opacity="0.4"/><circle cx="16" cy="16" r="4" fill="none" stroke="${color}" stroke-width="0.75" opacity="0.4"/><path class="radar-sweep-line" d="M 16 16 L 16 2 A 14 14 0 0 1 25.928 6.072 Z" fill="${color}" opacity="0.5"/></svg>`;

    // Renders markers on the map
    const renderMapMarkers = (alertsToRender) => {
        if (!mapRef.current) return;

        alertsLayerRef.current.clearLayers();
        clusteredAlertsLayerRef.current.clearLayers();
        const newMarkers = {};

        alertsToRender.forEach(alert => {
            const alertColor = alert.color.toLowerCase();
            const colorVar = alertColor === 'red' ? '#e74c3c' :
                             alertColor === 'orange' ? '#e67e22' :
                             alertColor === 'yellow' ? '#f1c40f' : '#2ecc71';

            let customIcon;
            if (alert.type.toLowerCase() === 'tsunami') {
                customIcon = L.divIcon({ className: 'radar-marker', html: radarSvg(colorVar), iconSize: [34, 34], iconAnchor: [17, 17] });
            } else {
                customIcon = L.divIcon({ className: `warning-marker color-${alertColor}`, html: dotSvg(colorVar), iconSize: [36, 36], iconAnchor: [18, 18] });
            }

            const marker = L.marker([alert.latitude, alert.longitude], { icon: customIcon });
            marker.bindPopup(createPopupContent(alert));

            if (alertColor === 'green') {
                clusteredAlertsLayerRef.current.addLayer(marker);
            } else {
                alertsLayerRef.current.addLayer(marker);
            }

            newMarkers[alert._id] = marker;
        });

        setMarkers(newMarkers);
    };

    const handleAlertItemClick = (alertId) => {
        const marker = markers[alertId];
        if (marker) {
            mapRef.current.flyTo([marker.getLatLng().lat, marker.getLatLng().lng], 12);
            marker.openPopup();
        }
    };

    return (
        <div className="dashboard-content-wrapper">
            <div id="main-content">
                <div id="top-bar">
                    <h1>Early Warning System</h1>
                    <div className="header-controls">
                        <a href="#" className="icon-btn user-icon" title="User Profile">
                            <FaUser />
                        </a>
                    </div>
                </div>
                <div id="dashboard-container">
                    <div id="map-container">
                        <div id="map"></div>
                    </div>
                    <aside id="right-sidebar">
                        <AlertFilter onFilterChange={handleFilterChange} />
                        <div className="info-card">
                            <h2>Live Alerts</h2>
                            <div className="alert-summary">
                                <div className="alert-count">{filteredAlerts.length}</div>
                                <p>Active Incidents</p>
                            </div>
                            <AlertList alerts={filteredAlerts} onAlertClick={handleAlertItemClick} getAlertIcon={getAlertIcon} />
                        </div>
                        <div className="info-card">
                            <h2>Support Contacts</h2>
                            <div className="contact-list">
                                <div className="contact-list-item">
                                    <div className="alert-icon" style={{ backgroundColor: '#3498DB' }}><FaAmbulance /></div>
                                    <div className="contact-details"><h4>Medical Emergency</h4><p>108</p></div>
                                </div>
                                <div className="contact-list-item">
                                    <div className="alert-icon" style={{ backgroundColor: '#9B59B6' }}><FaShieldAlt /></div>
                                    <div className="contact-details"><h4>Disaster Response (NDRF)</h4><p>1078</p></div>
                                </div>
                                <div className="contact-list-item">
                                    <div className="alert-icon" style={{ backgroundColor: '#E74C3C' }}><FaPhone /></div>
                                    <div className="contact-details"><h4>Police Assistance</h4><p>100 / 112</p></div>
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
};

export default EarlyWarningPage;