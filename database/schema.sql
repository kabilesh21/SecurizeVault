-- MemoryVerse AI Database Schema
CREATE DATABASE IF NOT EXISTS memoryverse_ai;
USE memoryverse_ai;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'ROLE_STUDENT',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    icon VARCHAR(50)
);

-- Seed Categories with Icons
INSERT INTO categories (id, name, description, icon) VALUES
(1, 'CERTIFICATE', 'Academic and professional certifications', 'FiAward')
ON DUPLICATE KEY UPDATE description=VALUES(description), icon=VALUES(icon);

INSERT INTO categories (id, name, description, icon) VALUES
(2, 'RESUME', 'Student curriculum vitae and resumes', 'FiBookOpen')
ON DUPLICATE KEY UPDATE description=VALUES(description), icon=VALUES(icon);

INSERT INTO categories (id, name, description, icon) VALUES
(3, 'PROJECT_REPORT', 'Project documentation and reports', 'FiActivity')
ON DUPLICATE KEY UPDATE description=VALUES(description), icon=VALUES(icon);

INSERT INTO categories (id, name, description, icon) VALUES
(4, 'INTERNSHIP_LETTER', 'Offers and completion letters for internships', 'FiBriefcase')
ON DUPLICATE KEY UPDATE description=VALUES(description), icon=VALUES(icon);

INSERT INTO categories (id, name, description, icon) VALUES
(5, 'PORTFOLIO_LINK', 'Personal portfolio urls', 'FiLink')
ON DUPLICATE KEY UPDATE description=VALUES(description), icon=VALUES(icon);

INSERT INTO categories (id, name, description, icon) VALUES
(6, 'GITHUB_REPO', 'Repository links', 'FiGithub')
ON DUPLICATE KEY UPDATE description=VALUES(description), icon=VALUES(icon);

INSERT INTO categories (id, name, description, icon) VALUES
(7, 'OTHER_ACADEMIC', 'Other miscellaneous academic papers/marks cards', 'FiFileText')
ON DUPLICATE KEY UPDATE description=VALUES(description), icon=VALUES(icon);

INSERT INTO categories (id, name, description, icon) VALUES
(8, 'OTHER_PROFESSIONAL', 'Other miscellaneous work related documents', 'FiFolder')
ON DUPLICATE KEY UPDATE description=VALUES(description), icon=VALUES(icon);

-- 3. Documents Table
CREATE TABLE IF NOT EXISTS documents (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    stored_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(512) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    size BIGINT NOT NULL,
    category_id BIGINT,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    ocr_text LONGTEXT,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- 4. Document Categories
CREATE TABLE IF NOT EXISTS document_categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    document_id BIGINT NOT NULL,
    category_id BIGINT NOT NULL,
    confidence_score FLOAT NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    source VARCHAR(50) NOT NULL DEFAULT 'AI',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
    UNIQUE KEY unique_doc_category (document_id, category_id, source)
);

-- 5. Document Skills
CREATE TABLE IF NOT EXISTS document_skills (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    document_id BIGINT NOT NULL,
    skill_name VARCHAR(100) NOT NULL,
    confidence_score FLOAT NOT NULL,
    source VARCHAR(50) NOT NULL DEFAULT 'AI',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
);

-- 6. Extracted Entities
CREATE TABLE IF NOT EXISTS extracted_entities (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    document_id BIGINT NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_value VARCHAR(255) NOT NULL,
    confidence_score FLOAT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
);

