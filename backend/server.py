from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
import csv
from collections import defaultdict
from typing import List, Dict, Any

app = FastAPI(title="Netflix Dashboard API", version="1.0.0")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variable to store Netflix data
netflix_data: List[Dict[str, Any]] = []

def load_csv_data():
    """Load Netflix CSV data on startup"""
    global netflix_data
    csv_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'netflix-titles.csv')
    
    try:
        with open(csv_path, 'r', encoding='utf-8') as file:
            reader = csv.DictReader(file)
            netflix_data = [row for row in reader if row.get('title')]
        print(f"Loaded {len(netflix_data)} Netflix titles")
    except Exception as e:
        print(f"Error loading CSV: {e}")
        netflix_data = []

# Load data on startup
load_csv_data()

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "total_titles": len(netflix_data)}

@app.get("/api/stats")
async def get_stats():
    """Get general statistics about the Netflix dataset"""
    if not netflix_data:
        load_csv_data()
    
    movies_count = sum(1 for item in netflix_data if item.get('type') == 'Movie')
    shows_count = sum(1 for item in netflix_data if item.get('type') == 'TV Show')
    
    # Get unique directors
    directors = set()
    for item in netflix_data:
        director = item.get('director', '')
        if director and director.strip():
            for d in director.split(','):
                d_clean = d.strip()
                if d_clean:
                    directors.add(d_clean)
    
    return {
        "total_titles": len(netflix_data),
        "movies_count": movies_count,
        "shows_count": shows_count,
        "directors_count": len(directors)
    }

@app.get("/api/top-directors")
async def get_top_directors(limit: int = 10):
    """Get top directors by number of titles"""
    if not netflix_data:
        load_csv_data()
    
    director_counts = defaultdict(int)
    
    for item in netflix_data:
        director = item.get('director', '')
        if director and director.strip():
            # Split multiple directors
            for d in director.split(','):
                d_clean = d.strip()
                if d_clean:
                    director_counts[d_clean] += 1
    
    # Sort and get top N
    sorted_directors = sorted(director_counts.items(), key=lambda x: x[1], reverse=True)[:limit]
    
    return {
        "directors": [d[0] for d in sorted_directors],
        "counts": [d[1] for d in sorted_directors]
    }

@app.get("/api/type-distribution")
async def get_type_distribution():
    """Get distribution of Movies vs TV Shows"""
    if not netflix_data:
        load_csv_data()
    
    movies_count = sum(1 for item in netflix_data if item.get('type') == 'Movie')
    shows_count = sum(1 for item in netflix_data if item.get('type') == 'TV Show')
    
    return {
        "labels": ["Películas", "Series TV"],
        "values": [movies_count, shows_count],
        "percentages": [
            round(movies_count / (movies_count + shows_count) * 100, 1) if (movies_count + shows_count) > 0 else 0,
            round(shows_count / (movies_count + shows_count) * 100, 1) if (movies_count + shows_count) > 0 else 0
        ]
    }

@app.get("/api/top-categories")
async def get_top_categories(limit: int = 5):
    """Get top categories (listed_in) by number of titles"""
    if not netflix_data:
        load_csv_data()
    
    category_counts = defaultdict(int)
    
    for item in netflix_data:
        categories = item.get('listed_in', '')
        if categories and categories.strip():
            # Split multiple categories
            for cat in categories.split(','):
                cat_clean = cat.strip()
                if cat_clean:
                    category_counts[cat_clean] += 1
    
    # Sort and get top N
    sorted_categories = sorted(category_counts.items(), key=lambda x: x[1], reverse=True)[:limit]
    
    return {
        "categories": [c[0] for c in sorted_categories],
        "counts": [c[1] for c in sorted_categories]
    }

@app.get("/api/sample-data")
async def get_sample_data(limit: int = 10):
    """Get sample data for table display"""
    if not netflix_data:
        load_csv_data()
    
    sample = netflix_data[:limit]
    
    return {
        "data": [
            {
                "title": item.get('title', 'N/A'),
                "type": item.get('type', 'N/A'),
                "director": item.get('director', 'Desconocido'),
                "country": item.get('country', 'N/A'),
                "release_year": item.get('release_year', 'N/A')
            }
            for item in sample
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
