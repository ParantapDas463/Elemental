-- ============================================
-- PS02 - Critical Mineral Patent Intelligence
-- Database Schema
-- ============================================

-- ============================================
-- 1. PATENTS
-- ============================================

CREATE TABLE patents (
    id SERIAL PRIMARY KEY,
    application_number VARCHAR(50) UNIQUE NOT NULL,
    title TEXT NOT NULL,
    publication_number VARCHAR(50),
    publication_date DATE,
    filing_date DATE,
    field_of_invention VARCHAR(255),
    ipc TEXT,
    abstract TEXT,
    complete_specification TEXT,
    source VARCHAR(100) NOT NULL
);


-- ============================================
-- 2. MINERALS
-- ============================================

CREATE TABLE minerals (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL
);


-- ============================================
-- 3. PROCESSES
-- ============================================

CREATE TABLE processes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL
);


-- ============================================
-- 4. TECHNOLOGIES
-- ============================================

CREATE TABLE technologies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) UNIQUE NOT NULL
);


-- ============================================
-- 5. PATENT ↔ MINERAL
-- ============================================

CREATE TABLE patent_minerals (
    patent_id INTEGER NOT NULL,
    mineral_id INTEGER NOT NULL,

    PRIMARY KEY (patent_id, mineral_id),

    FOREIGN KEY (patent_id)
        REFERENCES patents(id)
        ON DELETE CASCADE,

    FOREIGN KEY (mineral_id)
        REFERENCES minerals(id)
        ON DELETE CASCADE
);


-- ============================================
-- 6. PATENT ↔ PROCESS
-- ============================================

CREATE TABLE patent_processes (
    patent_id INTEGER NOT NULL,
    process_id INTEGER NOT NULL,

    PRIMARY KEY (patent_id, process_id),

    FOREIGN KEY (patent_id)
        REFERENCES patents(id)
        ON DELETE CASCADE,

    FOREIGN KEY (process_id)
        REFERENCES processes(id)
        ON DELETE CASCADE
);


-- ============================================
-- 7. PATENT ↔ TECHNOLOGY
-- ============================================

CREATE TABLE patent_technologies (
    patent_id INTEGER NOT NULL,
    technology_id INTEGER NOT NULL,

    PRIMARY KEY (patent_id, technology_id),

    FOREIGN KEY (patent_id)
        REFERENCES patents(id)
        ON DELETE CASCADE,

    FOREIGN KEY (technology_id)
        REFERENCES technologies(id)
        ON DELETE CASCADE
);