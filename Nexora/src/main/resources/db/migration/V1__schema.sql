-- ============================================================
-- V1: Initial Nexora schema
-- ============================================================

CREATE TABLE divisions (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(120) NOT NULL UNIQUE,
    bn_name     VARCHAR(160)
);

CREATE TABLE districts (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(120) NOT NULL,
    bn_name     VARCHAR(160),
    division_id BIGINT NOT NULL REFERENCES divisions(id) ON DELETE CASCADE,
    UNIQUE (name, division_id)
);

CREATE TABLE thanas (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(120) NOT NULL,
    bn_name     VARCHAR(160),
    district_id BIGINT NOT NULL REFERENCES districts(id) ON DELETE CASCADE,
    UNIQUE (name, district_id)
);

CREATE TABLE super_admins (
    id            BIGSERIAL PRIMARY KEY,
    name          VARCHAR(100) NOT NULL,
    email         VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role          VARCHAR(40)  NOT NULL DEFAULT 'ROLE_SUPER_ADMIN',
    created_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    is_active     BOOLEAN      NOT NULL DEFAULT TRUE
);

CREATE TABLE ngos (
    id                BIGSERIAL PRIMARY KEY,
    name              VARCHAR(150) NOT NULL,
    email             VARCHAR(150) NOT NULL UNIQUE,
    password_hash     VARCHAR(255) NOT NULL,
    registration_no   VARCHAR(100) NOT NULL UNIQUE,
    logo_url          VARCHAR(500),
    phone             VARCHAR(20)  NOT NULL,
    website           VARCHAR(200),
    division_id       BIGINT NOT NULL REFERENCES divisions(id),
    district_id       BIGINT REFERENCES districts(id),
    thana_id          BIGINT REFERENCES thanas(id),
    status            VARCHAR(20)  NOT NULL DEFAULT 'PENDING',
    rejection_reason  VARCHAR(500),
    approved_at       TIMESTAMP WITH TIME ZONE,
    approved_by       BIGINT,
    created_at        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    is_active         BOOLEAN      NOT NULL DEFAULT TRUE
);

CREATE TABLE volunteers (
    id                  BIGSERIAL PRIMARY KEY,
    name                VARCHAR(100) NOT NULL,
    email               VARCHAR(150) NOT NULL UNIQUE,
    password_hash       VARCHAR(255),
    phone               VARCHAR(20)  NOT NULL,
    nid                 VARCHAR(30),
    date_of_birth       DATE,
    gender              VARCHAR(10)  NOT NULL,
    division_id         BIGINT REFERENCES divisions(id),
    district_id         BIGINT REFERENCES districts(id),
    thana_id            BIGINT REFERENCES thanas(id),
    status              VARCHAR(30)  NOT NULL DEFAULT 'ACTIVE',
    must_set_password   BOOLEAN      NOT NULL DEFAULT FALSE,
    recruited_by_ngo_id BIGINT REFERENCES ngos(id),
    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    is_active           BOOLEAN      NOT NULL DEFAULT TRUE
);

CREATE TABLE volunteer_skills (
    volunteer_id BIGINT NOT NULL REFERENCES volunteers(id) ON DELETE CASCADE,
    skill        VARCHAR(60) NOT NULL,
    PRIMARY KEY (volunteer_id, skill)
);

CREATE TABLE disaster_events (
    id                   BIGSERIAL PRIMARY KEY,
    ngo_id               BIGINT NOT NULL REFERENCES ngos(id),
    title                VARCHAR(200) NOT NULL,
    type                 VARCHAR(20) NOT NULL,
    severity             VARCHAR(20) NOT NULL,
    description          TEXT,
    start_at             TIMESTAMP WITH TIME ZONE NOT NULL,
    end_at               TIMESTAMP WITH TIME ZONE NOT NULL,
    required_volunteers  INT NOT NULL,
    status               VARCHAR(20) NOT NULL DEFAULT 'OPEN',
    created_at           TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    is_active            BOOLEAN     NOT NULL DEFAULT TRUE
);

CREATE TABLE event_divisions (
    event_id    BIGINT NOT NULL REFERENCES disaster_events(id) ON DELETE CASCADE,
    division_id BIGINT NOT NULL REFERENCES divisions(id) ON DELETE CASCADE,
    PRIMARY KEY (event_id, division_id)
);

CREATE TABLE event_districts (
    event_id    BIGINT NOT NULL REFERENCES disaster_events(id) ON DELETE CASCADE,
    district_id BIGINT NOT NULL REFERENCES districts(id) ON DELETE CASCADE,
    PRIMARY KEY (event_id, district_id)
);

CREATE TABLE event_thanas (
    event_id BIGINT NOT NULL REFERENCES disaster_events(id) ON DELETE CASCADE,
    thana_id BIGINT NOT NULL REFERENCES thanas(id) ON DELETE CASCADE,
    PRIMARY KEY (event_id, thana_id)
);

CREATE TABLE event_invitations (
    id           BIGSERIAL PRIMARY KEY,
    event_id     BIGINT NOT NULL REFERENCES disaster_events(id) ON DELETE CASCADE,
    volunteer_id BIGINT NOT NULL REFERENCES volunteers(id) ON DELETE CASCADE,
    ngo_id       BIGINT NOT NULL REFERENCES ngos(id),
    status       VARCHAR(20) NOT NULL DEFAULT 'INVITED',
    responded_at TIMESTAMP WITH TIME ZONE,
    created_at   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    is_active    BOOLEAN     NOT NULL DEFAULT TRUE,
    UNIQUE (event_id, volunteer_id)
);

CREATE TABLE bulk_upload_batches (
    id            BIGSERIAL PRIMARY KEY,
    ngo_id        BIGINT NOT NULL REFERENCES ngos(id),
    filename      VARCHAR(255) NOT NULL,
    total_rows    INT NOT NULL,
    success_count INT NOT NULL,
    failed_count  INT NOT NULL,
    errors_json   TEXT,
    created_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    is_active     BOOLEAN     NOT NULL DEFAULT TRUE
);

CREATE INDEX idx_districts_division ON districts(division_id);
CREATE INDEX idx_thanas_district ON thanas(district_id);
CREATE INDEX idx_volunteers_division ON volunteers(division_id);
CREATE INDEX idx_volunteers_district ON volunteers(district_id);
CREATE INDEX idx_volunteers_thana ON volunteers(thana_id);
CREATE INDEX idx_ngos_status ON ngos(status);
CREATE INDEX idx_events_ngo ON disaster_events(ngo_id);
CREATE INDEX idx_invitations_event ON event_invitations(event_id);
CREATE INDEX idx_invitations_volunteer ON event_invitations(volunteer_id);
