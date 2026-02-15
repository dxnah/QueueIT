// InsightToggle.jsx

import { useState } from "react";

function InsightToggle({ insights }) {
  const [showInsights, setShowInsights] = useState(false);

  return (
    <section style={styles.container}>
      <div style={styles.headerRow}>
        <h3 style={styles.title}>💡 ML Insights</h3>
        <button
          style={showInsights ? styles.btnHide : styles.btnShow}
          onClick={() => setShowInsights(!showInsights)}>
          {showInsights ? 'Hide Insights' : 'Show Insights'}
        </button>
      </div>

      {showInsights && (
        <div style={styles.insightBox}>
          <ul style={styles.list}>
            {insights.map((item) => (
              <li key={item.id} style={styles.listItem}>
                <span style={styles.itemLabel}>{item.label}:</span>
                <span style={{
                  ...styles.itemResult,
                  color: item.result === 'Urgent' || item.result === 'High'
                    ? '#c62828'
                    : item.result === 'Stable' || item.result === 'None'
                    ? '#2e7d32'
                    : '#f57f17',
                }}>
                  {item.result}
                </span>
              </li>
            ))}
          </ul>
          <p style={styles.recommendation}>
            🤖 ML Recommendation: Review high-risk items immediately.
          </p>
        </div>
      )}
    </section>
  );
}

const styles = {
  container: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    marginBottom: '30px',
    borderTop: '4px solid #26a69a',
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: '16px',
    color: '#333',
    fontWeight: '600',
    margin: '0',
  },
  btnShow: {
    backgroundColor: '#26a69a',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600',
  },
  btnHide: {
    backgroundColor: '#fff',
    color: '#26a69a',
    border: '2px solid #26a69a',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600',
  },
  insightBox: {
    marginTop: '16px',
    padding: '15px',
    backgroundColor: '#f8f8f8',
    borderRadius: '6px',
  },
  list: {
    listStyle: 'none',
    padding: '0',
    margin: '0 0 12px 0',
  },
  listItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 0',
    borderBottom: '1px solid #eee',
    fontSize: '13px',
  },
  itemLabel: {
    color: '#666',
    fontWeight: '500',
  },
  itemResult: {
    fontWeight: '700',
  },
  recommendation: {
    fontSize: '13px',
    color: '#555',
    margin: '0',
    fontStyle: 'italic',
    backgroundColor: '#fff8e1',
    padding: '10px',
    borderRadius: '6px',
    borderLeft: '3px solid #f57f17',
  },
};

export default InsightToggle;