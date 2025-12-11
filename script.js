// Variables globales
let netflixData = [];
let moviesCount = 0;
let showsCount = 0;

// Colores para gráficos
const chartColors = {
    red: '#e50914',
    darkRed: '#b81d24',
    blue: '#3498db',
    green: '#2ecc71',
    yellow: '#f1c40f',
    purple: '#9b59b6',
    teal: '#1abc9c',
    orange: '#e67e22'
};

// Configuración global de Chart.js para texto blanco
Chart.defaults.color = '#fff';
Chart.defaults.borderColor = 'rgba(255, 255, 255, 0.1)';

// Inicializar dashboard
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('timestamp').textContent = `Actualizado: ${new Date().toLocaleString('es-ES')}`;
    loadCSVData();
});

// Función para cargar el CSV
async function loadCSVData() {
    try {
        const response = await fetch('netflix-titles.csv');
        if (!response.ok) {
            throw new Error('No se pudo cargar el archivo CSV');
        }
        const csvText = await response.text();
        
        Papa.parse(csvText, {
            header: true,
            skipEmptyLines: true,
            complete: function(results) {
                netflixData = results.data.filter(row => row.title && row.title.trim() !== '');
                console.log(`Cargados ${netflixData.length} títulos de Netflix`);
                
                // Ocultar loading y mostrar dashboard
                document.getElementById('loading').style.display = 'none';
                document.getElementById('dashboard-content').style.display = 'block';
                
                processData();
            },
            error: function(error) {
                console.error('Error parseando CSV:', error);
                showError('Error al parsear el archivo CSV.');
            }
        });
    } catch (error) {
        console.error('Error:', error);
        showError('No se pudo cargar el archivo CSV. Asegúrese de que netflix-titles.csv esté en el mismo directorio.');
    }
}

function showError(message) {
    document.getElementById('loading').innerHTML = `
        <div style="text-align: center; color: #e50914;">
            <h2>⚠️ Error</h2>
            <p style="color: #ccc;">${message}</p>
            <button onclick="location.reload()" style="margin-top: 20px; padding: 12px 30px; background: #e50914; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 1rem;">Reintentar</button>
        </div>
    `;
}

// Procesar datos y crear visualizaciones
function processData() {
    calculateMetrics();
    createDirectorsChart();
    createTypeCharts();
    createCategoriesChart();
    populateDataTable();
}

// Calcular métricas
function calculateMetrics() {
    const totalTitles = netflixData.length;
    
    moviesCount = netflixData.filter(item => item.type === 'Movie').length;
    showsCount = netflixData.filter(item => item.type === 'TV Show').length;
    
    // Contar directores únicos
    const directors = new Set();
    netflixData.forEach(item => {
        const director = item.director;
        if (director && director.trim() !== '') {
            director.split(',').forEach(d => {
                const cleaned = d.trim();
                if (cleaned) directors.add(cleaned);
            });
        }
    });
    
    // Actualizar métricas en la interfaz
    document.getElementById('total-titles').textContent = totalTitles.toLocaleString();
    document.getElementById('total-movies').textContent = moviesCount.toLocaleString();
    document.getElementById('total-shows').textContent = showsCount.toLocaleString();
    document.getElementById('total-directors').textContent = directors.size.toLocaleString();
}

