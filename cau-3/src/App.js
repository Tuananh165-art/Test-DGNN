import React, { useState, useEffect, useMemo } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { Line, Bar, Doughnut, Scatter } from 'react-chartjs-2';
import zoomPlugin from 'chartjs-plugin-zoom';
import Papa from 'papaparse';
import './App.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, zoomPlugin);

function App() {
  const [allData, setAllData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [startDate, setStartDate] = useState('2020-01-01');
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [chartType, setChartType] = useState('all');
  const [timeInterval, setTimeInterval] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Papa.parse('https://raw.githubusercontent.com/YouGov-Data/covid-19-tracker/master/data/vietnam.csv', {
      download: true,
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        const processed = results.data
          .filter(row => row.endtime)
          .map(row => ({
            date: new Date(row.endtime),
            dateStr: row.endtime,
            worried: row.i1_health || 0,
            notWorried: row.i2_health || 0,
            avoidPublic: row.i12_health_1 === 'Always' ? 100 : row.i12_health_1 === 'Frequently' ? 75 : row.i12_health_1 === 'Sometimes' ? 50 : row.i12_health_1 === 'Rarely' ? 25 : row.i12_health_1 === 'Not at all' ? 0 : 0,
            wornMask: row.i12_health_7 === 'Always' ? 100 : row.i12_health_7 === 'Frequently' ? 75 : row.i12_health_7 === 'Sometimes' ? 50 : row.i12_health_7 === 'Rarely' ? 25 : row.i12_health_7 === 'Not at all' ? 0 : 0,
            avoidContact: row.i12_health_8 === 'Always' ? 100 : row.i12_health_8 === 'Frequently' ? 75 : row.i12_health_8 === 'Sometimes' ? 50 : row.i12_health_8 === 'Rarely' ? 25 : row.i12_health_8 === 'Not at all' ? 0 : 0
          }))
          .sort((a, b) => a.date - b.date);
        setAllData(processed);
        setFilteredData(processed);
        setLoading(false);
      }
    });
  }, []);

  const applyFilters = () => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    let filtered = allData.filter(row => row.date >= start && row.date <= end);
    
    if (timeInterval !== 'all') {
      filtered = filterByInterval(filtered, timeInterval);
    }
    
    setFilteredData(filtered);
  };

  const filterByInterval = (data, interval) => {
    if (interval === 'weekly') {
      return data.filter((_, index) => index % 7 === 0);
    } else if (interval === 'monthly') {
      const monthly = [];
      let lastMonth = '';
      data.forEach(row => {
        const month = row.date.toISOString().slice(0, 7);
        if (month !== lastMonth) {
          monthly.push(row);
          lastMonth = month;
        }
      });
      return monthly;
    } else if (interval === 'yearly') {
      const yearly = [];
      let lastYear = '';
      data.forEach(row => {
        const year = row.date.getFullYear().toString();
        if (year !== lastYear) {
          yearly.push(row);
          lastYear = year;
        }
      });
      return yearly;
    }
    return data;
  };

  useEffect(() => {
    if (allData.length > 0) {
      applyFilters();
    }
  }, [allData]);

  const stats = useMemo(() => {
    if (filteredData.length === 0) return { worried: 0, notWorried: 0, avoidPublic: 0, wornMask: 0 };
    const avg = (field) => (filteredData.reduce((sum, d) => sum + d[field], 0) / filteredData.length).toFixed(1);
    return { worried: avg('worried'), notWorried: avg('notWorried'), avoidPublic: avg('avoidPublic'), wornMask: avg('wornMask') };
  }, [filteredData]);

  if (loading) return <div className="loading">Loading COVID-19 Data...</div>;

  return (
    <div className="container">
      <div className="header">
        <h1>🦠 COVID-19 Dashboard</h1>
        <p>Real-time COVID-19 Statistics for Vietnam</p>
      </div>

      <div className="controls">
        <div className="control-group">
          <label>Start Date</label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>
        <div className="control-group">
          <label>End Date</label>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
        <div className="control-group">
          <label>Chart Type</label>
          <select value={chartType} onChange={(e) => setChartType(e.target.value)}>
            <option value="all">All Charts</option>
            <option value="line">Line Charts</option>
            <option value="bar">Bar Charts</option>
          </select>
        </div>
        <div className="control-group">
          <label>Time Interval</label>
          <select value={timeInterval} onChange={(e) => setTimeInterval(e.target.value)}>
            <option value="all">All Data</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>
        <button className="btn" onClick={applyFilters}>Apply</button>
        <button className="btn" onClick={() => { setStartDate('2020-01-01'); setEndDate(new Date().toISOString().split('T')[0]); setTimeInterval('all'); applyFilters(); }}>Reset</button>
      </div>

      <div className="stats-grid">
        <div className="stat-card cases"><h3>Avg Worried Level (i1_health)</h3><div className="value">{stats.worried}</div></div>
        <div className="stat-card deaths"><h3>Avg Not Worried (i2_health)</h3><div className="value">{stats.notWorried}</div></div>
        <div className="stat-card recovered"><h3>Avg Avoid Public (i12_health_1)</h3><div className="value">{stats.avoidPublic}%</div></div>
        <div className="stat-card active"><h3>Avg Worn Mask (i12_health_7)</h3><div className="value">{stats.wornMask}%</div></div>
      </div>

      <div className="charts-grid">
        {(chartType === 'all' || chartType === 'line') && (
          <>
            <LineChart data={filteredData} title="Worried Level Over Time" field="worried" color="#e74c3c" />
            <AreaChart data={filteredData} />
            <MultiLineChart data={filteredData} />
          </>
        )}
        {(chartType === 'all' || chartType === 'bar') && (
          <>
            <BarChart data={filteredData} />
            <PieChart data={filteredData} />
            <ScatterChart data={filteredData} />
          </>
        )}
      </div>
    </div>
  );
}

