// PredictionCard.jsx

function PredictionCard({ label, result, confidence, resultColor }) {

  const getConfidenceClass = (conf) => {
    if (conf >= 80) return 'high';
    if (conf >= 50) return 'medium';
    return 'low';
  };

  return (
    <section className="card" style={styles.card}>
      <h3 style={styles.label}>{label}</h3>
      <p style={{ ...styles.result, color: resultColor || '#333' }}>
        Prediction: <strong>{result}</strong>
      </p>
      {confidence !== undefined && (
        <p className={getConfidenceClass(confidence)} style={styles.confidence}>
          Confidence: <strong>{confidence}%</strong>
        </p>
      )}
    </section>
  );
}

const styles = {
  card: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    padding: '16px 20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    borderLeft: '4px solid #26a69a',
    minWidth: '180px',
    flex: '1 1 0',
  },
  label: {
    fontSize: '12px',
    color: '#888',
    margin: '0 0 8px 0',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  result: {
    fontSize: '14px',
    margin: '0 0 5px 0',
    color: '#333',
  },
  confidence: {
    fontSize: '13px',
    margin: '0',
  },
};

export default PredictionCard;