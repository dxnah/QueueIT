// src/pages/DemandForecast.jsx

import { useState, useEffect, useRef } from 'react';
import {
  BarChart, Bar, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ComposedChart, Line,
} from 'recharts';
import TopBar from '../components/TopBar';
import Sidebar from '../components/Sidebar';
import { PEAK_MONTHS } from '../data/dashboardData';
import { MONTHS } from '../data/vaccineConstants';
import { mlAPI } from '../services/api';
import '../styles/dashboard.css';
import '../styles/analytics.css';

const MONTH_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

// ─── Sub-components ───────────────────────────────────────────────────────────
const StatCard = ({ icon, label, value, note, borderColor, valueColor, sub }) => (
  <div style={{
    flex:'1 1 0', minWidth:0, background:'white', borderRadius:'12px',
    padding:'20px 18px', textAlign:'center', borderTop:`4px solid ${borderColor}`,
    boxShadow:'0 2px 4px rgba(0,0,0,0.06),0 6px 16px rgba(0,0,0,0.10)',
    transition:'transform 0.2s,box-shadow 0.2s',
  }}
    onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-3px)';e.currentTarget.style.boxShadow='0 6px 16px rgba(0,0,0,0.12)';}}
    onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow='0 2px 4px rgba(0,0,0,0.06),0 6px 16px rgba(0,0,0,0.10)';}}
  >
    <p style={{margin:'0 0 8px',fontSize:'11px',color:'#888',textTransform:'uppercase',letterSpacing:'0.6px',fontWeight:'600'}}>{icon} {label}</p>
    <p style={{margin:'0 0 4px',fontSize:'28px',fontWeight:'800',color:valueColor||borderColor,lineHeight:1}}>{value}</p>
    {sub && <p style={{margin:'0 0 4px',fontSize:'12px',color:'#555',fontWeight:'600'}}>{sub}</p>}
    <p style={{margin:0,fontSize:'11px',color:'#bbb',fontStyle:'italic'}}>{note}</p>
  </div>
);

const Skeleton = ({h=80}) => (
  <div style={{height:h,borderRadius:10,background:'linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%)',backgroundSize:'200% 100%',animation:'vf-shimmer 1.4s infinite'}}/>
);

const CustomTooltip = ({active,payload,label}) => {
  if (!active||!payload?.length) return null;
  return (
    <div style={{background:'white',border:'1px solid #e0e0e0',borderRadius:10,padding:'10px 14px',boxShadow:'0 4px 16px rgba(0,0,0,0.12)',fontSize:12}}>
      <p style={{margin:'0 0 6px',fontWeight:700,color:'#333'}}>{label}</p>
      {payload.map((p,i)=>(
        <p key={i} style={{margin:'2px 0',color:p.color,fontWeight:600}}>
          {p.name}: <strong>{typeof p.value==='number'?p.value.toLocaleString():p.value}</strong> doses
        </p>
      ))}
    </div>
  );
};

// ─── Field row helper for the actuals form ────────────────────────────────────
const FormField = ({ label, hint, children }) => (
  <div style={{marginBottom:14}}>
    <label style={{display:'block',fontSize:12,fontWeight:700,color:'#444',marginBottom:3}}>{label}</label>
    {hint && <p style={{margin:'0 0 5px',fontSize:11,color:'#aaa',fontStyle:'italic'}}>{hint}</p>}
    {children}
  </div>
);

const inputStyle = {
  width:'100%', padding:'8px 11px', borderRadius:8,
  border:'1.5px solid #e0e0e0', fontSize:13, color:'#333',
  background:'white', boxSizing:'border-box', outline:'none',
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const DemandForecast = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab,     setActiveTab]     = useState('arv');
  const [activeView,    setActiveView]    = useState('table');
  const [selectedYear,  setSelectedYear]  = useState(new Date().getFullYear());
  const [yearDropOpen,  setYearDropOpen]  = useState(false);

  // Predict
  const [predictYear,   setPredictYear]   = useState(new Date().getFullYear());
  const [predictMonth,  setPredictMonth]  = useState(new Date().getMonth()+1);
  const [predictResult, setPredictResult] = useState(null);
  const [predicting,    setPredicting]    = useState(false);
  const [predictError,  setPredictError]  = useState(null);

  // ML data
  const [availableYears, setAvailableYears] = useState([]);
  const [yearData,       setYearData]       = useState(null);
  const [yearlySummary,  setYearlySummary]  = useState([]);
  const [metrics,        setMetrics]        = useState(null);
  const [mlLoading,      setMlLoading]      = useState(true);
  const [yearLoading,    setYearLoading]    = useState(false);
  const [mlError,        setMlError]        = useState(null);

  // Actuals form state
  const currentYear  = new Date().getFullYear();
  const currentMonth = new Date().getMonth(); // 0-indexed — last month
  const defaultActualYear  = currentMonth === 0 ? currentYear - 1 : currentYear;
  const defaultActualMonth = currentMonth === 0 ? 12 : currentMonth; // last completed month

  const [actualForm, setActualForm] = useState({
    year:  defaultActualYear,
    month: defaultActualMonth,
    arv_doses_administered:        '',
    bite_cases_total:              '',
    category_1_cases:              '',
    category_2_cases:              '',
    category_3_cases:              '',
    temperature_c:                 '',
    rainfall_mm:                   '',
    humidity_percent:              '',
    heat_index_c:                  '',
    pep_completion_rate:           '',
    rig_availability_rate:         '',
    stockout_flag:                 '0',
    procurement_delay_days:        '0',
    dog_vaccination_campaign_flag: '0',
    extreme_weather_flag:          '0',
    holiday_season_flag:           '0',
    school_vacation_flag:          '0',
  });
  const [submitting,    setSubmitting]    = useState(false);
  const [submitResult,  setSubmitResult]  = useState(null); // {success, message, retraining}
  const [submitError,   setSubmitError]   = useState(null);
  const [retrainStatus, setRetrainStatus] = useState(null);

const hasPredicted = useRef(false);

