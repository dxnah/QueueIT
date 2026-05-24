// src/pages/DemandForecast.jsx

import { useState, useEffect } from 'react';
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

  // Predict handler
  const handlePredict = async () => {
    try {
      setPredicting(true); setPredictError(null); setPredictResult(null);
      const result = await mlAPI.predict(predictYear, predictMonth);
      setPredictResult(result);
    } catch(e){ setPredictError(e.message); }
    finally { setPredicting(false); }
  };

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
              {metrics&&(
                <div style={{display:'flex',gap:8,flexWrap:'wrap',alignItems:'center'}}>
                  {[
                    {label:'Model', value:metrics.model_name,               color:'#26a69a'},
                    {label:'R²',    value:metrics.test_metrics?.R2,          color:'#2e7d32'},
                    {label:'MAPE',  value:`${metrics.test_metrics?.MAPE_pct}%`, color:'#f57f17'},
                  ].map(({label,value,color})=>(
                    <div key={label} style={{display:'inline-flex',alignItems:'center',gap:5,background:`${color}15`,border:`1.5px solid ${color}40`,borderRadius:20,padding:'4px 12px'}}>
                      <span style={{fontSize:10,color:'#888',fontWeight:600}}>{label}</span>
                      <span style={{fontSize:12,color,fontWeight:800}}>{value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </header>

          {/* Error */}
          {mlError&&(
            <div style={{marginBottom:16,padding:'12px 18px',background:'#ffebee',borderRadius:10,border:'1px solid #ef9a9a',fontSize:13,color:'#c62828',fontWeight:600}}>
              ⚠️ {mlError}
            </div>
          )}

          {/* Tabs */}
          <div style={{display:'flex',gap:8,marginBottom:20,flexWrap:'wrap',borderBottom:'2px solid #f0f0f0',paddingBottom:12}}>
            <button onClick={()=>setActiveTab('arv')} style={btnStyle(activeTab==='arv')}>
              📈 ARV Demand Forecast
            </button>
            <button onClick={()=>setActiveTab('predict')} style={btnStyle(activeTab==='predict')}>
              🔮 Live Predict
            </button>
          </div>

          {/* ══ TAB: ARV FORECAST ══ */}
          {activeTab==='arv'&&(
            <>
              {mlLoading||yearLoading
                ?<div style={{display:'flex',gap:16,marginBottom:24,flexWrap:'wrap'}}>{[1,2,3,4].map(i=><div key={i} style={{flex:'1 1 0',minWidth:0}}><Skeleton h={90}/></div>)}</div>
                :yearSummary&&(
                  <div style={{display:'flex',gap:16,marginBottom:24,flexWrap:'wrap'}}>
                    <StatCard icon="📅" label="Year"             value={selectedYear}
                      note={`${months.length} months`} borderColor="#26a69a"/>
                    <StatCard icon="💉" label="Total Predicted"  value={(yearSummary.total_predicted||yearSummary.totalPredicted||0).toLocaleString()}
                      note="ARV doses forecast" borderColor="#5c6bc0"
                      sub={`Avg ${(yearSummary.avg_per_month||yearSummary.avgPerMonth||0).toLocaleString()}/mo`}/>
                    <StatCard icon="📦" label="Recommended Order" value={(yearSummary.total_recommended||yearSummary.totalRecommended||0).toLocaleString()}
                      note="incl. 12% safety buffer" borderColor="#f57f17"/>
                    <StatCard icon="✅" label="Model Accuracy"   value={metrics?`${(metrics.test_metrics?.R2*100).toFixed(1)}%`:'—'}
                      note={`MAE ±${metrics?.test_metrics?.MAE||'—'} doses`} borderColor="#2e7d32"/>
                  </div>
                )
              }

              {/* Year selector + view toggle */}
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

              {/* Content card */}
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

              {/* Year-over-year */}
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
            <div style={{maxWidth:560}}>
              <div style={{background:'white',borderRadius:14,padding:28,boxShadow:'0 2px 6px rgba(0,0,0,0.07),0 8px 24px rgba(0,0,0,0.09)',marginBottom:24}}>
                <h3 style={{margin:'0 0 6px',fontSize:16,fontWeight:700,color:'#333'}}>🔮 Live ARV Demand Prediction</h3>
                <p style={{margin:'0 0 22px',fontSize:12,color:'#999'}}>
                  Enter any year and month — the trained Linear Regression model will predict ARV dose demand in real time.
                </p>

                <div style={{display:'flex',gap:12,marginBottom:20,flexWrap:'wrap'}}>
                  <div style={{flex:'1 1 160px'}}>
                    <label style={{display:'block',fontSize:12,fontWeight:600,color:'#555',marginBottom:6}}>Year</label>
                    <input type="number" value={predictYear}
                      onChange={e=>setPredictYear(parseInt(e.target.value)||new Date().getFullYear())}
                      min={2010} max={2040}
                      style={{width:'100%',padding:'9px 12px',borderRadius:8,border:'1.5px solid #e0e0e0',fontSize:14,color:'#333',boxSizing:'border-box',outline:'none'}}
                      onFocus={e=>e.target.style.borderColor='#26a69a'}
                      onBlur={e=>e.target.style.borderColor='#e0e0e0'}/>
                  </div>
                  <div style={{flex:'1 1 160px'}}>
                    <label style={{display:'block',fontSize:12,fontWeight:600,color:'#555',marginBottom:6}}>Month</label>
                    <select value={predictMonth} onChange={e=>setPredictMonth(parseInt(e.target.value))}
                      style={{width:'100%',padding:'9px 12px',borderRadius:8,border:'1.5px solid #e0e0e0',fontSize:14,color:'#333',background:'white',boxSizing:'border-box',cursor:'pointer',outline:'none'}}
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

                {predictError&&(
                  <div style={{marginTop:14,padding:'10px 14px',background:'#ffebee',borderRadius:8,border:'1px solid #ef9a9a',fontSize:13,color:'#c62828',fontWeight:600}}>
                    ⚠️ {predictError}
                  </div>
                )}
              </div>

              {predictResult&&(
                <div style={{background:'white',borderRadius:14,padding:28,boxShadow:'0 2px 6px rgba(0,0,0,0.07),0 8px 24px rgba(0,0,0,0.09)'}}>
                  <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:20,flexWrap:'wrap'}}>
                    <h3 style={{margin:0,fontSize:16,fontWeight:700,color:'#333'}}>
                      Prediction Result — {predictResult.input.monthName} {predictResult.input.year}
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

                  <div style={{background:'#f5f5f5',borderRadius:10,padding:'14px 16px'}}>
                    <p style={{margin:'0 0 8px',fontSize:11,color:'#888',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.5px'}}>Model Info</p>
                    <div style={{display:'flex',gap:16,flexWrap:'wrap'}}>
                      {[
                        {label:'Model',     value:predictResult.model_info.model_name},
                        {label:'Test R²',   value:predictResult.model_info.test_r2},
                        {label:'Test MAPE', value:`${predictResult.model_info.test_mape}%`},
                      ].map(({label,value})=>(
                        <div key={label}>
                          <span style={{fontSize:11,color:'#999'}}>{label}: </span>
                          <span style={{fontSize:12,color:'#333',fontWeight:700}}>{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

        </main>
      </section>
    </div>
  );
};

export default DemandForecast;