# ELEMENTAL — Critical Minerals Intelligence Platform

A data-driven intelligence platform developed for **CMIH Problem Statement 02** to support the discovery, analysis, and visualization of critical-mineral-related patents, R&D projects, technologies, processes, applications, and research institutions.

## Overview

Critical-mineral information is distributed across multiple datasets and public sources. CMIH PS02 brings this information together into a unified platform for exploration and analysis.

The platform allows users to:

- Explore critical minerals and their associated technologies
- Analyse patent activity
- Analyse R&D activity and projects
- Identify leading research institutions
- Search and filter projects and patents
- Explore mineral-technology relationships
- Explore mineral-process relationships
- Analyse institutional research activity
- Compare research trends
- Identify areas of research activity and potential gaps

## Key Features

### Interactive Dashboard

- Overview of critical-mineral activity
- Key statistics and indicators
- Interactive visualizations
- Search and filtering
- Mineral and technology analytics

### Mineral Intelligence

- Mineral-wise R&D activity
- Patent activity by mineral
- Mineral-technology relationships
- Mineral-process relationships
- Distribution of mineral-related research

### Patent Intelligence

- Patent database
- Patent search
- Mineral classification
- Technology classification
- Process classification
- Application classification
- Patent activity analysis
- Patent trend visualization

### R&D Intelligence

- Registered R&D projects
- Project-wise mineral classification
- Technology classification
- Process classification
- Application classification
- Principal investigator information
- Project submission information
- Research institution analysis

### Organisations & Institutions

- Leading R&D institutions
- Institutional project activity
- Institution-wise research distribution
- Identification of organisations working in critical-mineral areas

### Search & Filtering

Users can explore the dataset using filters such as:

- Mineral
- Technology
- Process
- Application
- Institution
- Project
- Patent

## Technology Stack

### Frontend

- React
- Vite
- JavaScript
- Recharts
- Lucide React
- CSS
- Supabase JavaScript Client

### Backend and Data Processing

- Python
- FastAPI
- Pandas
- NumPy
- Scikit-learn
- Requests
- BeautifulSoup
- LXML
- NLTK
- spaCy

### Database

- PostgreSQL
- Supabase

### Deployment

- Vercel for frontend deployment
- Cloud-based Python backend
- Supabase PostgreSQL database

## System Architecture

The platform follows a layered architecture:

    Public Data Sources
            |
            v
    Data Collection
            |
            v
    Data Cleaning & Normalization
            |
            v
    NLP Classification
            |
            v
    Structured Data
            |
            v
    Supabase PostgreSQL
            |
            v
    Backend / API
            |
            v
    React Web Dashboard
            |
            v
        End Users

## Data Processing Pipeline

The data pipeline follows these stages:

1. Data collection
2. Data cleaning
3. Data normalization
4. NLP-based classification
5. Entity extraction
6. Structured dataset generation
7. Database integration
8. Dashboard visualization

The classification pipeline identifies:

- Minerals
- Technologies
- Processes
- Applications

## NLP Classification

The platform uses an NLP-based classification pipeline to identify relevant entities from project and patent information.

### Minerals

Examples include:

- Lithium
- Cobalt
- Nickel
- Copper
- Titanium
- Silicon
- Rare Earth Elements
- Graphite
- Indium
- Other critical minerals

### Technologies

Examples include:

- Beneficiation
- Hydrometallurgy
- Pyrometallurgy
- Coating
- Electrostatic Separation
- E-Waste Processing
- Oxidation
- Recycling

### Processes

Examples include:

- Extraction
- Separation
- Refining
- Recovery
- Recycling
- Processing

### Applications

Examples include:

- Batteries
- Energy Storage
- Electronics
- Defence
- Renewable Energy
- Advanced Materials

The classification pipeline can be improved over time as additional labelled data becomes available.

## Database Structure

The platform uses a relational PostgreSQL database.

### Core Tables

- `projects`
- `patents`
- `minerals`
- `technologies`
- `processes`
- `applications`

### Project Relationship Tables

- `project_minerals`
- `project_technologies`
- `project_processes`
- `project_applications`
- `project_investigators`

### Patent Relationship Tables

- `patent_minerals`
- `patent_technologies`
- `patent_processes`

The relationship tables allow multiple minerals, technologies, processes, and applications to be associated with a single project or patent.

## Data Sources

The platform is designed around publicly available information.

Primary data categories include:

- Public patent information
- Indian government R&D project information
- Public research and institutional information

Collected data is processed and classified before being integrated into the platform.

## Project Structure

    ELEMENTAL/
    |
    +-- src/
    |   |
    |   +-- App.jsx
    |   +-- App.css
    |   +-- index.css
    |   +-- main.jsx
    |   |
    |   +-- lib/
    |       |
    |       +-- supabase.js
    |
    +-- public/
    |
    +-- package.json
    +-- package-lock.json
    +-- vite.config.js
    +-- index.html
    +-- .gitignore
    +-- README.md

If the backend and data-processing pipeline are included in the same repository, they can additionally be organized as:

    ELEMENTAL/
    |
    +-- frontend/
    |
    +-- backend/
    |
    +-- collectors/
    |
    +-- processors/
    |
    +-- README.md

## Installation

### Prerequisites

Make sure the following are installed:

- Node.js
- npm
- Python 3.10+
- Git

### Frontend Installation

Clone the repository:

    git clone <repository-url>
    cd ELEMENTAL

Install frontend dependencies:

    npm install

Start the development server:

    npm run dev

The Vite development server will provide a local URL.

### Backend Installation

Create a Python virtual environment:

    python -m venv venv

On Windows:

    venv\Scripts\activate

