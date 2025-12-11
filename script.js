// Variables globales
let netflixData = [];
let moviesCount = 0;
let showsCount = 0;

// Colores para gráficos
const chartColors = {
    red: '#e50914',
    darkRed: '#b81d24',
    gray: '#757575',
    lightGray: '#cccccc',
    blue: '#007bff',
    green: '#28a745',
    yellow: '#ffc107',
    teal: '#20c997',
    purple: '#6f42c1',
    pink: '#e83e8c'
};

// Inicializar dashboard
document.addEventListener('DOMContentLoaded', function() {
    // Mostrar fecha actual
    document.getElementById('timestamp').textContent = `Actualizado: ${new Date().toLocaleString()}`;
    
    // Cargar datos del CSV
    loadCSVData();
});

// Función para cargar el CSV
async function loadCSVData() {
    try {
        const response = await fetch('netflix-titles.csv');
        const csvText = await response.text();
        
        Papa.parse(csvText, {
            header: true,
            dynamicTyping: true,
            complete: function(results) {
                netflixData = results.data;
                processData();
            },
            error: function(error) {
                console.error('Error cargando CSV:', error);
                alert('Error al cargar el archivo CSV. Verifica que netflix-titles.csv esté en la misma carpeta.');
            }
        });
    } catch (error) {
        console.error('Error:', error);
        alert('No se pudo cargar el archivo CSV.');
    }
}

// Procesar datos y crear visualizaciones
function processData() {
    // 1. Calcular métricas
    calculateMetrics();
    
    // 2. Top 10 Directores
    createDirectorsChart();
    
    // 3. Películas vs Series
    createTypeCharts();
    
    // 4. Top 5 Categorías
    createCategoriesChart();
    
    // 5. Mostrar tabla de datos
    populateDataTable();
}

// Calcular métricas
function calculateMetrics() {
    // Total de títulos
    const totalTitles = netflixData.length;
    
    // Contar películas y series
    moviesCount = netflixData.filter(item => item.type === 'Movie').length;
    showsCount = netflixData.filter(item => item.type === 'TV Show').length;
    
    // Contar directores únicos
    const directors = netflixData
        .map(item => item.director)
        .filter(director => director && director !== 'Unknown' && director !== '');
    const uniqueDirectors = [...new Set(directors)].length;
    
    // Actualizar métricas en la interfaz
    document.getElementById('total-titles').textContent = totalTitles.toLocaleString();
    document.getElementById('total-movies').textContent = moviesCount.toLocaleString();
    document.getElementById('total-shows').textContent = showsCount.toLocaleString();
    document.getElementById('total-directors').textContent = uniqueDirectors.toLocaleString();
}

// 1. Gráfico de Top 10 Directores
function createDirectorsChart() {
    // Contar directores
    const directorCounts = {};
    
    netflixData.forEach(item => {
        const director = item.director;
        if (director && director !== 'Unknown' && director !== '') {
            // Algunos registros tienen múltiples directores separados por coma
            const directors = director.split(',').map(d => d.trim());
            directors.forEach(d => {
                directorCounts[d] = (directorCounts[d] || 0) + 1;
            });
        }
    });
    
    // Ordenar y tomar los 10 primeros
    const sortedDirectors = Object.entries(directorCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);
    
    const directorNames = sortedDirectors.map(item => item[0]);
    const directorValues = sortedDirectors.map(item => item[1]);
    
    // Crear gráfico
    const ctx = document.getElementById('directorsChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: directorNames,
            datasets: [{
                label: 'Número de títulos',
                data: directorValues,
                backgroundColor: Array(10).fill(chartColors.red).map((color, i) => 
                    `rgba(${parseInt(color.slice(1, 3), 16)}, ${parseInt(color.slice(3, 5), 16)}, ${parseInt(color.slice(5, 7), 16)}, ${0.7 + i * 0.03})`
                ),
                borderColor: chartColors.darkRed,
                borderWidth: 1
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
                        text: 'Número de títulos'
                    }
                },
                y: {
                    ticks: {
                        autoSkip: false
                    }
                }
            }
        }
    });
}

// 2. Gráficos de Películas vs Series
function createTypeCharts() {
    // Datos para gráficos
    const typeLabels = ['Películas', 'Series TV'];
    const typeData = [moviesCount, showsCount];
    
    // Colores
    const typeColors = [chartColors.red, chartColors.blue];
    
    // Gráfico de torta
    const pieCtx = document.getElementById('typePieChart').getContext('2d');
    new Chart(pieCtx, {
        type: 'pie',
        data: {
            labels: typeLabels,
            datasets: [{
                data: typeData,
                backgroundColor: typeColors,
                borderColor: ['white', 'white'],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = moviesCount + showsCount;
                            const percentage = Math.round((value / total) * 100);
                            return `${label}: ${value} (${percentage}%)`;
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
                borderColor: typeColors.map(color => color.replace('0.8', '1')),
                borderWidth: 1
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
                    callbacks: {
                        label: function(context) {
                            return `Cantidad: ${context.raw}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Cantidad de títulos'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Tipo'
                    }
                }
            }
        }
    });
}

// 3. Gráfico de Top 5 Categorías
function createCategoriesChart() {
    // Extraer y contar categorías
    const categoryCounts = {};
    
    netflixData.forEach(item => {
        const categories = item.listed_in;
        if (categories) {
            // Dividir por coma y limpiar
            const categoryList = categories.split(',').map(cat => cat.trim());
            categoryList.forEach(cat => {
                categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
            });
        }
    });
    
    // Ordenar y tomar los 5 primeros
    const sortedCategories = Object.entries(categoryCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
    
    const categoryNames = sortedCategories.map(item => item[0]);
    const categoryValues = sortedCategories.map(item => item[1]);
    
    // Crear gráfico
    const ctx = document.getElementById('categoriesChart').getContext('2d');
    new Chart(ctx, {
        type: 'horizontalBar',
        data: {
            labels: categoryNames,
            datasets: [{
                label: 'Número de títulos',
                data: categoryValues,
                backgroundColor: [
                    chartColors.red,
                    chartColors.green,
                    chartColors.blue,
                    chartColors.yellow,
                    chartColors.purple
                ],
                borderColor: [
                    chartColors.darkRed,
                    '#1e7e34',
                    '#0056b3',
                    '#d39e00',
                    '#59359a'
                ],
                borderWidth: 1
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
                        text: 'Número de títulos'
                    }
                },
                y: {
                    ticks: {
                        autoSkip: false
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
    
    // Tomar solo las primeras 10 filas
    const first10 = netflixData.slice(0, 10);
    
    first10.forEach(item => {
        const row = document.createElement('tr');
        
        // Título
        const titleCell = document.createElement('td');
        titleCell.textContent = item.title || 'N/A';
        row.appendChild(titleCell);
        
        // Tipo
        const typeCell = document.createElement('td');
        typeCell.textContent = item.type || 'N/A';
        if (item.type === 'Movie') {
            typeCell.style.color = chartColors.red;
            typeCell.style.fontWeight = 'bold';
        } else {
            typeCell.style.color = chartColors.blue;
            typeCell.style.fontWeight = 'bold';
        }
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