// Auto-predict when year/month change after first prediction
useEffect(() => {
  if (hasPredicted.current) {
    handlePredict();
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [predictYear, predictMonth]);

  // Initial load
  useEffect(()=>{
    const init = async () => {
      try {
        setMlLoading(true);
        const [yrsRes, summaryRes, metricsRes] = await Promise.all([
          mlAPI.getAvailableYears(),
          mlAPI.getYearlySummary(),
          mlAPI.getMetrics(),
        ]);
        const yrs = yrsRes.years||[];
        setAvailableYears(yrs);
        setYearlySummary(summaryRes);
        setMetrics(metricsRes);
        const now = new Date().getFullYear();
        setSelectedYear(yrs.includes(now)?now:yrs[yrs.length-1]||now);
      } catch(e){ setMlError(e.message); }
      finally { setMlLoading(false); }
    };
    init();
  },[]);

  // Load year data
  useEffect(()=>{
    if (!selectedYear) return;
    const load = async () => {
      try {
        setYearLoading(true); setMlError(null);
        const data = await mlAPI.getForecastByYear(selectedYear);
        setYearData(data);
      } catch(e){ setMlError(e.message); setYearData(null); }
      finally { setYearLoading(false); }
    };
    load();
  },[selectedYear]);

  // Poll retrain status after submission
useEffect(() => {
    if (!submitResult?.retraining) return;
 
    let attempts = 0;
    const MAX_ATTEMPTS = 18;   // 18 × 5s = 90 seconds max
 
    const poll = setInterval(async () => {
      attempts++;
      try {
        const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
 
        // 1. Check if retrain finished (R² will have changed)
        const res = await fetch(`${BASE_URL}/api/ml/retrain/status/`);
        if (!res.ok) return;
        const status = await res.json();
 
        // 2. Only act if R² is now positive (i.e. retrain produced a good model)
        if (status.test_r2 !== null && status.test_r2 > 0) {
          setRetrainStatus(status);
 
          // 3. Refresh all ML data so header badges + charts update
          const [newMetrics, newSummary, newYearData] = await Promise.all([
            mlAPI.getMetrics(),
            mlAPI.getYearlySummary(),
            mlAPI.getForecastByYear(selectedYear),
          ]);
          setMetrics(newMetrics);
          setYearlySummary(newSummary);
          setYearData(newYearData);
 
          // 4. If a prediction is shown, re-run it so model_info badges update
          if (hasPredicted.current) {
            handlePredict();
          }
 
          clearInterval(poll);
        }
 
        if (attempts >= MAX_ATTEMPTS) {
          console.warn('Retrain poll timed out after 90s');
          clearInterval(poll);
        }
      } catch (e) {
        // silent — backend may still be retraining
      }
    }, 5000);
 
    return () => clearInterval(poll);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submitResult]);
 

  // Predict handler
  const handlePredict = async () => {
    try {
      setPredicting(true); setPredictError(null); setPredictResult(null);
      const result = await mlAPI.predict(predictYear, predictMonth);
      setPredictResult(result);
      hasPredicted.current = true;
    } catch(e){ setPredictError(e.message); }
    finally { setPredicting(false); }
  };

  // Submit actuals handler
  const handleSubmitActuals = async (e) => {
    e.preventDefault();
    setSubmitting(true); setSubmitError(null); setSubmitResult(null); setRetrainStatus(null);

    // Validate required fields
    const required = ['arv_doses_administered','bite_cases_total','category_1_cases',
      'category_2_cases','category_3_cases','temperature_c','rainfall_mm',
      'humidity_percent','heat_index_c','pep_completion_rate','rig_availability_rate'];
    const missing = required.filter(f => actualForm[f] === '' || actualForm[f] === null);
    if (missing.length > 0) {
      setSubmitError(`Please fill in: ${missing.map(f=>f.replace(/_/g,' ')).join(', ')}`);
      setSubmitting(false);
      return;
    }

    try {
      const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
      const payload = {
        year:  parseInt(actualForm.year),
        month: parseInt(actualForm.month),
        arv_doses_administered:        parseInt(actualForm.arv_doses_administered),
        bite_cases_total:              parseInt(actualForm.bite_cases_total),
        category_1_cases:              parseInt(actualForm.category_1_cases),
        category_2_cases:              parseInt(actualForm.category_2_cases),
        category_3_cases:              parseInt(actualForm.category_3_cases),
        temperature_c:                 parseFloat(actualForm.temperature_c),
        rainfall_mm:                   parseFloat(actualForm.rainfall_mm),
        humidity_percent:              parseFloat(actualForm.humidity_percent),
        heat_index_c:                  parseFloat(actualForm.heat_index_c),
        pep_completion_rate:           parseFloat(actualForm.pep_completion_rate),
        rig_availability_rate:         parseFloat(actualForm.rig_availability_rate),
        stockout_flag:                 parseInt(actualForm.stockout_flag),
        procurement_delay_days:        parseInt(actualForm.procurement_delay_days),
        dog_vaccination_campaign_flag: parseInt(actualForm.dog_vaccination_campaign_flag),
        extreme_weather_flag:          parseInt(actualForm.extreme_weather_flag),
        holiday_season_flag:           parseInt(actualForm.holiday_season_flag),
        school_vacation_flag:          parseInt(actualForm.school_vacation_flag),
      };

      const res = await fetch(`${BASE_URL}/api/ml/actuals/`, {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || `HTTP ${res.status}`);
      }

      const result = await res.json();
      setSubmitResult(result);
    } catch(e) {
      setSubmitError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const setField = (key, val) => setActualForm(prev => ({...prev, [key]: val}));

  const months      = yearData?.months||[];
  const yearSummary = yearData?.summary||null;

  const barData = months.map(r=>({
    name: MONTH_SHORT[r.month-1],
    'Predicted':   r.predicted,
    'Actual':      r.actual,
    'Recommended': r.recommended,
  }));

  const lineData = yearlySummary.map(r=>({
    year:          r.year,
    'Predicted':   r.totalPredicted,
    'Actual':      r.totalActual,
    'Recommended': r.totalRecommended,
  }));

  const btnStyle = (active) => ({
    display:'inline-flex',alignItems:'center',gap:5,padding:'7px 14px',borderRadius:8,
    fontSize:13,fontWeight:600,cursor:'pointer',border:'1.5px solid',transition:'all 0.18s',
    background:active?'#26a69a':'white', color:active?'white':'#555',
    borderColor:active?'#26a69a':'#ddd',
    boxShadow:active?'0 2px 8px rgba(38,166,154,0.3)':'0 1px 3px rgba(0,0,0,0.08)',
  });

  const flagSelect = (key) => (
    <select value={actualForm[key]} onChange={e=>setField(key, e.target.value)}
      style={{...inputStyle, cursor:'pointer'}}>
      <option value="0">No</option>
      <option value="1">Yes</option>
    </select>
  );

    // 12-month trend from real API calls
  const [trendData,    setTrendData]    = useState([]);
  const [trendLoading, setTrendLoading] = useState(false);

  // Fetch all 12 months from backend whenever a prediction exists
  useEffect(() => {
    if (!predictResult) return;
    const fetchTrend = async () => {
      setTrendLoading(true);
      try {
        const results = await Promise.all(
          MONTHS.map((_, i) => mlAPI.predict(predictResult.input.year, i + 1))
        );
        setTrendData(results.map((r, i) => ({
          name:        MONTH_SHORT[i],
          Predicted:   r.prediction.predicted_doses,
          Recommended: r.prediction.recommended_order,
          isPeak:      PEAK_MONTHS.includes(MONTHS[i]),
          isSelected:  i + 1 === predictResult.input.month,
        })));
      } catch(e) {
        console.error('Trend fetch failed:', e);
      } finally {
        setTrendLoading(false);
      }
    };
    fetchTrend();
  }, [predictResult]);

  return (
    <div className="dashboard-container">
      <style>{`@keyframes vf-shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}`}</style>
      <button className="mobile-menu-toggle" onClick={()=>setIsMobileMenuOpen(!isMobileMenuOpen)}>☰</button>
      <Sidebar isMobileMenuOpen={isMobileMenuOpen} onMenuClose={()=>setIsMobileMenuOpen(false)}/>
      {isMobileMenuOpen&&<div className="overlay" onClick={()=>setIsMobileMenuOpen(false)}/>}

      <section className="main-wrapper">
        <TopBar/>
        <main className="main-content">

          {/* Header */}
          <header style={{marginBottom:24}}>
            <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',flexWrap:'wrap',gap:12}}>
              <div>
                <h1 className="dashboard-heading">🤖 Demand Forecast</h1>
                <p className="dashboard-subheading">ML-powered ARV dose predictions and restock planning</p>
              </div>
                {(metrics || predictResult)&&(
                  <div style={{display:'flex',gap:8,flexWrap:'wrap',alignItems:'center'}}>
                    {/* Show a subtle "live" badge when prediction is active */}
                    {predictResult && (
                      <span style={{fontSize:10,background:'#e0f7f4',color:'#26a69a',padding:'2px 8px',
                        borderRadius:20,fontWeight:700,border:'1px solid #b2dfdb'}}>
                        ⚡ LIVE
                      </span>
                    )}
                    {(() => {
                        // Compute adjusted metrics based on prediction horizon (same logic as confidence card)
                        const baseR2   = predictResult?.model_info?.test_r2   ?? metrics?.test_metrics?.R2;
                        const baseMape = parseFloat(predictResult?.model_info?.test_mape ?? metrics?.test_metrics?.MAPE_pct);
                        const baseMae  = parseFloat(predictResult?.model_info?.test_mae  ?? metrics?.test_metrics?.MAE);

                        let displayR2   = baseR2;
                        let displayMape = baseMape;
                        let displayMae  = baseMae;

                        if (predictResult) {
                          const now         = new Date();
                          const monthsAhead = (predictResult.input.year - now.getFullYear()) * 12
                                            + (predictResult.input.month - (now.getMonth() + 1));
                          const ahead = Math.max(0, monthsAhead);

                          displayMape = Math.min(parseFloat((baseMape + ahead * 0.8).toFixed(2)), 60);
                          displayR2   = Math.max(0, parseFloat((baseR2  - ahead * 0.008).toFixed(4)));
                          displayMae  = Math.round(baseMae + ahead * 1.5); // ~1.5 doses wider per month ahead
                        }

                        return [
                          {label:'Model', value: predictResult?.model_info?.model_name ?? metrics?.model_name,  color:'#26a69a'},
                          {label:'R²',    value: displayR2,                                                      color:'#2e7d32'},
                          {label:'MAPE',  value: `${displayMape}%`,                                              color:'#f57f17'},
                          {label:'MAE',   value: `±${displayMae} doses`,                                         color:'#5c6bc0'},
                        ];
                      })().map(({label,value,color})=>(
                    <div key={label} style={{display:'inline-flex',alignItems:'center',gap:5,background:`${color}15`,border:`1.5px solid ${color}40`,borderRadius:20,padding:'4px 12px'}}>
                      <span style={{fontSize:10,color:'#888',fontWeight:600}}>{label}</span>
                      <span style={{fontSize:12,color,fontWeight:800}}>{value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </header>

          {mlError&&(
            <div style={{marginBottom:16,padding:'12px 18px',background:'#ffebee',borderRadius:10,border:'1px solid #ef9a9a',fontSize:13,color:'#c62828',fontWeight:600}}>
              ⚠️ {mlError}
            </div>
          )}

          {/* Tabs */}
          <div style={{display:'flex',gap:8,marginBottom:20,flexWrap:'wrap',borderBottom:'2px solid #f0f0f0',paddingBottom:12}}>
            <button onClick={()=>setActiveTab('arv')}     style={btnStyle(activeTab==='arv')}>📈 ARV Demand Forecast</button>
            <button onClick={()=>setActiveTab('predict')} style={btnStyle(activeTab==='predict')}>🔮 Live Predict</button>
            <button onClick={()=>setActiveTab('actuals')} style={btnStyle(activeTab==='actuals')}>📥 Submit Monthly Data</button>
          </div>

          {/* ══ TAB: ARV FORECAST ══ */}
          {activeTab==='arv'&&(
            <>
              {mlLoading||yearLoading
                ?<div style={{display:'flex',gap:16,marginBottom:24,flexWrap:'wrap'}}>{[1,2,3,4].map(i=><div key={i} style={{flex:'1 1 0',minWidth:0}}><Skeleton h={90}/></div>)}</div>
                :yearSummary&&(
                  <div style={{display:'flex',gap:16,marginBottom:24,flexWrap:'wrap'}}>
                    <StatCard icon="📅" label="Year" value={selectedYear} note={`${months.length} months`} borderColor="#26a69a"/>
                    <StatCard icon="💉" label="Total Predicted" value={(yearSummary.total_predicted||yearSummary.totalPredicted||0).toLocaleString()} note="ARV doses forecast" borderColor="#5c6bc0" sub={`Avg ${(yearSummary.avg_per_month||yearSummary.avgPerMonth||0).toLocaleString()}/mo`}/>
                    <StatCard icon="📦" label="Recommended Order" value={(yearSummary.total_recommended||yearSummary.totalRecommended||0).toLocaleString()} note="incl. 12% safety buffer" borderColor="#f57f17"/>
                    <StatCard icon="✅" label="Model Accuracy" value={metrics?`${(metrics.test_metrics?.R2*100).toFixed(1)}%`:'—'} note={`MAE ±${metrics?.test_metrics?.MAE||'—'} doses`} borderColor="#2e7d32"/>
                  </div>
                )
              }

              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:18,flexWrap:'wrap',gap:12}}>
                <div style={{position:'relative'}}>
                  <button onClick={()=>setYearDropOpen(v=>!v)} style={btnStyle(true)}>
                    📅 {selectedYear} ▾
                  </button>
                  {yearDropOpen&&(
                    <div style={{position:'absolute',top:'110%',left:0,zIndex:999,background:'white',border:'1px solid #e0e0e0',borderRadius:10,boxShadow:'0 8px 24px rgba(0,0,0,0.14)',minWidth:140,padding:'6px 0',maxHeight:260,overflowY:'auto'}}>
                      {availableYears.map(yr=>(
                        <div key={yr} onClick={()=>{setSelectedYear(yr);setYearDropOpen(false);}}
                          style={{padding:'8px 14px',cursor:'pointer',fontSize:13,fontWeight:yr===selectedYear?700:500,background:yr===selectedYear?'#e0f7f4':'white',color:yr===selectedYear?'#26a69a':'#333'}}
                          onMouseEnter={e=>{if(yr!==selectedYear)e.currentTarget.style.background='#f5f5f5';}}
                          onMouseLeave={e=>{if(yr!==selectedYear)e.currentTarget.style.background='white';}}>
                          {yr} {yr===selectedYear?'✓':''}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div style={{display:'flex',gap:8}}>
                  {[{id:'table',label:'📋 Table'},{id:'bar',label:'📊 Bar'},{id:'line',label:'📈 Trend'}].map(v=>(
                    <button key={v.id} onClick={()=>setActiveView(v.id)} style={btnStyle(activeView===v.id)}>{v.label}</button>
                  ))}
                </div>
              </div>

              <div style={{background:'white',borderRadius:14,padding:22,boxShadow:'0 2px 6px rgba(0,0,0,0.07),0 8px 24px rgba(0,0,0,0.09)',marginBottom:28}}>
                <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:16,flexWrap:'wrap'}}>
                  <h3 style={{margin:0,fontSize:16,fontWeight:700,color:'#333'}}>🤖 ARV Dose Forecast — {selectedYear}</h3>
                  <span style={{fontSize:11,color:'#999',fontStyle:'italic',marginLeft:'auto'}}>Linear Regression · 70/15/15 chronological split</span>
                </div>
                {yearLoading
                  ?<div style={{display:'flex',flexDirection:'column',gap:10}}>{[1,2,3,4].map(i=><Skeleton key={i} h={36}/>)}</div>
                  :months.length===0
                  ?<div style={{textAlign:'center',padding:'40px 20px',color:'#999'}}>
                    <div style={{fontSize:40,marginBottom:10}}>📭</div>
                    <p style={{fontWeight:600}}>No forecast data for {selectedYear}</p>
                  </div>
                  :(
                    <>
                      {activeView==='table'&&(
                        <div style={{overflowX:'auto'}}>
                          <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
                            <thead>
                              <tr style={{background:'#26a69a',color:'white'}}>
                                {['Month','Predicted Doses','Actual (Historical)','Recommended Order','Variance','Split'].map(col=>(
                                  <th key={col} style={{padding:'10px 14px',textAlign:'left',fontWeight:700,fontSize:12,whiteSpace:'nowrap'}}>{col}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {months.map((row,i)=>{
                                const variance = row.actual>0?(((row.predicted-row.actual)/row.actual)*100).toFixed(1):null;
                                const varColor = variance===null?'#999':Math.abs(parseFloat(variance))<5?'#2e7d32':Math.abs(parseFloat(variance))<10?'#f57f17':'#e53935';
                                const splitColor={train:'#26a69a',validation:'#f57f17',test:'#5c6bc0'}[row.split]||'#999';
                                return (
                                  <tr key={row.month} style={{borderBottom:'1px solid #f0f0f0',background:i%2===0?'#fafafa':'white',transition:'background 0.15s'}}
                                    onMouseEnter={e=>e.currentTarget.style.background='#f0fffe'}
                                    onMouseLeave={e=>e.currentTarget.style.background=i%2===0?'#fafafa':'white'}>
                                    <td style={{padding:'11px 14px',fontWeight:700,color:'#333'}}>
                                      {row.monthName}
                                      {PEAK_MONTHS.includes(row.monthName)&&<span style={{marginLeft:6,fontSize:10,background:'#fff3e0',color:'#e65100',padding:'1px 6px',borderRadius:10,fontWeight:700}}>HIGH</span>}
                                    </td>
                                    <td style={{padding:'11px 14px',fontWeight:700,color:'#26a69a'}}>{row.predicted.toLocaleString()}</td>
                                    <td style={{padding:'11px 14px',color:'#555'}}>{row.actual>0?row.actual.toLocaleString():'—'}</td>
                                    <td style={{padding:'11px 14px',fontWeight:600,color:'#5c6bc0'}}>{row.recommended.toLocaleString()}</td>
                                    <td style={{padding:'11px 14px'}}>
                                      {variance!==null?<span style={{color:varColor,fontWeight:700}}>{parseFloat(variance)>=0?'+':''}{variance}%</span>:'—'}
                                    </td>
                                    <td style={{padding:'11px 14px'}}>
                                      <span style={{fontSize:10,fontWeight:700,padding:'2px 8px',borderRadius:12,background:`${splitColor}20`,color:splitColor,border:`1px solid ${splitColor}50`}}>
                                        {row.split}
                                      </span>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                            {yearSummary&&(
                              <tfoot>
                                <tr style={{background:'#f5f5f5',fontWeight:700}}>
                                  <td style={{padding:'12px 14px',color:'#333',fontSize:13}}>TOTAL / YEAR</td>
                                  <td style={{padding:'12px 14px',color:'#26a69a',fontSize:13}}>{(yearSummary.total_predicted||yearSummary.totalPredicted||0).toLocaleString()}</td>
                                  <td style={{padding:'12px 14px',color:'#555',fontSize:13}}>{(yearSummary.total_actual||yearSummary.totalActual||0).toLocaleString()}</td>
                                  <td style={{padding:'12px 14px',color:'#5c6bc0',fontSize:13}}>{(yearSummary.total_recommended||yearSummary.totalRecommended||0).toLocaleString()}</td>
                                  <td colSpan={2}/>
                                </tr>
                              </tfoot>
                            )}
                          </table>
                        </div>
                      )}
                      {activeView==='bar'&&(
                        <>
                          <p style={{margin:'0 0 16px',fontSize:12,color:'#999'}}>Monthly predicted vs actual vs recommended — {selectedYear}</p>
                          <ResponsiveContainer width="100%" height={320}>
                            <BarChart data={barData} margin={{top:5,right:20,left:0,bottom:5}}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
                              <XAxis dataKey="name" tick={{fontSize:12,fontWeight:600}}/>
                              <YAxis tick={{fontSize:11}}/>
                              <Tooltip content={<CustomTooltip/>}/>
                              <Legend wrapperStyle={{fontSize:12,paddingTop:12}}/>
                              <Bar dataKey="Predicted"   fill="#26a69a" radius={[4,4,0,0]}/>
                              <Bar dataKey="Actual"      fill="#5c6bc0" radius={[4,4,0,0]}/>
                              <Bar dataKey="Recommended" fill="#f57f17" radius={[4,4,0,0]}/>
                            </BarChart>
                          </ResponsiveContainer>
                        </>
                      )}
                      {activeView==='line'&&(
                        <>
                          <p style={{margin:'0 0 16px',fontSize:12,color:'#999'}}>Full year trend with recommended safety-stock band — {selectedYear}</p>
                          <ResponsiveContainer width="100%" height={320}>
                            <ComposedChart data={barData} margin={{top:5,right:20,left:0,bottom:5}}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
                              <XAxis dataKey="name" tick={{fontSize:12}}/>
                              <YAxis tick={{fontSize:11}}/>
                              <Tooltip content={<CustomTooltip/>}/>
                              <Legend wrapperStyle={{fontSize:12,paddingTop:12}}/>
                              <Area type="monotone" dataKey="Recommended" fill="#fff3e0" stroke="#f57f17" strokeWidth={1.5} strokeDasharray="4 2" dot={false} name="Recommended Order"/>
                              <Line type="monotone" dataKey="Actual"    stroke="#5c6bc0" strokeWidth={2} dot={{r:3}} name="Actual"/>
                              <Line type="monotone" dataKey="Predicted" stroke="#26a69a" strokeWidth={2.5} dot={{r:4}} name="ML Predicted"/>
                            </ComposedChart>
                          </ResponsiveContainer>
                        </>
                      )}
                    </>
                  )
                }
              </div>

              {yearlySummary.length>0&&(
                <div style={{background:'white',borderRadius:14,padding:22,boxShadow:'0 2px 6px rgba(0,0,0,0.07),0 8px 24px rgba(0,0,0,0.09)',marginBottom:28}}>
                  <h3 style={{margin:'0 0 16px',fontSize:16,fontWeight:700,color:'#333'}}>📊 Year-over-Year ARV Demand (All Years)</h3>
                  <ResponsiveContainer width="100%" height={280}>
                    <ComposedChart data={lineData} margin={{top:5,right:20,left:10,bottom:5}}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
                      <XAxis dataKey="year" tick={{fontSize:12}}/>
                      <YAxis tick={{fontSize:11}}/>
                      <Tooltip content={<CustomTooltip/>}/>
                      <Legend wrapperStyle={{fontSize:12,paddingTop:12}}/>
                      <Area type="monotone" dataKey="Recommended" fill="#fff3e0" stroke="#f57f17" strokeWidth={1} dot={false} name="Recommended"/>
                      <Line type="monotone" dataKey="Actual"    stroke="#5c6bc0" strokeWidth={2} dot={{r:3}} name="Actual"/>
                      <Line type="monotone" dataKey="Predicted" stroke="#26a69a" strokeWidth={2.5} dot={{r:4}} name="ML Predicted"/>
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              )}
            </>
          )}

          {/* ══ TAB: LIVE PREDICT ══ */}
          {activeTab==='predict'&&(
            <div>

              {/* Top row — form + prediction cards side by side */}
              <div style={{display:'flex',gap:20,marginBottom:20,flexWrap:'wrap'}}>

                {/* Left — form */}
                <div style={{flex:'1 1 300px',background:'white',borderRadius:14,padding:28,boxShadow:'0 2px 6px rgba(0,0,0,0.07),0 8px 24px rgba(0,0,0,0.09)',display:'flex',flexDirection:'column'}}>
                  <h3 style={{margin:'0 0 6px',fontSize:16,fontWeight:700,color:'#333'}}>🔮 Live ARV Demand Prediction</h3>
                  <p style={{margin:'0 0 22px',fontSize:12,color:'#999'}}>
                    Enter any year and month — the trained model predicts ARV dose demand automatically.
                  </p>
                  <div style={{display:'flex',gap:12,marginBottom:20,flexWrap:'wrap'}}>
                    <div style={{flex:'1 1 120px'}}>
                      <label style={{display:'block',fontSize:12,fontWeight:600,color:'#555',marginBottom:6}}>Year</label>
                      <input type="number" value={predictYear}
                        onChange={e=>setPredictYear(parseInt(e.target.value)||new Date().getFullYear())}
                        min={2010} max={2040}
                        style={{...inputStyle,fontSize:14}}
                        onFocus={e=>e.target.style.borderColor='#26a69a'}
                        onBlur={e=>e.target.style.borderColor='#e0e0e0'}/>
                    </div>
                    <div style={{flex:'1 1 120px'}}>
                      <label style={{display:'block',fontSize:12,fontWeight:600,color:'#555',marginBottom:6}}>Month</label>
                      <select value={predictMonth} onChange={e=>setPredictMonth(parseInt(e.target.value))}
                        style={{...inputStyle,fontSize:14,cursor:'pointer'}}
                        onFocus={e=>e.target.style.borderColor='#26a69a'}
                        onBlur={e=>e.target.style.borderColor='#e0e0e0'}>
                        {MONTHS.map((m,i)=><option key={m} value={i+1}>{m}</option>)}
                      </select>
                    </div>
                  </div>
                  <button onClick={handlePredict} disabled={predicting}
                    style={{width:'100%',padding:'12px',borderRadius:9,border:'none',background:predicting?'#a5d6a7':'#26a69a',color:'white',fontSize:15,fontWeight:700,cursor:predicting?'not-allowed':'pointer',transition:'background 0.2s'}}>
                    {predicting?'⏳ Predicting...':'🔮 Predict ARV Demand'}
                  </button>

                  {/* Info box below button */}
                  <div style={{marginTop:16,padding:'14px 16px',background:'#f0fffe',borderRadius:10,border:'1px solid #b2dfdb',flex:1}}>
                    <p style={{margin:'0 0 8px',fontSize:12,fontWeight:700,color:'#26a69a'}}>ℹ️ How this works</p>
                    <ul style={{margin:0,paddingLeft:16,fontSize:12,color:'#666',lineHeight:1.8}}>
                      <li>Select any year and month</li>
                      <li>The ML model estimates ARV dose demand</li>
                      <li>A 12% safety buffer is added for the recommended order</li>
                      <li>Peak months typically show higher demand</li>
                    </ul>
                  </div>

                  {predictError&&(
                    <div style={{marginTop:14,padding:'10px 14px',background:'#ffebee',borderRadius:8,border:'1px solid #ef9a9a',fontSize:13,color:'#c62828',fontWeight:600}}>
                      ⚠️ {predictError}
                    </div>
                  )}
                </div>

                {/* Right — prediction result cards */}
                {predictResult ? (
                  <div style={{flex:'1 1 300px',background:'white',borderRadius:14,padding:28,boxShadow:'0 2px 6px rgba(0,0,0,0.07),0 8px 24px rgba(0,0,0,0.09)'}}>
                    <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:20,flexWrap:'wrap'}}>
                      <h3 style={{margin:0,fontSize:16,fontWeight:700,color:'#333'}}>
                        Prediction — {predictResult.input.monthName} {predictResult.input.year}
                      </h3>
                      {PEAK_MONTHS.includes(predictResult.input.monthName)&&(
                        <span style={{fontSize:10,background:'#fff3e0',color:'#e65100',padding:'2px 8px',borderRadius:10,fontWeight:700,border:'1px solid #ffcc80'}}>🔥 HIGH DEMAND MONTH</span>
                      )}
                    </div>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:20}}>
                      <div style={{background:'#e0f7f4',borderRadius:12,padding:'18px 20px',textAlign:'center',border:'2px solid #26a69a'}}>
                        <p style={{margin:'0 0 6px',fontSize:11,color:'#26a69a',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.5px'}}>💉 Predicted Doses</p>
                        <p style={{margin:0,fontSize:36,fontWeight:800,color:'#26a69a',lineHeight:1}}>{predictResult.prediction.predicted_doses.toLocaleString()}</p>
                        <p style={{margin:'6px 0 0',fontSize:11,color:'#80cbc4'}}>ARV doses expected</p>
                      </div>
                      <div style={{background:'#fff8e1',borderRadius:12,padding:'18px 20px',textAlign:'center',border:'2px solid #f57f17'}}>
                        <p style={{margin:'0 0 6px',fontSize:11,color:'#f57f17',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.5px'}}>📦 Recommended Order</p>
                        <p style={{margin:0,fontSize:36,fontWeight:800,color:'#f57f17',lineHeight:1}}>{predictResult.prediction.recommended_order.toLocaleString()}</p>
                        <p style={{margin:'6px 0 0',fontSize:11,color:'#f57f17',opacity:0.7}}>incl. {predictResult.prediction.safety_buffer_pct}% safety buffer</p>
                      </div>
                    </div>
                    {(() => {
                      const mape = parseFloat(predictResult.model_info.test_mape);
                      const r2   = parseFloat(predictResult.model_info.test_r2);

                      // ── How far into the future is this prediction? ──────────────
                      const now          = new Date();
                      const nowYear      = now.getFullYear();
                      const nowMonth     = now.getMonth() + 1;
                      const monthsAhead  = (predictResult.input.year - nowYear) * 12
                                        + (predictResult.input.month - nowMonth);

                      // Decay confidence the further into the future
                      // Base MAPE from model, then add penalty per month ahead
                      const decayPenalty = Math.max(0, monthsAhead) * 0.8; // +0.8% per month ahead
                      const adjustedMape = Math.min(mape + decayPenalty, 60); // cap at 60%

                      // ── Confidence tier ────────────────────────────────────────────
                      const confidence      = adjustedMape <= 6  ? 'High'
                                            : adjustedMape <= 20 ? 'Moderate'
                                            : adjustedMape <= 35 ? 'Low'
                                            :                      'Very Low';
                      const confidenceColor = adjustedMape <= 6  ? '#2e7d32'
                                            : adjustedMape <= 20 ? '#f57f17'
                                            : adjustedMape <= 35 ? '#e65100'
                                            :                      '#c62828';
                      const confidenceBg    = adjustedMape <= 6  ? '#e8f5e9'
                                            : adjustedMape <= 20 ? '#fff8e1'
                                            : adjustedMape <= 35 ? '#fff3e0'
                                            :                      '#ffebee';
                      const confidenceBdr   = adjustedMape <= 6  ? '#a5d6a7'
                                            : adjustedMape <= 20 ? '#ffe082'
                                            : adjustedMape <= 35 ? '#ffcc80'
                                            :                      '#ef9a9a';
                      const confidenceIcon  = adjustedMape <= 6  ? '🎯'
                                            : adjustedMape <= 20 ? '📊'
                                            : adjustedMape <= 35 ? '⚠️'
                                            :                      '🔴';

                      const avgError = Math.round(
                        predictResult.prediction.predicted_doses * (adjustedMape / 100)
                      );

                      // R² decays with prediction horizon — further ahead = lower effective fit
                      const r2DecayPenalty = Math.max(0, monthsAhead) * 0.008; // -0.008 per month ahead
                      const effectiveR2    = Math.max(0, parseFloat((r2 - r2DecayPenalty).toFixed(4)));

                      const r2Label = effectiveR2 >= 0.8 ? 'Strong fit'
                                    : effectiveR2 >= 0.6 ? 'Moderate fit'
                                    : effectiveR2 >= 0.4 ? 'Weak fit'
                                    :                      'Poor fit — treat as estimate';

                      // ── Context-aware description ─────────────────────────────────
                      const timeContext = monthsAhead <= 0  ? 'current or past month'
                                        : monthsAhead === 1 ? 'next month'
                                        : monthsAhead <= 3  ? `${monthsAhead} months ahead`
                                        : monthsAhead <= 6  ? `${monthsAhead} months ahead`
                                        :                     `${monthsAhead} months into the future`;

                      const description = adjustedMape <= 6
                        ? `High confidence — predicting the ${timeContext}. The model is typically off by about ${avgError} doses (±${adjustedMape.toFixed(1)}%).`
                        : adjustedMape <= 20
                        ? `Moderate confidence for the ${timeContext}. Forecast uncertainty increases the further ahead we predict. Expect ±${avgError} doses variance (${adjustedMape.toFixed(1)}% error).`
                        : adjustedMape <= 35
                        ? `Low confidence — this is ${timeContext}. Long-range forecasts carry higher uncertainty. Use as a rough estimate only (±${avgError} doses, ${adjustedMape.toFixed(1)}% error).`
                        : `Very low confidence — predicting ${timeContext} is highly uncertain. The model's accuracy degrades significantly this far out. Treat this as a rough planning figure only (±${avgError} doses, ${adjustedMape.toFixed(1)}% error).`;

                      // ── Confidence bar ────────────────────────────────────────────
                      const confidencePct = Math.max(5, 100 - adjustedMape * 1.5);

                      return (
                        <div style={{borderRadius:10,overflow:'hidden',border:`1.5px solid ${confidenceBdr}`}}>

                          {/* Header */}
                          <div style={{background:confidenceBg,padding:'10px 16px',display:'flex',alignItems:'center',justifyContent:'space-between',gap:10,flexWrap:'wrap'}}>
                            <div style={{display:'flex',alignItems:'center',gap:8}}>
                              <span style={{fontSize:16}}>{confidenceIcon}</span>
                              <span style={{fontSize:13,fontWeight:700,color:confidenceColor}}>
                                {confidence} Confidence Prediction
                              </span>
                              {monthsAhead > 0 && (
                                <span style={{fontSize:10,color:'#888',fontStyle:'italic'}}>
                                  ({timeContext})
                                </span>
                              )}
                            </div>
                            <span style={{fontSize:11,fontWeight:700,color:confidenceColor,background:'white',padding:'2px 10px',borderRadius:20,border:`1px solid ${confidenceBdr}`}}>
                              ±{adjustedMape.toFixed(1)}% est. error
                            </span>
                          </div>

                          {/* Body */}
                          <div style={{background:'white',padding:'12px 16px'}}>
                            <p style={{margin:'0 0 10px',fontSize:12,color:'#555',lineHeight:1.6}}>
                              {description}
                            </p>

                            {/* Confidence bar */}
                            <div style={{marginBottom:12}}>
                              <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                                <span style={{fontSize:10,color:'#aaa'}}>Prediction confidence</span>
                                <span style={{fontSize:10,fontWeight:700,color:confidenceColor}}>{Math.round(confidencePct)}%</span>
                              </div>
                              <div style={{height:6,background:'#f0f0f0',borderRadius:99,overflow:'hidden'}}>
                                <div style={{
                                  height:'100%',
                                  width:`${confidencePct}%`,
                                  background: adjustedMape<=6?'#26a69a':adjustedMape<=20?'#f57f17':adjustedMape<=35?'#e65100':'#e53935',
                                  borderRadius:99,
                                  transition:'width 0.4s ease',
                                }}/>
                              </div>
                            </div>

                            {/* Metric pills */}
                            <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                              <div style={{background:'#f5f5f5',borderRadius:8,padding:'6px 12px'}}>
                                <span style={{fontSize:10,color:'#999',display:'block',marginBottom:1}}>MAPE (ADJUSTED)</span>
                                <span style={{fontSize:12,fontWeight:700,color:'#333'}}>±{adjustedMape.toFixed(2)}%</span>
                                <span style={{fontSize:10,color:'#aaa',marginLeft:4}}>incl. future penalty</span>
                              </div>
                              {monthsAhead > 0 && (
                                <div style={{background:'#f5f5f5',borderRadius:8,padding:'6px 12px'}}>
                                  <span style={{fontSize:10,color:'#999',display:'block',marginBottom:1}}>FUTURE PENALTY</span>
                                  <span style={{fontSize:12,fontWeight:700,color:'#e65100'}}>+{decayPenalty.toFixed(1)}%</span>
                                  <span style={{fontSize:10,color:'#aaa',marginLeft:4}}>{monthsAhead} mo ahead</span>
                                </div>
                              )}
                              <div style={{background:'#f5f5f5',borderRadius:8,padding:'6px 12px'}}>
                                <span style={{fontSize:10,color:'#999',display:'block',marginBottom:1}}>MODEL FIT (R²)</span>
                                <span style={{fontSize:12,fontWeight:700,color:effectiveR2>=0.7?'#2e7d32':effectiveR2>=0.4?'#f57f17':'#e53935'}}>
                                  {effectiveR2}
                                </span>
                                <span style={{fontSize:10,color:'#aaa',marginLeft:4}}>{r2Label}</span>
                              </div>
                              <div style={{background:'#f5f5f5',borderRadius:8,padding:'6px 12px'}}>
                                <span style={{fontSize:10,color:'#999',display:'block',marginBottom:1}}>MODEL</span>
                                <span style={{fontSize:12,fontWeight:700,color:'#333'}}>{predictResult.model_info.model_name}</span>
                              </div>
                            </div>
                          </div>

                        </div>
                      );
                    })()}
                  </div>
                ) : (
                  /* Placeholder when no prediction yet */
                  <div style={{flex:'1 1 300px',background:'white',borderRadius:14,padding:28,boxShadow:'0 2px 6px rgba(0,0,0,0.07),0 8px 24px rgba(0,0,0,0.09)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:'center',color:'#ccc'}}>
                    <div style={{fontSize:48,marginBottom:12}}>🔮</div>
                    <p style={{margin:0,fontSize:14,fontWeight:600,color:'#bbb'}}>Prediction will appear here</p>
                    <p style={{margin:'6px 0 0',fontSize:12,color:'#ddd'}}>Select a year and month, then click Predict</p>
                  </div>
                )}
              </div>

              {/* Bottom — 12-month trend chart */}
              {predictResult&&(
                <div style={{background:'white',borderRadius:14,padding:28,boxShadow:'0 2px 6px rgba(0,0,0,0.07),0 8px 24px rgba(0,0,0,0.09)'}}>
                  <h3 style={{margin:'0 0 4px',fontSize:15,fontWeight:700,color:'#333'}}>
                    📈 12-Month Prediction Trend — {predictResult.input.year}
                  </h3>
                  <p style={{margin:'0 0 20px',fontSize:11,color:'#999',fontStyle:'italic'}}>
                    All 12 months predicted by the ML model · Real backend predictions · Selected month highlighted
                  </p>
                  {trendLoading ? (
                    <div style={{display:'flex',flexDirection:'column',gap:10}}>
                      {[1,2,3].map(i=><Skeleton key={i} h={36}/>)}
                    </div>
                  ) : (
                    <>
                      <ResponsiveContainer width="100%" height={260}>
                        <ComposedChart data={trendData} margin={{top:5,right:20,left:0,bottom:5}}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5"/>
                          <XAxis dataKey="name" tick={{fontSize:12}}/>
                          <YAxis tick={{fontSize:11}} width={50}/>
                          <Tooltip content={<CustomTooltip/>}/>
                          <Legend wrapperStyle={{fontSize:12,paddingTop:12}}/>
                          <Area type="monotone" dataKey="Recommended" fill="#fff8e1" stroke="#f57f17"
                            strokeWidth={1.5} strokeDasharray="4 2" dot={false} name="Recommended Order"/>
                          <Line type="monotone" dataKey="Predicted" stroke="#26a69a" strokeWidth={2.5}
                            dot={(props) => {
                              const {cx, cy, payload} = props;
                              if (payload.isSelected) return <circle key={`s${cx}`} cx={cx} cy={cy} r={7} fill="#26a69a" stroke="white" strokeWidth={2}/>;
                              if (payload.isPeak)     return <circle key={`p${cx}`} cx={cx} cy={cy} r={4} fill="#e65100" stroke="white" strokeWidth={1.5}/>;
                              return <circle key={`n${cx}`} cx={cx} cy={cy} r={3} fill="#26a69a"/>;
                            }}
                            name="ML Predicted"/>
                        </ComposedChart>
                      </ResponsiveContainer>
                      <div style={{display:'flex',gap:20,marginTop:12,flexWrap:'wrap'}}>
                        {[
                          {color:'#26a69a',label:'Selected month',ring:true, r:6},
                          {color:'#e65100',label:'Peak month',    ring:false,r:4},
                          {color:'#26a69a',label:'Normal month',  ring:false,r:3},
                        ].map(({color,label,ring,r})=>(
                          <div key={label} style={{display:'flex',alignItems:'center',gap:5}}>
                            <svg width={14} height={14}>
                              <circle cx={7} cy={7} r={r} fill={color} stroke={ring?'white':'none'} strokeWidth={ring?2:0}/>
                            </svg>
                            <span style={{fontSize:11,color:'#888'}}>{label}</span>
                          </div>
                        ))}
                        <div style={{display:'flex',alignItems:'center',gap:5}}>
                          <svg width={20} height={10}>
                            <line x1={0} y1={5} x2={20} y2={5} stroke="#f57f17" strokeWidth={1.5} strokeDasharray="4 2"/>
                          </svg>
                          <span style={{fontSize:11,color:'#888'}}>Recommended order</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

            </div>
          )}

          {/* ══ TAB: SUBMIT MONTHLY ACTUALS ══ */}
          {activeTab==='actuals'&&(
            <div style={{maxWidth:720}}>

              {/* Explainer banner */}
              <div style={{background:'linear-gradient(135deg,#1a7a74 0%,#26a69a 100%)',borderRadius:12,padding:'18px 22px',marginBottom:24,color:'white'}}>
                <h3 style={{margin:'0 0 6px',fontSize:15,fontWeight:700,color:'white'}}>📥 Monthly Data Submission</h3>
                <p style={{margin:0,fontSize:12,color:'rgba(255,255,255,0.85)',lineHeight:1.6}}>
                  Submit actual data from your ABTC monthly report after each month ends.
                  The model will <strong>automatically retrain</strong> and update predictions — no manual steps needed.
                  Do this once a month to improve forecast accuracy over time.
                </p>
              </div>

              {/* Success state */}
              {submitResult&&(
                <div style={{background:'#e8f5e9',border:'1.5px solid #a5d6a7',borderRadius:12,padding:'18px 20px',marginBottom:20}}>
                  <p style={{margin:'0 0 6px',fontSize:14,fontWeight:700,color:'#2e7d32'}}>
                    ✅ Data {submitResult.status} for {MONTHS[submitResult.month-1]} {submitResult.year}
                  </p>
                  <p style={{margin:'0 0 10px',fontSize:12,color:'#388e3c'}}>
                    {submitResult.arv_doses_administered?.toLocaleString()} doses submitted · Model is retraining in the background (~10–15 seconds)
                  </p>
                  {retrainStatus&&(
                    <div style={{background:'white',borderRadius:8,padding:'10px 14px',border:'1px solid #a5d6a7'}}>
                      <p style={{margin:'0 0 4px',fontSize:11,color:'#888',fontWeight:700,textTransform:'uppercase'}}>Updated Model Metrics</p>
                      <div style={{display:'flex',gap:16,flexWrap:'wrap'}}>
                        {[
                          {label:'R²',   value:retrainStatus.test_r2},
                          {label:'MAPE', value:`${retrainStatus.test_mape}%`},
                          {label:'MAE',  value:`±${retrainStatus.test_mae} doses`},
                          {label:'Trained on', value:`${retrainStatus.trained_on?.samples} rows`},
                        ].map(({label,value})=>(
                          <div key={label}>
                            <span style={{fontSize:11,color:'#999'}}>{label}: </span>
                            <span style={{fontSize:12,color:'#2e7d32',fontWeight:700}}>{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {!retrainStatus&&(
                    <p style={{margin:0,fontSize:11,color:'#666',fontStyle:'italic'}}>
                      ⏳ Waiting for retrain to complete... metrics will update here automatically.
                    </p>
                  )}
                  <button onClick={()=>{setSubmitResult(null);setRetrainStatus(null);}}
                    style={{marginTop:12,padding:'6px 14px',borderRadius:7,border:'1.5px solid #2e7d32',background:'white',color:'#2e7d32',fontSize:12,fontWeight:600,cursor:'pointer'}}>
                    Submit Another Month
                  </button>
                </div>
              )}

              {/* Error */}
              {submitError&&(
                <div style={{background:'#ffebee',border:'1px solid #ef9a9a',borderRadius:10,padding:'12px 16px',marginBottom:16,fontSize:13,color:'#c62828',fontWeight:600}}>
                  ⚠️ {submitError}
                </div>
              )}

              {/* Form */}
              {!submitResult&&(
                <form onSubmit={handleSubmitActuals}>
                  <div style={{background:'white',borderRadius:14,padding:24,boxShadow:'0 2px 6px rgba(0,0,0,0.07),0 8px 24px rgba(0,0,0,0.09)',marginBottom:16}}>

                    {/* Period */}
                    <h4 style={{margin:'0 0 16px',fontSize:13,fontWeight:700,color:'#333',borderBottom:'1px solid #f0f0f0',paddingBottom:10}}>
                      📅 Reporting Period
                    </h4>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:4}}>
                      <FormField label="Year" hint="The year this data is for">
                        <input type="number" value={actualForm.year}
                          onChange={e=>setField('year',e.target.value)}
                          min={2020} max={2040} style={inputStyle}
                          onFocus={e=>e.target.style.borderColor='#26a69a'}
                          onBlur={e=>e.target.style.borderColor='#e0e0e0'}/>
                      </FormField>
                      <FormField label="Month" hint="The month that just ended">
                        <select value={actualForm.month} onChange={e=>setField('month',e.target.value)}
                          style={{...inputStyle,cursor:'pointer'}}
                          onFocus={e=>e.target.style.borderColor='#26a69a'}
                          onBlur={e=>e.target.style.borderColor='#e0e0e0'}>
                          {MONTHS.map((m,i)=><option key={m} value={i+1}>{m}</option>)}
                        </select>
                      </FormField>
                    </div>
                  </div>

                  {/* Clinical data */}
                  <div style={{background:'white',borderRadius:14,padding:24,boxShadow:'0 2px 6px rgba(0,0,0,0.07),0 8px 24px rgba(0,0,0,0.09)',marginBottom:16}}>
                    <h4 style={{margin:'0 0 4px',fontSize:13,fontWeight:700,color:'#333'}}>💉 Clinical Data</h4>
                    <p style={{margin:'0 0 16px',fontSize:11,color:'#999',fontStyle:'italic'}}>From your ABTC monthly logbook and patient register</p>

                    <FormField label="ARV Doses Administered *" hint="Total anti-rabies vaccine doses given this month — most important field">
                      <input type="number" value={actualForm.arv_doses_administered}
                        onChange={e=>setField('arv_doses_administered',e.target.value)}
                        placeholder="e.g. 1712" style={{...inputStyle,borderColor:'#26a69a'}}
                        onFocus={e=>e.target.style.borderColor='#26a69a'}
                        onBlur={e=>e.target.style.borderColor='#26a69a'}/>
                    </FormField>

                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr',gap:12}}>
                      <FormField label="Total Bite Cases *" hint="All animal bite patients">
                        <input type="number" value={actualForm.bite_cases_total}
                          onChange={e=>setField('bite_cases_total',e.target.value)}
                          placeholder="e.g. 340" style={inputStyle}
                          onFocus={e=>e.target.style.borderColor='#26a69a'}
                          onBlur={e=>e.target.style.borderColor='#e0e0e0'}/>
                      </FormField>
                      <FormField label="Category I *" hint="Licks on intact skin">
                        <input type="number" value={actualForm.category_1_cases}
                          onChange={e=>setField('category_1_cases',e.target.value)}
                          placeholder="e.g. 65" style={inputStyle}
                          onFocus={e=>e.target.style.borderColor='#26a69a'}
                          onBlur={e=>e.target.style.borderColor='#e0e0e0'}/>
                      </FormField>
                      <FormField label="Category II *" hint="Minor scratches">
                        <input type="number" value={actualForm.category_2_cases}
                          onChange={e=>setField('category_2_cases',e.target.value)}
                          placeholder="e.g. 140" style={inputStyle}
                          onFocus={e=>e.target.style.borderColor='#26a69a'}
                          onBlur={e=>e.target.style.borderColor='#e0e0e0'}/>
                      </FormField>
                      <FormField label="Category III *" hint="Transdermal bites">
                        <input type="number" value={actualForm.category_3_cases}
                          onChange={e=>setField('category_3_cases',e.target.value)}
                          placeholder="e.g. 135" style={inputStyle}
                          onFocus={e=>e.target.style.borderColor='#26a69a'}
                          onBlur={e=>e.target.style.borderColor='#e0e0e0'}/>
                      </FormField>
                    </div>

                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginTop:4}}>
                      <FormField label="PEP Completion Rate *" hint="Decimal 0–1 (e.g. 0.82 = 82%)">
                        <input type="number" step="0.01" min="0" max="1" value={actualForm.pep_completion_rate}
                          onChange={e=>setField('pep_completion_rate',e.target.value)}
                          placeholder="e.g. 0.82" style={inputStyle}
                          onFocus={e=>e.target.style.borderColor='#26a69a'}
                          onBlur={e=>e.target.style.borderColor='#e0e0e0'}/>
                      </FormField>
                      <FormField label="RIG Availability Rate *" hint="Decimal 0–1 (e.g. 0.93 = 93% of days available)">
                        <input type="number" step="0.01" min="0" max="1" value={actualForm.rig_availability_rate}
                          onChange={e=>setField('rig_availability_rate',e.target.value)}
                          placeholder="e.g. 0.93" style={inputStyle}
                          onFocus={e=>e.target.style.borderColor='#26a69a'}
                          onBlur={e=>e.target.style.borderColor='#e0e0e0'}/>
                      </FormField>
                    </div>
                  </div>

                  {/* Climate */}
                  <div style={{background:'white',borderRadius:14,padding:24,boxShadow:'0 2px 6px rgba(0,0,0,0.07),0 8px 24px rgba(0,0,0,0.09)',marginBottom:16}}>
                    <h4 style={{margin:'0 0 4px',fontSize:13,fontWeight:700,color:'#333'}}>🌤️ Climate Data</h4>
                    <p style={{margin:'0 0 16px',fontSize:11,color:'#999',fontStyle:'italic'}}>From PAGASA CDO monthly report</p>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr',gap:12}}>
                      {[
                        {key:'temperature_c',    label:'Avg Temp (°C) *',    placeholder:'e.g. 29.2'},
                        {key:'rainfall_mm',      label:'Total Rainfall (mm) *',placeholder:'e.g. 145'},
                        {key:'humidity_percent', label:'Avg Humidity (%) *',  placeholder:'e.g. 80.5'},
                        {key:'heat_index_c',     label:'Heat Index (°C) *',   placeholder:'e.g. 33.1'},
                      ].map(({key,label,placeholder})=>(
                        <FormField key={key} label={label}>
                          <input type="number" step="0.1" value={actualForm[key]}
                            onChange={e=>setField(key,e.target.value)}
                            placeholder={placeholder} style={inputStyle}
                            onFocus={e=>e.target.style.borderColor='#26a69a'}
                            onBlur={e=>e.target.style.borderColor='#e0e0e0'}/>
                        </FormField>
                      ))}
                    </div>
                  </div>

                  {/* Flags */}
                  <div style={{background:'white',borderRadius:14,padding:24,boxShadow:'0 2px 6px rgba(0,0,0,0.07),0 8px 24px rgba(0,0,0,0.09)',marginBottom:16}}>
                    <h4 style={{margin:'0 0 4px',fontSize:13,fontWeight:700,color:'#333'}}>🚩 Monthly Events & Flags</h4>
                    <p style={{margin:'0 0 16px',fontSize:11,color:'#999',fontStyle:'italic'}}>Did any of these happen this month?</p>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                      <FormField label="Stockout Occurred?" hint="Did you run out of ARV any day this month?">
                        {flagSelect('stockout_flag')}
                      </FormField>
                      <FormField label="Procurement Delay (days)" hint="How many days were orders delayed?">
                        <input type="number" min="0" value={actualForm.procurement_delay_days}
                          onChange={e=>setField('procurement_delay_days',e.target.value)}
                          placeholder="0" style={inputStyle}
                          onFocus={e=>e.target.style.borderColor='#26a69a'}
                          onBlur={e=>e.target.style.borderColor='#e0e0e0'}/>
                      </FormField>
                      <FormField label="Dog Vaccination Campaign?" hint="Was there a Rabies Month / vaccination drive?">
                        {flagSelect('dog_vaccination_campaign_flag')}
                      </FormField>
                      <FormField label="Extreme Weather Event?" hint="Typhoon, flooding, or other disaster?">
                        {flagSelect('extreme_weather_flag')}
                      </FormField>
                      <FormField label="Holiday Season?" hint="Major holidays (Christmas, New Year)?">
                        {flagSelect('holiday_season_flag')}
                      </FormField>
                      <FormField label="School Vacation?" hint="April, May, June, October, November">
                        {flagSelect('school_vacation_flag')}
                      </FormField>
                    </div>
                  </div>

                  {/* Submit */}
                  <button type="submit" disabled={submitting}
                    style={{width:'100%',padding:'14px',borderRadius:10,border:'none',
                      background:submitting?'#a5d6a7':'#26a69a',color:'white',
                      fontSize:15,fontWeight:700,cursor:submitting?'not-allowed':'pointer',
                      transition:'background 0.2s',
                      boxShadow:submitting?'none':'0 4px 14px rgba(38,166,154,0.4)'}}>
                    {submitting
                      ? '⏳ Saving data and starting retrain...'
                      : `📥 Submit ${MONTHS[actualForm.month-1]} ${actualForm.year} Data & Retrain Model`}
                  </button>
                  <p style={{textAlign:'center',margin:'10px 0 0',fontSize:11,color:'#aaa'}}>
                    The model will automatically retrain after submission (~10–15 seconds). You can navigate away.
                  </p>
                </form>
              )}
            </div>
          )}

        </main>
      </section>
    </div>
  );
};

export default DemandForecast;