function LineChart({ data, title, field, color }) {
  const chartData = {
    labels: data.map(d => d.dateStr),
    datasets: [{
      label: title,
      data: data.map(d => d[field]),
      borderColor: color,
      backgroundColor: color + '20',
      borderWidth: 2,
      fill: false,
      tension: 0.4,
      pointRadius: 2
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      zoom: {
        zoom: { wheel: { enabled: true }, pinch: { enabled: true }, mode: 'x' },
        pan: { enabled: true, mode: 'x' }
      }
    }
  };

  return (
    <div className="chart-container">
      <h2>{title}</h2>
      <div className="chart-wrapper"><Line data={chartData} options={options} /></div>
    </div>
  );
}

function AreaChart({ data }) {
  const chartData = {
    labels: data.map(d => d.dateStr),
    datasets: [{
      label: 'Avoid Public Places',
      data: data.map(d => d.avoidPublic),
      borderColor: '#3498db',
      backgroundColor: 'rgba(52, 152, 219, 0.3)',
      fill: true,
      tension: 0.4
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      zoom: {
        zoom: { wheel: { enabled: true }, pinch: { enabled: true }, mode: 'x' },
        pan: { enabled: true, mode: 'x' }
      }
    }
  };

  return (
    <div className="chart-container">
      <h2>Area Chart - Avoid Public Places</h2>
      <div className="chart-wrapper"><Line data={chartData} options={options} /></div>
    </div>
  );
}

function MultiLineChart({ data }) {
  const chartData = {
    labels: data.map(d => d.dateStr),
    datasets: [
      { label: 'Worried', data: data.map(d => d.worried), borderColor: '#e74c3c', fill: false, tension: 0.4 },
      { label: 'Not Worried', data: data.map(d => d.notWorried), borderColor: '#27ae60', fill: false, tension: 0.4 },
      { label: 'Worn Mask', data: data.map(d => d.wornMask), borderColor: '#3498db', fill: false, tension: 0.4 }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      zoom: {
        zoom: { wheel: { enabled: true }, pinch: { enabled: true }, mode: 'x' },
        pan: { enabled: true, mode: 'x' }
      }
    }
  };

  return (
    <div className="chart-container">
      <h2>Multi-Line: Behavior Trends</h2>
      <div className="chart-wrapper"><Line data={chartData} options={options} /></div>
    </div>
  );
}

function BarChart({ data }) {
  const monthlyData = {};
  data.forEach(row => {
    const month = row.date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    if (!monthlyData[month]) monthlyData[month] = { worried: 0, count: 0 };
    monthlyData[month].worried += row.worried;
    monthlyData[month].count++;
  });

  const chartData = {
    labels: Object.keys(monthlyData),
    datasets: [{
      label: 'Avg Monthly Worried Level',
      data: Object.values(monthlyData).map(m => (m.worried / m.count).toFixed(1)),
      backgroundColor: '#f39c12',
      borderRadius: 8
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      zoom: {
        zoom: { wheel: { enabled: true }, pinch: { enabled: true }, mode: 'x' },
        pan: { enabled: true, mode: 'x' }
      }
    }
  };

  return (
    <div className="chart-container">
      <h2>Bar Chart - Monthly Worried Level</h2>
      <div className="chart-wrapper"><Bar data={chartData} options={options} /></div>
    </div>
  );
}

function PieChart({ data }) {
  if (data.length === 0) return null;
  const latest = data[data.length - 1];

  const chartData = {
    labels: ['Worried', 'Not Worried', 'Avoid Public', 'Worn Mask'],
    datasets: [{
      data: [latest.worried, latest.notWorried, latest.avoidPublic, latest.wornMask],
      backgroundColor: ['#e74c3c', '#27ae60', '#3498db', '#f39c12']
    }]
  };

  return (
    <div className="chart-container">
      <h2>Pie Chart - Latest Behavior Distribution</h2>
      <div className="chart-wrapper"><Doughnut data={chartData} options={{ responsive: true, maintainAspectRatio: false }} /></div>
    </div>
  );
}

function ScatterChart({ data }) {
  const chartData = {
    datasets: [{
      label: 'Worried vs Avoid Public',
      data: data.map(d => ({ x: d.worried, y: d.avoidPublic })),
      backgroundColor: 'rgba(231, 76, 60, 0.6)',
      pointRadius: 5
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { title: { display: true, text: 'Worried (%)' } },
      y: { title: { display: true, text: 'Avoid Public (%)' } }
    },
    plugins: {
      zoom: {
        zoom: { wheel: { enabled: true }, pinch: { enabled: true }, mode: 'xy' },
        pan: { enabled: true, mode: 'xy' }
      }
    }
  };

  return (
    <div className="chart-container">
      <h2>Scatter Plot - Worried vs Avoid Public</h2>
      <div className="chart-wrapper"><Scatter data={chartData} options={options} /></div>
    </div>
  );
}

export default App;
