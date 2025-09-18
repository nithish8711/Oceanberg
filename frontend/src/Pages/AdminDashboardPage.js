import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Circle, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './AdminDashboardPage.css';
import {
  FaExclamationTriangle, FaChartPie, FaClipboardList, FaUtensils, FaFirstAid,
  FaLifeRing, FaTint, FaHome, FaHammer, FaMapMarkerAlt, FaTimes
} from 'react-icons/fa';

const locationCoords = {
  'Mylapore': [13.033, 80.266],
  'Kodambakkam': [13.061, 80.228],
  'Tambaram': [12.923, 80.117],
  'Adyar': [12.99, 80.25],
  'T Nagar': [13.041, 80.244],
  'Velachery': [12.986, 80.219],
  'Madipakkam': [12.985, 80.203],
};

// simulate fetching reports
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
      for (let j = 0; j < Math.min(categoryCounts[cat], 2); j++) {
        contributingReports.push(`Need for ${cat} in ${subLocation}.`);
      }
    }
    data.push({
      id: '_' + Math.random().toString(36).substr(2, 9),
      type, district, state, subLocation,
      location: { lat: latLong[0], long: latLong[1] },
      intensity, reportCount, contributingReports, categoryCounts, description
    });
  }
  return data;
};

const getCategoryIcon = (category) => {
  switch (category) {
    case 'Food': return <FaUtensils />;
    case 'Medical': return <FaFirstAid />;
    case 'Rescue': return <FaLifeRing />;
    case 'Water': return <FaTint />;
    case 'Shelter': return <FaHome />;
    case 'Infrastructure': return <FaHammer />;
    default: return null;
  }
};

const getIcon = (intensity, isSelected) => {
  let color = intensity === 'high' ? '#f44336' : intensity === 'medium' ? '#ff9800' : '#4caf50';
  let size = isSelected ? 20 : 14;
  return new L.DivIcon({
    className: `custom-marker ${intensity}`,
    html: `<div style="background-color:${color}; width:${size}px; height:${size}px; border-radius:50%; box-shadow:0 0 10px ${color}; border:2px solid rgba(255,255,255,0.2)"></div>`,
    iconSize: [size, size],
  });
};

const aggregateReports = (reports) => {
  const weight = { low: 1, medium: 2, high: 3 };
  const grouped = {};
  reports.forEach(r => {
    const key = r.subLocation || 'Unknown';
    if (!grouped[key]) {
      grouped[key] = {
        subLocation: key,
        lat: r.location.lat,
        lng: r.location.long,
        totalReports: 0,
        weightedSum: 0,
        reportCountSum: 0,
        types: {},
        individualReports: [],
      };
    }
    grouped[key].totalReports += r.reportCount;
    grouped[key].weightedSum += (weight[r.intensity] || 1) * r.reportCount;
    grouped[key].reportCountSum += r.reportCount;
    grouped[key].types[r.type] = (grouped[key].types[r.type] || 0) + r.reportCount;
    grouped[key].individualReports.push(r);
  });

  return Object.values(grouped).map(g => {
    const avg = g.weightedSum / (g.reportCountSum || 1);
    const overallIntensity = avg >= 2.5 ? 'high' : avg >= 1.5 ? 'medium' : 'low';
    const topType = Object.entries(g.types).sort((a, b) => b[1] - a[1])[0]?.[0] || '';

    const categoryCounts = g.individualReports.reduce((acc, r) => {
      Object.entries(r.categoryCounts).forEach(([cat, count]) => {
        acc[cat] = (acc[cat] || 0) + count;
      });
      return acc;
    }, {});

    const highRiskDescription = `Multiple reports of ${topType || 'various incidents'} in ${g.subLocation} indicate a high level of distress, with immediate needs for ${Object.keys(categoryCounts).filter(k => categoryCounts[k] > 0).join(', ') || 'relief efforts'}.`;

    return {
      subLocation: g.subLocation,
      lat: g.lat,
      lng: g.lng,
      totalReports: g.totalReports,
      averageIntensityVal: avg,
      overallIntensity,
      topType,
      categoryCounts,
      contributingReports: g.individualReports.flatMap(r => r.contributingReports).slice(0, 5),
      description: highRiskDescription
    };
  });
};

