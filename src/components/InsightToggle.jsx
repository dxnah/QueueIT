// InsightToggle.jsx

import { useState } from "react";
import '../styles/insights.css';

function InsightToggle({ insights }) {
  const [showInsights, setShowInsights] = useState(false);

  const getResultClass = (result) => {
    if (result === 'Urgent' || result === 'High') return 'insights-result-urgent';
    if (result === 'Stable' || result === 'None') return 'insights-result-stable';
    return 'insights-result-warning';
  };

  return (
    <section className="insights-container">
      <div className="insights-header">
        <h3 className="insights-title">💡 ML Insights</h3>
        <button
          className={showInsights ? 'insights-btn insights-btn-hide' : 'insights-btn insights-btn-show'}
          onClick={() => setShowInsights(!showInsights)}>
          {showInsights ? 'Hide Insights' : 'Show Insights'}
        </button>
      </div>

      {showInsights && (
        <div className="insights-box">
          <ul className="insights-list">
            {insights.map((item) => (
              <li key={item.id} className="insights-list-item">
                <span className="insights-item-label">{item.label}:</span>
                <span className={`insights-item-result ${getResultClass(item.result)}`}>
                  {item.result}
                </span>
              </li>
            ))}
          </ul>
          <p className="insights-recommendation">
            🤖 ML Recommendation: Review high-risk items immediately.
          </p>
        </div>
      )}
    </section>
  );
}

export default InsightToggle;