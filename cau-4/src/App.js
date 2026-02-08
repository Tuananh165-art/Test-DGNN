import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Network } from 'vis-network/standalone';
import './App.css';

const universitiesData = [
  { id: 1, name: "Vietnam National University, Hanoi", region: "North", students: 45000, faculty: 2500, founded: 1956, type: "Public" },
  { id: 2, name: "Hanoi University of Science and Technology", region: "North", students: 38000, faculty: 2200, founded: 1956, type: "Public" },
  { id: 3, name: "Hanoi University", region: "North", students: 25000, faculty: 1200, founded: 1959, type: "Public" },
  { id: 4, name: "Vietnam National University of Agriculture", region: "North", students: 22000, faculty: 1000, founded: 1956, type: "Public" },
  { id: 5, name: "Hanoi Medical University", region: "North", students: 18000, faculty: 950, founded: 1902, type: "Public" },
  { id: 6, name: "Foreign Trade University", region: "North", students: 20000, faculty: 800, founded: 1960, type: "Public" },
  { id: 7, name: "National Economics University", region: "North", students: 28000, faculty: 1100, founded: 1956, type: "Public" },
  { id: 8, name: "Hanoi University of Mining and Geology", region: "North", students: 15000, faculty: 700, founded: 1966, type: "Public" },
  { id: 9, name: "Thai Nguyen University", region: "North", students: 32000, faculty: 1500, founded: 1994, type: "Public" },
  { id: 11, name: "University of Da Nang", region: "Central", students: 42000, faculty: 2100, founded: 1975, type: "Public" },
  { id: 12, name: "Hue University", region: "Central", students: 35000, faculty: 1800, founded: 1957, type: "Public" },
  { id: 13, name: "Vinh University", region: "Central", students: 28000, faculty: 1300, founded: 1959, type: "Public" },
  { id: 14, name: "Quy Nhon University", region: "Central", students: 18000, faculty: 850, founded: 1977, type: "Public" },
  { id: 15, name: "Da Nang University of Technology", region: "Central", students: 16000, faculty: 800, founded: 1975, type: "Public" },
  { id: 16, name: "Hue University of Medicine and Pharmacy", region: "Central", students: 12000, faculty: 650, founded: 1957, type: "Public" },
  { id: 17, name: "Nha Trang University", region: "Central", students: 14000, faculty: 700, founded: 2000, type: "Public" },
  { id: 18, name: "Phu Yen University", region: "Central", students: 8000, faculty: 400, founded: 2009, type: "Public" },
  { id: 21, name: "Vietnam National University, HCMC", region: "South", students: 55000, faculty: 3000, founded: 1995, type: "Public" },
  { id: 22, name: "HCMC University of Technology", region: "South", students: 42000, faculty: 2300, founded: 1957, type: "Public" },
  { id: 23, name: "University of Medicine and Pharmacy, HCMC", region: "South", students: 24000, faculty: 1400, founded: 1947, type: "Public" },
  { id: 24, name: "HCMC University of Economics", region: "South", students: 38000, faculty: 1900, founded: 1976, type: "Public" },
  { id: 25, name: "Can Tho University", region: "South", students: 35000, faculty: 1700, founded: 1966, type: "Public" },
  { id: 26, name: "HCMC University of Education", region: "South", students: 30000, faculty: 1500, founded: 1957, type: "Public" },
  { id: 27, name: "An Giang University", region: "South", students: 18000, faculty: 900, founded: 2000, type: "Public" },
  { id: 28, name: "Dong Thap University", region: "South", students: 12000, faculty: 600, founded: 2008, type: "Public" },
  { id: 29, name: "Tra Vinh University", region: "South", students: 10000, faculty: 500, founded: 2006, type: "Public" }
];

const regionColors = { North: "#e74c3c", Central: "#3498db", South: "#27ae60" };

const getColorByFaculty = (faculty, region) => {
  const maxFaculty = 3000;
  const minFaculty = 400;
  const intensity = (faculty - minFaculty) / (maxFaculty - minFaculty);
  const baseColor = regionColors[region];
  const rgb = baseColor.match(/\w\w/g).map(x => parseInt(x, 16));
  const newRgb = rgb.map(c => Math.round(c + (255 - c) * (1 - intensity)));
  return `rgb(${newRgb[0]}, ${newRgb[1]}, ${newRgb[2]})`;
};