const AdminDashboardPage = () => {
  const [reports, setReports] = useState([]);
  const [circleCenter, setCircleCenter] = useState([13.0827, 80.2707]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [aggregatedLocations, setAggregatedLocations] = useState([]);
  const [visibleHighRisk, setVisibleHighRisk] = useState([]);
  const mapRef = useRef(null);

  useEffect(() => {
    const data = fetchProcessedReports();
    setReports(data);
    if (data.length > 0) {
      const avgLat = data.reduce((sum, r) => sum + r.location.lat, 0) / data.length;
      const avgLng = data.reduce((sum, r) => sum + r.location.long, 0) / data.length;
      setCircleCenter([avgLat, avgLng]);
    }
  }, []);

  useEffect(() => {
    setAggregatedLocations(aggregateReports(reports));
  }, [reports]);

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.invalidateSize();
    }
  }, [selectedReport]);

  const updateVisibleHighRisk = (mapInstance = mapRef.current) => {
    if (!mapInstance) return setVisibleHighRisk([]);
    const bounds = mapInstance.getBounds();
    const visible = aggregatedLocations.filter(loc => loc.overallIntensity === 'high' && bounds.contains([loc.lat, loc.lng]));
    setVisibleHighRisk(visible);
  };

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const handler = () => updateVisibleHighRisk(map);
    handler();
    map.on('moveend', handler);
    map.on('zoomend', handler);
    return () => {
      map.off('moveend', handler);
      map.off('zoomend', handler);
    };
  }, [aggregatedLocations]);

  return (
    <div className="dashboard-content-wrapper">
      {/* Header container for both title and high-risk panel */}
      <div className="header-container">
        <div className="header-titles">
          <h2 className="dashboard-title">Oceanberg Insights</h2>
          <p className="dashboard-subtitle">Real-time Social Media Post Visualization</p>
        </div>
        <div className="high-risk-panel-header">
          <h3><FaExclamationTriangle /> High Risk Areas</h3>
          {visibleHighRisk.length > 0 ? (
            <ul className="reports-list">
              {visibleHighRisk.map(loc => (
                <li key={loc.subLocation} className="report-item intensity-high" onClick={() => {
                  setSelectedReport(loc);
                  mapRef.current.flyTo([loc.lat, loc.lng], mapRef.current.getZoom());
                }}>
                  <div className="report-header">
                    <span className="report-location">{loc.subLocation}</span>
                    <span className="report-count">{loc.totalReports} reports</span>
                  </div>
                  <div className="report-details">
                    <p>{loc.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : <p className="no-risk-text">No high-risk areas in view</p>}
        </div>
      </div>

      {/* Map and Info Panel */}
      <div className="map-split-container">
        <div className="map-container">
          <MapContainer center={circleCenter} zoom={11} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}
            whenCreated={(mapInstance) => { mapRef.current = mapInstance; }}
          >
            <TileLayer
              attribution='&copy; OpenStreetMap contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Circle center={circleCenter} radius={15000} pathOptions={{ color: 'red', fillColor: 'red', fillOpacity: 0.06 }} />
            {aggregatedLocations.map((loc) => (
              <Marker
                key={loc.subLocation}
                position={[loc.lat, loc.lng]}
                icon={getIcon(loc.overallIntensity, selectedReport?.subLocation === loc.subLocation)}
                eventHandlers={{
                  click: () => {
                    setSelectedReport(loc);
                  }
                }}
              >
                <Tooltip permanent direction="top" offset={[0, -10]}>
                  {loc.subLocation}
                </Tooltip>
              </Marker>
            ))}
          </MapContainer>
        </div>
        {selectedReport && (
          <div className="info-panel">
            <div className="info-panel-header">
              <h3>{selectedReport.subLocation}</h3>
              <button className="close-button" onClick={() => setSelectedReport(null)}>
                <FaTimes />
              </button>
            </div>
            <span className={`intensity-badge ${selectedReport.overallIntensity}`}>
              {selectedReport.overallIntensity.toUpperCase()}
            </span>
            <div className="stats-grid">
              <div className="stat"><FaMapMarkerAlt /> Chennai, Tamil Nadu</div>
              <div className="stat"><FaClipboardList /> Reports: {selectedReport.totalReports}</div>
            </div>
            <div className="popup-section">
              <h4>Description</h4>
              <p>{selectedReport.description}</p>
            </div>
            {Object.values(selectedReport.categoryCounts).some(c => c > 0) && (
              <div className="popup-section">
                <h4><FaChartPie /> Needs</h4>
                <div className="category-badges">
                  {Object.entries(selectedReport.categoryCounts).map(([cat, count]) =>
                    count > 0 && <span key={cat} className="category-badge">{getCategoryIcon(cat)} {cat}: {count}</span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardPage;