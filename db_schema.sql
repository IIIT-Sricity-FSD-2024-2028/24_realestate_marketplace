-- =============================================================================
--  TruEstate Platform — Database Schema (MariaDB Compatible)
-- =============================================================================

CREATE DATABASE IF NOT EXISTS real_estate;
USE real_estate;

-- =============================================================================
--  SECTION 1 : USER BASE & ROLE PROFILES
-- =============================================================================

CREATE TABLE users (
    user_id         CHAR(36)        PRIMARY KEY DEFAULT (UUID()),
    full_name       VARCHAR(150)    NOT NULL,
    email           VARCHAR(255)    NOT NULL UNIQUE,
    phone           VARCHAR(20)     NOT NULL UNIQUE,
    password_hash   VARCHAR(255)    NOT NULL,
    role            ENUM('buyer','seller','agent','admin') NOT NULL,
    profile_photo   VARCHAR(500),
    date_of_birth   DATE,
    gender          ENUM('male','female','other'),
    address         TEXT,
    city            VARCHAR(100),
    state           VARCHAR(100),
    zip_code        VARCHAR(20),
    is_blocked      TINYINT(1)      NOT NULL DEFAULT 0,
    is_verified     TINYINT(1)      NOT NULL DEFAULT 0,
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE buyer_profiles (
    buyer_profile_id        CHAR(36)        PRIMARY KEY DEFAULT (UUID()),
    user_id                 CHAR(36)        NOT NULL UNIQUE,
    preferred_property_type VARCHAR(50),
    max_budget              DECIMAL(15,2),
    preferred_location      TEXT,
    purchase_intent         ENUM('buy','rent'),
    properties_viewed       INT             NOT NULL DEFAULT 0,
    shortlisted_count       INT             NOT NULL DEFAULT 0,
    site_visits_count       INT             NOT NULL DEFAULT 0,
    created_at              DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at              DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_buyer_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE seller_profiles (
    seller_profile_id   CHAR(36)        PRIMARY KEY DEFAULT (UUID()),
    user_id             CHAR(36)        NOT NULL UNIQUE,
    is_verified_seller  TINYINT(1)      NOT NULL DEFAULT 0,
    seller_since        DATE,
    bank_account_number VARCHAR(50),
    bank_name           VARCHAR(100),
    ifsc_code           VARCHAR(20),
    total_listings      INT             NOT NULL DEFAULT 0,
    active_listings     INT             NOT NULL DEFAULT 0,
    created_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_seller_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE agent_profiles (
    agent_profile_id    CHAR(36)        PRIMARY KEY DEFAULT (UUID()),
    user_id             CHAR(36)        NOT NULL UNIQUE,
    license_number      VARCHAR(50)     NOT NULL UNIQUE,
    agency_name         VARCHAR(150),
    specialization      VARCHAR(100),
    rating              DECIMAL(3,2)    DEFAULT 0.00,
    properties_listed   INT             NOT NULL DEFAULT 0,
    properties_sold     INT             NOT NULL DEFAULT 0,
    is_active           TINYINT(1)      NOT NULL DEFAULT 1,
    created_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_agent_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE admin_profiles (
    admin_profile_id    CHAR(36)        PRIMARY KEY DEFAULT (UUID()),
    user_id             CHAR(36)        NOT NULL UNIQUE,
    admin_id_code       VARCHAR(30)     NOT NULL UNIQUE,
    department          VARCHAR(100),
    permissions_level   ENUM('standard','super') NOT NULL DEFAULT 'standard',
    platform_since      DATE,
    created_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_admin_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);


-- =============================================================================
--  SECTION 2 : PROPERTY MANAGEMENT
-- =============================================================================

CREATE TABLE properties (
    property_id     CHAR(36)        PRIMARY KEY DEFAULT (UUID()),
    seller_id       CHAR(36)        NOT NULL,
    title           VARCHAR(255)    NOT NULL,
    property_type   ENUM('apartment','villa','house','plot','commercial','farmhouse','studio','penthouse') NOT NULL,
    listing_type    ENUM('sale','rent') NOT NULL,
    address         TEXT            NOT NULL,
    city            VARCHAR(100)    NOT NULL,
    state           VARCHAR(100)    NOT NULL,
    pincode         VARCHAR(10)     NOT NULL,
    area_sqft       DECIMAL(10,2)   NOT NULL,
    bedrooms        INT,
    bathrooms       INT,
    price           DECIMAL(15,2)   NOT NULL,
    furnishing      ENUM('unfurnished','semi-furnished','fully-furnished'),
    parking         VARCHAR(20),
    facing          VARCHAR(20),
    floor_number    VARCHAR(20),
    total_floors    INT,
    property_age    VARCHAR(20),
    description     TEXT,
    status          ENUM('draft','pending_review','approved','rejected','sold','rented') NOT NULL DEFAULT 'draft',
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_property_seller FOREIGN KEY (seller_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE property_photos (
    photo_id        CHAR(36)        PRIMARY KEY DEFAULT (UUID()),
    property_id     CHAR(36)        NOT NULL,
    photo_url       VARCHAR(500)    NOT NULL,
    is_main_photo   TINYINT(1)      NOT NULL DEFAULT 0,
    uploaded_at     DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_photo_property FOREIGN KEY (property_id) REFERENCES properties(property_id) ON DELETE CASCADE
);

CREATE TABLE property_documents (
    doc_id          CHAR(36)        PRIMARY KEY DEFAULT (UUID()),
    property_id     CHAR(36)        NOT NULL,
    doc_type        ENUM('property_deed','floor_plan','inspection_report','encumbrance_certificate','other') NOT NULL,
    file_url        VARCHAR(500)    NOT NULL,
    file_size_mb    DECIMAL(6,2),
    verified_status ENUM('pending','verified','rejected') NOT NULL DEFAULT 'pending',
    uploaded_at     DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_doc_property FOREIGN KEY (property_id) REFERENCES properties(property_id) ON DELETE CASCADE
);

CREATE TABLE admin_reviews (
    review_id           CHAR(36)        PRIMARY KEY DEFAULT (UUID()),
    property_id         CHAR(36)        NOT NULL,
    admin_id            CHAR(36)        NOT NULL,
    decision            ENUM('approved','rejected') NOT NULL,
    rejection_reason    TEXT,
    reviewed_at         DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_review_property FOREIGN KEY (property_id) REFERENCES properties(property_id) ON DELETE CASCADE,
    CONSTRAINT fk_review_admin    FOREIGN KEY (admin_id)    REFERENCES users(user_id)
);

CREATE TABLE property_shortlist (
    shortlist_id    CHAR(36)        PRIMARY KEY DEFAULT (UUID()),
    buyer_id        CHAR(36)        NOT NULL,
    property_id     CHAR(36)        NOT NULL,
    added_at        DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_buyer_property (buyer_id, property_id),
    CONSTRAINT fk_shortlist_buyer    FOREIGN KEY (buyer_id)    REFERENCES users(user_id)      ON DELETE CASCADE,
    CONSTRAINT fk_shortlist_property FOREIGN KEY (property_id) REFERENCES properties(property_id) ON DELETE CASCADE
);

CREATE TABLE system_activity_logs (
    log_id          CHAR(36)        PRIMARY KEY DEFAULT (UUID()),
    admin_id        CHAR(36),
    user_id         CHAR(36),
    action_type     VARCHAR(50)     NOT NULL,
    target_entity   VARCHAR(50),
    target_id       CHAR(36),
    details         TEXT,
    risk_level      ENUM('low','moderate','high','critical'),
    logged_at       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_log_admin FOREIGN KEY (admin_id) REFERENCES users(user_id) ON DELETE SET NULL,
    CONSTRAINT fk_log_user  FOREIGN KEY (user_id)  REFERENCES users(user_id) ON DELETE SET NULL
);


-- =============================================================================
--  SECTION 3 : SITE VISIT & SCHEDULING
-- =============================================================================

CREATE TABLE site_visit_requests (
    visit_request_id        CHAR(36)        PRIMARY KEY DEFAULT (UUID()),
    buyer_id                CHAR(36)        NOT NULL,
    property_id             CHAR(36)        NOT NULL,
    agent_id                CHAR(36),
    seller_id               CHAR(36)        NOT NULL,
    preferred_date          DATE            NOT NULL,
    preferred_time_slot     VARCHAR(20),
    message_to_agent        TEXT,
    visit_status            ENUM('pending','confirmed','rescheduled','completed','cancelled') NOT NULL DEFAULT 'pending',
    scheduled_date          DATE,
    scheduled_start_time    TIME,
    scheduled_end_time      TIME,
    reschedule_reason       TEXT,
    confirmed_at            DATETIME,
    completed_at            DATETIME,
    created_at              DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_visit_buyer    FOREIGN KEY (buyer_id)    REFERENCES users(user_id),
    CONSTRAINT fk_visit_property FOREIGN KEY (property_id) REFERENCES properties(property_id),
    CONSTRAINT fk_visit_agent    FOREIGN KEY (agent_id)    REFERENCES users(user_id) ON DELETE SET NULL,
    CONSTRAINT fk_visit_seller   FOREIGN KEY (seller_id)   REFERENCES users(user_id)
);

CREATE TABLE visit_status_history (
    status_id           CHAR(36)        PRIMARY KEY DEFAULT (UUID()),
    visit_request_id    CHAR(36)        NOT NULL,
    updated_by          CHAR(36)        NOT NULL,
    old_status          VARCHAR(20),
    new_status          VARCHAR(20)     NOT NULL,
    note                TEXT,
    updated_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_vstatus_visit FOREIGN KEY (visit_request_id) REFERENCES site_visit_requests(visit_request_id) ON DELETE CASCADE,
    CONSTRAINT fk_vstatus_user  FOREIGN KEY (updated_by)        REFERENCES users(user_id)
);

CREATE TABLE negotiations (
    negotiation_id          CHAR(36)        PRIMARY KEY DEFAULT (UUID()),
    buyer_id                CHAR(36)        NOT NULL,
    seller_id               CHAR(36)        NOT NULL,
    property_id             CHAR(36)        NOT NULL,
    agent_id                CHAR(36),
    initial_offer_amount    DECIMAL(15,2)   NOT NULL,
    current_offer           DECIMAL(15,2),
    counter_amount          DECIMAL(15,2),
    financing_type          ENUM('cash','mortgage','loan','other'),
    proposed_close_date     DATE,
    offer_type              ENUM('purchase','rent'),
    status                  ENUM('in_negotiation','accepted','declined','withdrawn','completed') NOT NULL DEFAULT 'in_negotiation',
    created_at              DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at              DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_neg_buyer    FOREIGN KEY (buyer_id)    REFERENCES users(user_id),
    CONSTRAINT fk_neg_seller   FOREIGN KEY (seller_id)   REFERENCES users(user_id),
    CONSTRAINT fk_neg_property FOREIGN KEY (property_id) REFERENCES properties(property_id),
    CONSTRAINT fk_neg_agent    FOREIGN KEY (agent_id)    REFERENCES users(user_id) ON DELETE SET NULL
);

CREATE TABLE agent_assignments (
    assignment_id       CHAR(36)        PRIMARY KEY DEFAULT (UUID()),
    agent_id            CHAR(36)        NOT NULL,
    visit_request_id    CHAR(36),
    negotiation_id      CHAR(36),
    assigned_at         DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status              ENUM('active','completed','cancelled') NOT NULL DEFAULT 'active',
    CONSTRAINT fk_assign_agent      FOREIGN KEY (agent_id)         REFERENCES users(user_id),
    CONSTRAINT fk_assign_visit      FOREIGN KEY (visit_request_id) REFERENCES site_visit_requests(visit_request_id) ON DELETE SET NULL,
    CONSTRAINT fk_assign_neg        FOREIGN KEY (negotiation_id)   REFERENCES negotiations(negotiation_id) ON DELETE SET NULL
);

CREATE TABLE buyer_offer_history (
    offer_history_id    CHAR(36)        PRIMARY KEY DEFAULT (UUID()),
    negotiation_id      CHAR(36)        NOT NULL,
    buyer_id            CHAR(36)        NOT NULL,
    offered_price       DECIMAL(15,2)   NOT NULL,
    response            ENUM('accepted','countered','declined','pending') DEFAULT 'pending',
    responded_at        DATETIME,
    CONSTRAINT fk_offer_neg   FOREIGN KEY (negotiation_id) REFERENCES negotiations(negotiation_id) ON DELETE CASCADE,
    CONSTRAINT fk_offer_buyer FOREIGN KEY (buyer_id)       REFERENCES users(user_id)
);


-- =============================================================================
--  SECTION 4 : TRANSACTION & NOTIFICATIONS
-- =============================================================================

CREATE TABLE transactions (
    transaction_id      CHAR(36)        PRIMARY KEY DEFAULT (UUID()),
    negotiation_id      CHAR(36)        NOT NULL UNIQUE,
    buyer_id            CHAR(36)        NOT NULL,
    seller_id           CHAR(36)        NOT NULL,
    agent_id            CHAR(36),
    final_amount        DECIMAL(15,2)   NOT NULL,
    payment_status      ENUM('pending','processing','completed','failed','refunded') NOT NULL DEFAULT 'pending',
    payment_method      VARCHAR(30),
    transaction_ref     VARCHAR(100)    UNIQUE,
    initiated_at        DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at        DATETIME,
    receipt_url         VARCHAR(500),
    CONSTRAINT fk_txn_negotiation FOREIGN KEY (negotiation_id) REFERENCES negotiations(negotiation_id),
    CONSTRAINT fk_txn_buyer       FOREIGN KEY (buyer_id)       REFERENCES users(user_id),
    CONSTRAINT fk_txn_seller      FOREIGN KEY (seller_id)      REFERENCES users(user_id),
    CONSTRAINT fk_txn_agent       FOREIGN KEY (agent_id)       REFERENCES users(user_id) ON DELETE SET NULL
);

CREATE TABLE notifications (
    notif_id        CHAR(36)        PRIMARY KEY DEFAULT (UUID()),
    user_id         CHAR(36)        NOT NULL,
    type            ENUM(
                        'listing_approved','listing_rejected',
                        'visit_confirmed','visit_cancelled','visit_rescheduled',
                        'offer_received','offer_countered','offer_accepted','offer_declined',
                        'transaction_initiated','transaction_completed',
                        'new_buyer_request','agent_assigned',
                        'account_blocked','account_unblocked','system_alert'
                    ) NOT NULL,
    title           VARCHAR(150)    NOT NULL,
    message         TEXT            NOT NULL,
    reference_id    CHAR(36),
    reference_type  VARCHAR(50),
    action_url      VARCHAR(300),
    is_read         TINYINT(1)      NOT NULL DEFAULT 0,
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notif_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);


-- =============================================================================
--  SECTION 5 : INDEXES
-- =============================================================================

CREATE INDEX idx_users_role           ON users(role);
CREATE INDEX idx_users_is_blocked     ON users(is_blocked);
CREATE INDEX idx_properties_seller    ON properties(seller_id);
CREATE INDEX idx_properties_status    ON properties(status);
CREATE INDEX idx_properties_city      ON properties(city);
CREATE INDEX idx_properties_type      ON properties(property_type);
CREATE INDEX idx_properties_price     ON properties(price);
CREATE INDEX idx_shortlist_buyer      ON property_shortlist(buyer_id);
CREATE INDEX idx_shortlist_property   ON property_shortlist(property_id);
CREATE INDEX idx_visits_buyer         ON site_visit_requests(buyer_id);
CREATE INDEX idx_visits_property      ON site_visit_requests(property_id);
CREATE INDEX idx_visits_agent         ON site_visit_requests(agent_id);
CREATE INDEX idx_visits_status        ON site_visit_requests(visit_status);
CREATE INDEX idx_neg_buyer            ON negotiations(buyer_id);
CREATE INDEX idx_neg_seller           ON negotiations(seller_id);
CREATE INDEX idx_neg_property         ON negotiations(property_id);
CREATE INDEX idx_neg_status           ON negotiations(status);
CREATE INDEX idx_txn_buyer            ON transactions(buyer_id);
CREATE INDEX idx_txn_seller           ON transactions(seller_id);
CREATE INDEX idx_txn_status           ON transactions(payment_status);
CREATE INDEX idx_notif_user           ON notifications(user_id);
CREATE INDEX idx_notif_is_read        ON notifications(is_read);
CREATE INDEX idx_log_admin            ON system_activity_logs(admin_id);
CREATE INDEX idx_log_risk             ON system_activity_logs(risk_level);

-- =============================================================================
--  END OF SCHEMA
-- =============================================================================
