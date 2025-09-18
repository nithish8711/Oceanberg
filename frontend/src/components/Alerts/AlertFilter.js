import React, { useState } from 'react';
import { FaSearch } from 'react-icons/fa';

const AlertFilter = ({ onFilterChange }) => {
    const [type, setType] = useState('');
    const [location, setLocation] = useState('');
    const [color, setColor] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const handleApplyFilters = () => {
        onFilterChange({
            type,
            districtOrState: location,
            color,
            // ✅ Send date strings directly, without ISO conversion
            startDate: startDate,
            endDate: endDate
        });
    };

    return (
        <div className="filter-card info-card">
            <h2>Filter Alerts</h2>
            <div className="filter-controls">
                {/* Type */}
                <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="filter-select"
                >
                    <option value="">All Types</option>
                    <option value="Cyclone">Cyclone</option>
                    <option value="High Wave">High Wave</option>
                    <option value="Ocean Current">Ocean Current</option>
                    <option value="Tsunami">Tsunami</option>
                </select>

                {/* Location */}
                <input
                    type="text"
                    placeholder="District or State"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="filter-input"
                />

                {/* Color */}
                <select
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="filter-select"
                >
                    <option value="">All Colors</option>
                    <option value="RED">Red</option>
                    <option value="ORANGE">Orange</option>
                    <option value="YELLOW">Yellow</option>
                    <option value="GREEN">Green</option>
                </select>

                {/* Date Range */}
                <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="filter-input"
                    title="Start Date"
                />
                <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="filter-input"
                    title="End Date"
                />

                {/* Search Button */}
                <button onClick={handleApplyFilters} className="filter-button">
                    <FaSearch /> Search
                </button>
            </div>
        </div>
    );
};

export default AlertFilter;