// 1. Gráfico de Top 10 Directores
function createDirectorsChart() {
    const directorCounts = {};
    
    netflixData.forEach(item => {
        const director = item.director;
        if (director && director.trim() !== '') {
            director.split(',').forEach(d => {
                const cleaned = d.trim();
                if (cleaned) {
                    directorCounts[cleaned] = (directorCounts[cleaned] || 0) + 1;
                }
            });
        }
    });
    
    // Ordenar y tomar los 10 primeros
    const sortedDirectors = Object.entries(directorCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);
    
    const directorNames = sortedDirectors.map(item => item[0]);
    const directorValues = sortedDirectors.map(item => item[1]);
    
    const ctx = document.getElementById('directorsChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: directorNames,
            datasets: [{
                label: 'Número de títulos',
                data: directorValues,
                backgroundColor: chartColors.red,
                borderColor: chartColors.darkRed,
                borderWidth: 1,
                borderRadius: 4
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: '#1a1a2e',
                    titleColor: '#fff',
                    bodyColor: '#e50914',
                    borderColor: '#e50914',
                    borderWidth: 1,
                    callbacks: {
                        label: function(context) {
                            return `Títulos: ${context.raw}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Número de títulos',
                        color: '#8892b0'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: '#ccc'
                    }
                },
                y: {
                    ticks: {
                        color: '#ccc',
                        font: {
                            size: 11
                        }
                    },
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// 2. Gráficos de Películas vs Series
function createTypeCharts() {
    const typeLabels = ['Películas', 'Series TV'];
    const typeData = [moviesCount, showsCount];
    const typeColors = [chartColors.red, chartColors.blue];
    const total = moviesCount + showsCount;
    
    // Gráfico de torta
    const pieCtx = document.getElementById('typePieChart').getContext('2d');
    new Chart(pieCtx, {
        type: 'pie',
        data: {
            labels: typeLabels,
            datasets: [{
                data: typeData,
                backgroundColor: typeColors,
                borderColor: '#1a1a2e',
                borderWidth: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#fff',
                        padding: 20,
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    backgroundColor: '#1a1a2e',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: '#e50914',
                    borderWidth: 1,
                    callbacks: {
                        label: function(context) {
                            const value = context.raw;
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${context.label}: ${value.toLocaleString()} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
    
    // Gráfico de barras
    const barCtx = document.getElementById('typeBarChart').getContext('2d');
    new Chart(barCtx, {
        type: 'bar',
        data: {
            labels: typeLabels,
            datasets: [{
                label: 'Cantidad',
                data: typeData,
                backgroundColor: typeColors,
                borderColor: typeColors.map(c => c),
                borderWidth: 1,
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: '#1a1a2e',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: '#e50914',
                    borderWidth: 1,
                    callbacks: {
                        label: function(context) {
                            const value = context.raw;
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `Cantidad: ${value.toLocaleString()} (${percentage}%)`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Cantidad de títulos',
                        color: '#8892b0'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: '#ccc'
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: '#ccc'
                    }
                }
            }
        }
    });
}

// 3. Gráfico de Top 5 Categorías
function createCategoriesChart() {
    const categoryCounts = {};
    
    netflixData.forEach(item => {
        const categories = item.listed_in;
        if (categories && categories.trim() !== '') {
            categories.split(',').forEach(cat => {
                const cleaned = cat.trim();
                if (cleaned) {
                    categoryCounts[cleaned] = (categoryCounts[cleaned] || 0) + 1;
                }
            });
        }
    });
    
    // Ordenar y tomar los 5 primeros
    const sortedCategories = Object.entries(categoryCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
    
    const categoryNames = sortedCategories.map(item => item[0]);
    const categoryValues = sortedCategories.map(item => item[1]);
    
    const barColors = [
        chartColors.red,
        chartColors.green,
        chartColors.blue,
        chartColors.yellow,
        chartColors.purple
    ];
    
    const ctx = document.getElementById('categoriesChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: categoryNames,
            datasets: [{
                label: 'Número de títulos',
                data: categoryValues,
                backgroundColor: barColors,
                borderColor: barColors,
                borderWidth: 1,
                borderRadius: 4
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: '#1a1a2e',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: '#e50914',
                    borderWidth: 1,
                    callbacks: {
                        label: function(context) {
                            return `Títulos: ${context.raw.toLocaleString()}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Número de títulos',
                        color: '#8892b0'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: '#ccc'
                    }
                },
                y: {
                    ticks: {
                        color: '#ccc',
                        font: {
                            size: 11
                        }
                    },
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// 4. Poblar tabla con datos
function populateDataTable() {
    const tableBody = document.getElementById('table-body');
    tableBody.innerHTML = '';
    
    const first10 = netflixData.slice(0, 10);
    
    first10.forEach(item => {
        const row = document.createElement('tr');
        
        // Título
        const titleCell = document.createElement('td');
        titleCell.textContent = item.title || 'N/A';
        row.appendChild(titleCell);
        
        // Tipo
        const typeCell = document.createElement('td');
        const isMovie = item.type === 'Movie';
        typeCell.textContent = isMovie ? 'Película' : 'Serie TV';
        typeCell.className = isMovie ? 'type-movie' : 'type-show';
        row.appendChild(typeCell);
        
        // Director
        const directorCell = document.createElement('td');
        directorCell.textContent = item.director || 'Desconocido';
        row.appendChild(directorCell);
        
        // País
        const countryCell = document.createElement('td');
        countryCell.textContent = item.country || 'N/A';
        row.appendChild(countryCell);
        
        // Año
        const yearCell = document.createElement('td');
        yearCell.textContent = item.release_year || 'N/A';
        row.appendChild(yearCell);
        
        tableBody.appendChild(row);
    });
}
