import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer
} from 'recharts';
import './App.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

// Color palette
const COLORS = {
  red: '#e50914',
  darkRed: '#b81d24',
  blue: '#3498db',
  green: '#2ecc71',
  yellow: '#f1c40f',
  purple: '#9b59b6',
  teal: '#1abc9c',
  orange: '#e67e22'
};

const PIE_COLORS = [COLORS.red, COLORS.blue];
const BAR_COLORS = [COLORS.red, COLORS.green, COLORS.blue, COLORS.yellow, COLORS.purple, COLORS.teal, COLORS.orange];

function App() {
  const [stats, setStats] = useState(null);
  const [topDirectors, setTopDirectors] = useState(null);
  const [typeDistribution, setTypeDistribution] = useState(null);
  const [topCategories, setTopCategories] = useState(null);
  const [sampleData, setSampleData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [statsRes, directorsRes, typeRes, categoriesRes, sampleRes] = await Promise.all([
        axios.get(`${BACKEND_URL}/api/stats`),
        axios.get(`${BACKEND_URL}/api/top-directors`),
        axios.get(`${BACKEND_URL}/api/type-distribution`),
        axios.get(`${BACKEND_URL}/api/top-categories`),
        axios.get(`${BACKEND_URL}/api/sample-data`)
      ]);

      setStats(statsRes.data);
      setTopDirectors(directorsRes.data);
      setTypeDistribution(typeRes.data);
      setTopCategories(categoriesRes.data);
      setSampleData(sampleRes.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Error al cargar los datos. Por favor, recargue la página.');
    } finally {
      setLoading(false);
    }
  };

  // Transform data for charts
  const getDirectorsChartData = () => {
    if (!topDirectors) return [];
    return topDirectors.directors.map((director, index) => ({
      name: director.length > 20 ? director.substring(0, 20) + '...' : director,
      fullName: director,
      value: topDirectors.counts[index]
    }));
  };

  const getPieChartData = () => {
    if (!typeDistribution) return [];
    return typeDistribution.labels.map((label, index) => ({
      name: label,
      value: typeDistribution.values[index],
      percentage: typeDistribution.percentages[index]
    }));
  };

  const getCategoriesChartData = () => {
    if (!topCategories) return [];
    return topCategories.categories.map((category, index) => ({
      name: category.length > 25 ? category.substring(0, 25) + '...' : category,
      fullName: category,
      value: topCategories.counts[index]
    }));
  };

  const getBarChartData = () => {
    if (!typeDistribution) return [];
    return typeDistribution.labels.map((label, index) => ({
      name: label,
      value: typeDistribution.values[index]
    }));
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{data.fullName || label}</p>
          <p className="tooltip-value">Cantidad: {payload[0].value.toLocaleString()}</p>
        </div>
      );
    }
    return null;
  };

  const PieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{payload[0].name}</p>
          <p className="tooltip-value">{payload[0].value.toLocaleString()} ({payload[0].payload.percentage}%)</p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="loading-container" data-testid="loading-screen">
        <div className="spinner"></div>
        <p>Cargando datos de Netflix...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container" data-testid="error-screen">
        <h2>⚠️ Error</h2>
        <p>{error}</p>
        <button onClick={fetchAllData} data-testid="retry-button">Reintentar</button>
      </div>
    );
  }

  return (
    <div className="dashboard" data-testid="netflix-dashboard">
      {/* Header */}
      <header className="header" data-testid="dashboard-header">
        <h1>🎬 Netflix Data Analysis Dashboard</h1>
        <p className="subtitle">Visualización interactiva del dataset de Netflix</p>
      </header>

      {/* Metrics Cards */}
      <section className="metrics-section" data-testid="metrics-section">
        <div className="metric-card" data-testid="metric-total">
          <span className="metric-icon">🎬</span>
          <h3>Total de Títulos</h3>
          <p className="metric-value">{stats?.total_titles?.toLocaleString() || 0}</p>
        </div>
        <div className="metric-card" data-testid="metric-movies">
          <span className="metric-icon">🎥</span>
          <h3>Películas</h3>
          <p className="metric-value">{stats?.movies_count?.toLocaleString() || 0}</p>
        </div>
        <div className="metric-card" data-testid="metric-shows">
          <span className="metric-icon">📺</span>
          <h3>Series TV</h3>
          <p className="metric-value">{stats?.shows_count?.toLocaleString() || 0}</p>
        </div>
        <div className="metric-card" data-testid="metric-directors">
          <span className="metric-icon">🎬</span>
          <h3>Directores</h3>
          <p className="metric-value">{stats?.directors_count?.toLocaleString() || 0}</p>
        </div>
      </section>

      {/* Chart 1: Top 10 Directors */}
      <section className="chart-section" data-testid="directors-chart-section">
        <h2>🏆 Top 10 Directores con más títulos</h2>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={getDirectorsChartData()}
              layout="vertical"
              margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis type="number" stroke="#fff" />
              <YAxis 
                dataKey="name" 
                type="category" 
                stroke="#fff" 
                width={90}
                tick={{ fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="value" 
                fill={COLORS.red} 
                radius={[0, 4, 4, 0]}
                name="Número de títulos"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Chart 2: Movies vs TV Shows */}
      <section className="chart-section" data-testid="type-distribution-section">
        <h2>📊 Distribución: Películas vs Series TV</h2>
        <div className="comparison-charts">
          <div className="chart-half">
            <h3>Gráfico de Torta</h3>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={getPieChartData()}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name}: ${percentage}%`}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {getPieChartData().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="chart-half">
            <h3>Gráfico de Barras</h3>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={getBarChartData()} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="name" stroke="#fff" />
                <YAxis stroke="#fff" />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} name="Cantidad">
                  {getBarChartData().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Chart 3: Top 5 Categories */}
      <section className="chart-section" data-testid="categories-chart-section">
        <h2>🏷️ Top 5 Categorías (Listed In)</h2>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={getCategoriesChartData()}
              layout="vertical"
              margin={{ top: 20, right: 30, left: 150, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis type="number" stroke="#fff" />
              <YAxis 
                dataKey="name" 
                type="category" 
                stroke="#fff" 
                width={140}
                tick={{ fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} name="Número de títulos">
                {getCategoriesChartData().map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Data Table */}
      <section className="table-section" data-testid="data-table-section">
        <h2>📝 Vista previa de los datos (primeras 10 filas)</h2>
        <div className="table-container">
          <table data-testid="data-table">
            <thead>
              <tr>
                <th>Título</th>
                <th>Tipo</th>
                <th>Director</th>
                <th>País</th>
                <th>Año</th>
              </tr>
            </thead>
            <tbody>
              {sampleData?.data?.map((item, index) => (
                <tr key={index}>
                  <td>{item.title}</td>
                  <td className={item.type === 'Movie' ? 'type-movie' : 'type-show'}>
                    {item.type === 'Movie' ? 'Película' : 'Serie TV'}
                  </td>
                  <td>{item.director || 'Desconocido'}</td>
                  <td>{item.country}</td>
                  <td>{item.release_year}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer" data-testid="dashboard-footer">
        <p>Dashboard creado para Data Mining Project | Netflix Data Analysis</p>
        <p className="timestamp">Actualizado: {new Date().toLocaleString('es-ES')}</p>
      </footer>
    </div>
  );
}

export default App;