-- 7. Categorization Results
CREATE TABLE IF NOT EXISTS categorization_results (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    document_id BIGINT NOT NULL UNIQUE,
    primary_category VARCHAR(50) NOT NULL,
    overall_confidence FLOAT NOT NULL,
    corrected_category_id BIGINT DEFAULT NULL,
    processing_status VARCHAR(50) NOT NULL,
    processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    processing_error TEXT,
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
    FOREIGN KEY (corrected_category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- 8. Graph Nodes Table
CREATE TABLE IF NOT EXISTS graph_nodes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    entity_type VARCHAR(50) NOT NULL, -- DOCUMENT, CERTIFICATE, SKILL, PROJECT, INTERNSHIP, ACHIEVEMENT, ORGANIZATION, TECHNOLOGY, PORTFOLIO, GITHUB_REPOSITORY, RESUME, CAREER_PATH, CATEGORY
    entity_reference_id BIGINT DEFAULT NULL, -- Nullable reference to original ID
    name VARCHAR(255) NOT NULL,
    normalized_name VARCHAR(255) NOT NULL,
    description TEXT,
    metadata_json TEXT,
    source_document_id BIGINT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (source_document_id) REFERENCES documents(id) ON DELETE SET NULL,
    UNIQUE KEY unique_user_node (user_id, entity_type, entity_reference_id, name)
);

-- 9. Graph Edges Table (Relationships)
CREATE TABLE IF NOT EXISTS graph_edges (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    source_node_id BIGINT NOT NULL,
    target_node_id BIGINT NOT NULL,
    relationship_type VARCHAR(50) NOT NULL, -- CERTIFIES, VALIDATES, DEMONSTRATES, USES, RELATED_TO, CONTRIBUTES_TO, SUPPORTS, APPLIED_IN, BUILT_DURING, COMPLETED_AT, ACHIEVED_IN, SHOWCASES, MENTIONS, PRECEDES, RECOMMENDS
    confidence_score FLOAT NOT NULL,
    evidence TEXT,
    generation_method VARCHAR(100) NOT NULL, -- AI_INFERRED, RULE_BASED, SEMANTIC_MATCH, MANUAL
    relationship_source VARCHAR(50) NOT NULL, -- AI_INFERRED, RULE_BASED, SEMANTIC_MATCH, USER_CREATED, USER_CONFIRMED, USER_CORRECTED
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, REJECTED, CONFIRMED
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (source_node_id) REFERENCES graph_nodes(id) ON DELETE CASCADE,
    FOREIGN KEY (target_node_id) REFERENCES graph_nodes(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_edge (user_id, source_node_id, target_node_id, relationship_type)
);

-- 10. Relationship Evidence Table
CREATE TABLE IF NOT EXISTS relationship_evidence (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    relationship_id BIGINT NOT NULL,
    document_id BIGINT,
    evidence_text TEXT NOT NULL,
    evidence_type VARCHAR(50) NOT NULL,
    relevance_score FLOAT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (relationship_id) REFERENCES graph_edges(id) ON DELETE CASCADE,
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE SET NULL
);

-- 11. Career Paths Table
CREATE TABLE IF NOT EXISTS career_paths (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    industry VARCHAR(255),
    required_skills TEXT, -- Comma-separated
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed Career Paths
INSERT INTO career_paths (id, name, description, industry, required_skills) VALUES
(1, 'AI/ML Engineer', 'Builds, trains, and deploys machine learning and deep learning models to solve complex business problems.', 'Artificial Intelligence', 'Python,TensorFlow,PyTorch,Machine Learning,Deep Learning,SQL,Go,Data Analysis')
ON DUPLICATE KEY UPDATE description=VALUES(description), required_skills=VALUES(required_skills);

INSERT INTO career_paths (id, name, description, industry, required_skills) VALUES
(2, 'Full Stack Developer', 'Designs and implements both client-side and server-side logic, managing data persistence, RESTful APIs, and frontend layouts.', 'Software Engineering', 'React,JavaScript,Java,Spring Boot,MySQL,HTML,CSS,TypeScript,Git')
ON DUPLICATE KEY UPDATE description=VALUES(description), required_skills=VALUES(required_skills);

INSERT INTO career_paths (id, name, description, industry, required_skills) VALUES
(3, 'Data Analyst', 'Analyzes datasets to identify trends, create visualizations, and generate actionable business insights.', 'Data Science', 'Python,SQL,MySQL,Data Analysis,Excel,Tableau')
ON DUPLICATE KEY UPDATE description=VALUES(description), required_skills=VALUES(required_skills);

INSERT INTO career_paths (id, name, description, industry, required_skills) VALUES
(4, 'Backend Developer', 'Develops robust server-side APIs, manages databases, and ensures system scalability and security.', 'Software Engineering', 'Java,Spring Boot,MySQL,Docker,Kubernetes,AWS,REST API,Git')
ON DUPLICATE KEY UPDATE description=VALUES(description), required_skills=VALUES(required_skills);

INSERT INTO career_paths (id, name, description, industry, required_skills) VALUES
(5, 'Frontend Developer', 'Creates responsive, interactive, and visually stunning web user interfaces using modern libraries and frameworks.', 'Software Engineering', 'React,TypeScript,JavaScript,HTML,CSS,Tailwind,Bootstrap,Next.js,Git')
ON DUPLICATE KEY UPDATE description=VALUES(description), required_skills=VALUES(required_skills);

-- 12. User Career Paths Table (Personalized Recommendations)
CREATE TABLE IF NOT EXISTS user_career_paths (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    career_path_id BIGINT NOT NULL,
    confidence_score FLOAT NOT NULL,
    reason TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'RECOMMENDED', -- RECOMMENDED, IN_PROGRESS, COMPLETED
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (career_path_id) REFERENCES career_paths(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_career (user_id, career_path_id)
);

-- Legacy Tables (preserved for integrity)
CREATE TABLE IF NOT EXISTS certificates (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    document_id BIGINT,
    title VARCHAR(255) NOT NULL,
    issuer VARCHAR(255) NOT NULL,
    issue_date DATE,
    expiry_date DATE,
    credential_id VARCHAR(100),
    credential_url VARCHAR(512),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS projects (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    document_id BIGINT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    technologies_used VARCHAR(512),
    repo_url VARCHAR(512),
    demo_url VARCHAR(512),
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS skills (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    proficiency_level VARCHAR(50) NOT NULL DEFAULT 'BEGINNER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_skill (user_id, name)
);

CREATE TABLE IF NOT EXISTS internships (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    document_id BIGINT,
    company_name VARCHAR(255) NOT NULL,
    role VARCHAR(100) NOT NULL,
    description TEXT,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS achievements (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    document_id BIGINT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    date_received DATE,
    organization VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE SET NULL
);

DROP TABLE IF EXISTS timeline;

CREATE TABLE IF NOT EXISTS timeline_events (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_type VARCHAR(50) NOT NULL,
    start_date DATE,
    end_date DATE,
    display_date VARCHAR(100),
    date_precision VARCHAR(50),
    date_source VARCHAR(50),
    importance_score INT DEFAULT 50,
    confidence_score FLOAT DEFAULT 1.0,
    organization VARCHAR(255),
    technologies_json TEXT,
    keywords_json TEXT,
    ai_summary TEXT,
    event_status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    is_user_created BOOLEAN DEFAULT FALSE,
    is_user_confirmed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS timeline_event_documents (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    timeline_event_id BIGINT NOT NULL,
    document_id BIGINT NOT NULL,
    FOREIGN KEY (timeline_event_id) REFERENCES timeline_events(id) ON DELETE CASCADE,
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS timeline_event_skills (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    timeline_event_id BIGINT NOT NULL,
    skill_id BIGINT NOT NULL,
    FOREIGN KEY (timeline_event_id) REFERENCES timeline_events(id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS timeline_event_relationships (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    timeline_event_id BIGINT NOT NULL,
    relationship_id BIGINT NOT NULL,
    FOREIGN KEY (timeline_event_id) REFERENCES timeline_events(id) ON DELETE CASCADE,
    FOREIGN KEY (relationship_id) REFERENCES graph_edges(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS timeline_insights (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    insight_type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    confidence_score FLOAT NOT NULL,
    related_event_ids VARCHAR(255),
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS timeline_milestones (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    timeline_event_id BIGINT NOT NULL,
    milestone_type VARCHAR(100) NOT NULL,
    label VARCHAR(255) NOT NULL,
    importance_score INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (timeline_event_id) REFERENCES timeline_events(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS timeline_user_preferences (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    timeline_layout VARCHAR(50) DEFAULT 'VERTICAL',
    show_low_importance BOOLEAN DEFAULT TRUE,
    minimum_importance INT DEFAULT 0,
    grouping_mode VARCHAR(50) DEFAULT 'YEAR',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_pref (user_id)
);


CREATE TABLE IF NOT EXISTS knowledge_graph (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    source_node VARCHAR(255) NOT NULL,
    target_node VARCHAR(255) NOT NULL,
    relationship_type VARCHAR(100) NOT NULL,
    weight FLOAT DEFAULT 1.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_relationship (user_id, source_node, target_node, relationship_type)
);

CREATE TABLE IF NOT EXISTS embeddings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    document_id BIGINT NOT NULL,
    chunk_text TEXT NOT NULL,
    embedding_vector_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS career_recommendations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    recommended_role VARCHAR(255) NOT NULL,
    match_score FLOAT NOT NULL,
    rationale TEXT,
    suggested_skills TEXT,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

DROP TABLE IF EXISTS search_history;
CREATE TABLE search_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    query VARCHAR(255) NOT NULL,
    detected_intent VARCHAR(50),
    result_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS search_index_status (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    document_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    index_status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    indexed_at TIMESTAMP NULL,
    embedding_version VARCHAR(50) DEFAULT 'all-MiniLM-L6-v2',
    last_error TEXT,
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_doc_index (document_id)
);

CREATE TABLE IF NOT EXISTS portfolio_links (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    platform_name VARCHAR(100) NOT NULL,
    url VARCHAR(512) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
