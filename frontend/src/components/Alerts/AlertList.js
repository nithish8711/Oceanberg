import React from 'react';

const AlertList = ({ alerts, onAlertClick, getAlertIcon }) => {
    return (
        <div className="alert-list">
            {alerts.length === 0 ? (
                <p className="no-alerts-message">No alerts found for the selected filters.</p>
            ) : (
                alerts.map(alert => (
                    <div
                        key={alert._id} // ✅ Use _id for consistency with map logic
                        className={`alert-list-item color-${alert.color?.toLowerCase()}`}
                        onClick={() => onAlertClick(alert._id)} // ✅ Use _id for consistency
                    >
                        <div className="alert-icon">{getAlertIcon(alert.type)}</div>
                        <div className="alert-details">
                            <h4 style={{ textTransform: 'capitalize' }}>{alert.type}</h4>
                            <p style={{ textTransform: 'capitalize' }}>
                                {alert.district?.toLowerCase()}, {alert.state?.toLowerCase()}
                            </p>
                            <small>
                                {new Date(alert.issueDate).toLocaleString()}
                            </small>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

export default AlertList;