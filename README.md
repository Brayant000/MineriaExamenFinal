# 🎬 Netflix Data Analysis Dashboard

Dashboard interactivo de visualización de datos del catálogo de Netflix.

## 📊 Visualizaciones

Este dashboard incluye las siguientes visualizaciones:

1. **Top 10 Directores** - Gráfico de barras horizontal mostrando los directores con más títulos en Netflix
2. **Películas vs Series TV** - Comparación con gráfico de torta y barras
3. **Top 5 Categorías** - Las categorías (listed_in) más populares
4. **Tabla de Datos** - Vista previa de los primeros 10 registros

## 📈 Métricas Principales

- Total de Títulos: 6,234
- Películas: 4,265 (68.4%)
- Series TV: 1,969 (31.6%)
- Directores únicos: 3,655

## 🛠 Tecnologías Utilizadas

- **HTML5** - Estructura
- **CSS3** - Estilos con diseño dark mode tipo Netflix
- **JavaScript** - Lógica y procesamiento de datos
- **Chart.js 4.x** - Visualizaciones interactivas
- **PapaParse** - Parseo del archivo CSV
- **Font Awesome** - Iconos

## 📁 Estructura del Proyecto

```
/
├── index.html          # Página principal
├── script.js           # Lógica JavaScript
├── styles.css          # Estilos CSS
├── netflix-titles.csv  # Dataset de Netflix
└── README.md           # Este archivo
```

## 🚀 Despliegue en GitHub Pages

1. Sube todos los archivos a un repositorio de GitHub
2. Ve a Settings > Pages
3. Selecciona la rama `main` y la carpeta `/ (root)`
4. Guarda y espera unos minutos
5. Tu dashboard estará disponible en: `https://tu-usuario.github.io/tu-repositorio/`

## 📋 Dataset

El dataset `netflix-titles.csv` contiene información del catálogo de Netflix incluyendo:
- show_id, type, title, director, cast, country
- date_added, release_year, rating, duration
- listed_in, description

## 👨‍💻 Autor

Dashboard creado para Data Mining Project - Netflix Data Analysis
