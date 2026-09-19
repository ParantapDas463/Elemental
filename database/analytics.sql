-- ============================================
-- PS02 - Analytics Queries
-- Critical Mineral Patent Intelligence
-- ============================================


-- ============================================
-- 1. OVERALL PATENT LANDSCAPE
-- ============================================

-- Total number of patents
SELECT COUNT(*) AS total_patents
FROM patents;


-- Total number of minerals
SELECT COUNT(*) AS total_minerals
FROM minerals;


-- Total number of processes
SELECT COUNT(*) AS total_processes
FROM processes;


-- Total number of technologies
SELECT COUNT(*) AS total_technologies
FROM technologies;


-- ============================================
-- 2. PATENT ACTIVITY BY MINERAL
-- ============================================

SELECT
    m.name AS mineral,
    COUNT(DISTINCT pm.patent_id) AS patent_count
FROM minerals m
JOIN patent_minerals pm
    ON m.id = pm.mineral_id
GROUP BY m.id, m.name
ORDER BY patent_count DESC;


-- ============================================
-- 3. PATENT ACTIVITY BY PROCESS
-- ============================================

SELECT
    pr.name AS process,
    COUNT(DISTINCT pp.patent_id) AS patent_count
FROM processes pr
JOIN patent_processes pp
    ON pr.id = pp.process_id
GROUP BY pr.id, pr.name
ORDER BY patent_count DESC;


-- ============================================
-- 4. PATENT ACTIVITY BY TECHNOLOGY
-- ============================================

SELECT
    t.name AS technology,
    COUNT(DISTINCT pt.patent_id) AS patent_count
FROM technologies t
JOIN patent_technologies pt
    ON t.id = pt.technology_id
GROUP BY t.id, t.name
ORDER BY patent_count DESC;


-- ============================================
-- 5. MONTHLY PATENT ACTIVITY
--    Last 12 months of available data
-- ============================================

WITH date_range AS (
    SELECT
        MAX(publication_date) AS latest_date
    FROM patents
    WHERE publication_date IS NOT NULL
)

SELECT
    DATE_TRUNC('month', p.publication_date)::date AS month,
    COUNT(*) AS patent_count
FROM patents p
CROSS JOIN date_range d
WHERE p.publication_date >=
      DATE_TRUNC('month', d.latest_date) - INTERVAL '11 months'
  AND p.publication_date <= d.latest_date
GROUP BY month
ORDER BY month;


-- ============================================
-- 6. PATENT ACTIVITY BY SOURCE
-- ============================================

SELECT
    source,
    COUNT(*) AS patent_count
FROM patents
GROUP BY source
ORDER BY patent_count DESC;