On Linux/macOS:

    source venv/bin/activate

Install Python dependencies:

    pip install -r requirements.txt

Start the FastAPI backend:

    uvicorn main:app --reload

## Environment Variables

Create a `.env` file for local development.

Example:

    VITE_SUPABASE_URL=your_supabase_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

Backend environment variables can also be configured according to the deployment environment.

Do not commit secret credentials or private API keys to GitHub.

## Production Build

Build the frontend:

    npm run build

Preview the production build:

    npm run preview

The production frontend is generated in the `dist` directory.

## Deployment

The frontend can be deployed using Vercel or another modern frontend hosting platform.

Typical deployment flow:

    GitHub
       |
       v
    Vercel
       |
       +-- Install dependencies
       |
       +-- Run production build
       |
       +-- Deploy
       |
       v
    Public Web Application
       |
       v
    Supabase PostgreSQL

The backend can be deployed separately using a cloud platform capable of running Python/FastAPI applications.

## Security

A production public-sector deployment should implement appropriate security controls, including:

- HTTPS
- Environment variables
- Authentication
- Role-based access control
- Supabase Row Level Security where appropriate
- Secure API endpoints
- Database access controls
- Regular backups
- Monitoring
- Audit logs
- Rate limiting
- Input validation

Administrative functions should only be accessible to authorized users.

## Admin Panel

A production version can provide a dedicated administrative panel.

Possible administrative functions include:

- User management
- Role management
- Project management
- Patent management
- Data verification
- Data import
- Data updates
- Classification review
- Institution management
- Dataset monitoring
- System monitoring
- Audit logs

Possible roles include:

- Super Administrator
- Data Administrator
- Department Officer
- Analyst
- Viewer

Administrative access should be separated from normal public access.

## Scalability

The platform is designed to scale from a prototype to a larger institutional deployment.

Potential scaling capabilities include:

- Larger patent datasets
- Larger R&D datasets
- Automated data ingestion
- Scheduled data updates
- Improved NLP classification
- AI-assisted research discovery
- Increased database capacity
- API access
- Authentication
- Role-based administration
- Load balancing
- Caching
- Automated monitoring

## Expected Deployment Scale

A representative public-sector deployment scenario can target approximately:

**5,000 daily users**

This corresponds to approximately:

- 150,000 user visits per month
- Multiple institutional users
- Regular data updates
- Search and analytics workloads
- Public dashboard access
- Administrative access for authorized personnel

Actual capacity depends on infrastructure configuration and usage patterns.

## Estimated Deployment Cost

For a public-sector deployment supporting approximately 5,000 daily users, a preliminary first-year estimate is:

**₹8–16 lakh per year**

This may include:

- Cloud infrastructure
- Database and storage
- Data processing
- AI/NLP/API usage
- Security
- Monitoring
- Backups
- Maintenance
- Technical support
- Administrative infrastructure

Actual procurement and operational costs will depend on infrastructure, government security requirements, data volume, API usage, and support requirements.

## Potential Users

The platform can support:

- Government departments
- Public-sector organisations
- Research institutions
- Universities
- Industry
- Technology developers
- Policy analysts
- Research analysts
- Critical-mineral stakeholders

## Potential Applications

### Research Discovery

Identify projects, patents, technologies, and institutions working on specific critical minerals.

### Technology Mapping

Understand which technologies and processes are associated with different minerals.

### R&D Intelligence

Analyse the distribution and concentration of R&D activities.

### Patent Intelligence

Study patent activity across critical minerals and technology categories.

### Institutional Analysis

Identify institutions involved in critical-mineral research.

### Decision Support

Provide structured information that can assist researchers, institutions, and policymakers in understanding the critical-mineral research landscape.

## Innovation

The platform combines multiple dimensions of critical-mineral intelligence into a unified system:

    Minerals
        +
    Patents
        +
    R&D Projects
        +
    Technologies
        +
    Processes
        +
    Applications
        +
    Institutions
        |
        v
    Critical Minerals Intelligence

This allows users to move beyond isolated datasets and explore relationships between different areas of the critical-mineral ecosystem.

## Future Development

Possible future enhancements include:

1. Automated patent updates
2. Automated R&D project updates
3. Advanced NLP classification
4. AI-assisted search
5. Semantic search
6. Research recommendation system
7. Technology trend analysis
8. Institution collaboration mapping
9. Geographic research mapping
10. Advanced analytics
11. Government API integration
12. Secure institutional login
13. Role-based admin dashboard
14. Public API for authorized users
15. Automated data-quality monitoring

## Limitations

Current limitations may include:

- Dependence on availability and quality of public data
- NLP classification may require further validation
- Some information may be incomplete or inconsistently structured
- Data sources may change their formats or access mechanisms
- Automated classification may require human verification for edge cases

The platform is intended to improve continuously as additional data and validation become available.

## GitHub

The following should be included in the repository:

- `package.json`
- `package-lock.json`
- `src/`
- `public/`
- `vite.config.js`
- `index.html`
- `.gitignore`
- `README.md`

The following should NOT be committed:

- `node_modules/`
- `dist/`
- `.env`
- `.env.local`

Dependencies can be recreated using:

    npm install

## License

This project is developed as part of the **CMIH PS02** project.

An appropriate open-source or institutional license should be added before public release.

## Project Status

**Status: Prototype / Development**

The platform is being developed toward a scalable critical-minerals intelligence system capable of supporting public-sector, research, and institutional use.

## Acknowledgement

This project was developed for **CMIH Problem Statement 02** and focuses on applying data engineering, NLP, database systems, and interactive visualization to the critical-minerals domain.