function App() {
  const [regionFilter, setRegionFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUniversity, setSelectedUniversity] = useState(null);
  const networkRef = useRef(null);
  const containerRef = useRef(null);

  const stats = useMemo(() => {
    const total = universitiesData.reduce((sum, u) => sum + u.students, 0);
    return {
      total: universitiesData.length,
      totalStudents: total,
      avgStudents: Math.round(total / universitiesData.length)
    };
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    const nodes = [];
    const edges = [];

    ['North', 'Central', 'South'].forEach(region => {
      nodes.push({
        id: `region_${region}`,
        label: region,
        color: { background: regionColors[region], border: regionColors[region] },
        size: 60,
        font: { size: 24, color: '#ffffff' },
        shape: 'box'
      });
    });

    universitiesData.forEach(uni => {
      const size = 10 + (uni.students / 55000) * 40;
      const bgColor = getColorByFaculty(uni.faculty, uni.region);
      nodes.push({
        id: uni.id,
        label: uni.name.substring(0, 30),
        color: { background: bgColor, border: regionColors[uni.region] },
        size: size,
        title: `${uni.name}\nStudents: ${uni.students.toLocaleString()}\nFaculty: ${uni.faculty.toLocaleString()}`,
        ...uni
      });
      edges.push({ from: `region_${uni.region}`, to: uni.id, color: regionColors[uni.region] + '66' });
    });

    universitiesData.forEach(uni => {
      const sameRegion = universitiesData.filter(u => u.region === uni.region && u.id !== uni.id);
      sameRegion.slice(0, 2).forEach(other => {
        if (uni.id < other.id) {
          edges.push({ from: uni.id, to: other.id, color: '#cccccc', width: 1, dashes: true });
        }
      });
    });

    const data = { nodes, edges };
    const options = {
      nodes: { shape: 'dot', font: { size: 14 }, borderWidth: 2, shadow: true },
      edges: { width: 2, smooth: { type: 'continuous' } },
      physics: { barnesHut: { gravitationalConstant: -2000, springLength: 200 }, stabilization: { iterations: 1000 } },
      interaction: { hover: true, zoomView: true, dragView: true }
    };

    networkRef.current = new Network(containerRef.current, data, options);

    networkRef.current.on('click', (params) => {
      if (params.nodes.length > 0) {
        const nodeId = params.nodes[0];
        const node = nodes.find(n => n.id === nodeId);
        if (node && !node.id.toString().startsWith('region_')) {
          setSelectedUniversity(node);
        }
      }
    });

    networkRef.current.on('stabilizationIterationsDone', () => {
      networkRef.current.setOptions({ physics: false });
    });

    return () => {
      if (networkRef.current) networkRef.current.destroy();
    };
  }, []);

  const applyFilters = () => {
    if (!networkRef.current) return;
    
    let filtered = universitiesData;
    if (regionFilter !== 'all') {
      filtered = filtered.filter(u => u.region === regionFilter);
    }
    if (searchTerm) {
      filtered = filtered.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()));
      if (filtered.length > 0) {
        networkRef.current.selectNodes(filtered.map(u => u.id));
        networkRef.current.fit({ nodes: filtered.map(u => u.id), animation: { duration: 1000 } });
      }
    }
  };

  return (
    <div className="container">
      <div className="header">
        <h1>🎓 Vietnam Universities Network</h1>
        <p>Interactive visualization of university connections by region</p>
      </div>

      <div className="controls-panel">
        <div className="control-group">
          <label>Region:</label>
          <select value={regionFilter} onChange={(e) => setRegionFilter(e.target.value)}>
            <option value="all">All Regions</option>
            <option value="North">North</option>
            <option value="Central">Central</option>
            <option value="South">South</option>
          </select>
        </div>
        <div className="control-group">
          <label>Search:</label>
          <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="University name..." />
        </div>
        <button className="btn" onClick={applyFilters}>Apply</button>
        <button className="btn" onClick={() => { setRegionFilter('all'); setSearchTerm(''); setSelectedUniversity(null); }}>Reset</button>
      </div>

      <div className="main-content">
        <div ref={containerRef} id="network"></div>

        <div className="stats-bar">
          <div className="stat-item">
            <div className="value">{stats.total}</div>
            <div className="label">Universities</div>
          </div>
          <div className="stat-item">
            <div className="value">{stats.totalStudents.toLocaleString()}</div>
            <div className="label">Total Students</div>
          </div>
          <div className="stat-item">
            <div className="value">{stats.avgStudents.toLocaleString()}</div>
            <div className="label">Avg Students</div>
          </div>
        </div>

        <div className="legend">
          <h4>Legend</h4>
          <div className="legend-item">
            <div className="legend-color" style={{ background: '#e74c3c' }}></div>
            <div className="legend-label">North Region</div>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ background: '#3498db' }}></div>
            <div className="legend-label">Central Region</div>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ background: '#27ae60' }}></div>
            <div className="legend-label">South Region</div>
          </div>
        </div>

        {selectedUniversity && (
          <div className="info-panel">
            <button className="close-btn" onClick={() => setSelectedUniversity(null)}>×</button>
            <h3>{selectedUniversity.name}</h3>
            <div className="info-item"><strong>Region</strong><span>{selectedUniversity.region}</span></div>
            <div className="info-item"><strong>Students</strong><span>{selectedUniversity.students.toLocaleString()}</span></div>
            <div className="info-item"><strong>Faculty</strong><span>{selectedUniversity.faculty.toLocaleString()}</span></div>
            <div className="info-item"><strong>Founded</strong><span>{selectedUniversity.founded}</span></div>
            <div className="info-item"><strong>Type</strong><span>{selectedUniversity.type}</span></div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
