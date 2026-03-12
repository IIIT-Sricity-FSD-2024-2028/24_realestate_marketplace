CREATE TABLE ADDRESS (
    address_id      INT             PRIMARY KEY AUTO_INCREMENT,
    address_line    VARCHAR(255)    NOT NULL,
    city            VARCHAR(100)    NOT NULL,
    state           VARCHAR(100)    NOT NULL,
    pin_code        VARCHAR(20)     NOT NULL,
    country         VARCHAR(100)    NOT NULL DEFAULT 'India'
);


CREATE TABLE USER (
    user_id         INT             PRIMARY KEY AUTO_INCREMENT,
    first_name      VARCHAR(100)    NOT NULL,
    last_name       VARCHAR(100)    NOT NULL,
    email           VARCHAR(255)    NOT NULL UNIQUE,
    phone           VARCHAR(20),
    password        VARCHAR(255)    NOT NULL,
    avatar_url      VARCHAR(500),
    address_id      INT,
    gender          ENUM('MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY'),
    date_of_birth   DATE,
    created_at      DATETIME        DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_user_address
        FOREIGN KEY (address_id) REFERENCES ADDRESS(address_id)
        ON DELETE SET NULL
);


CREATE TABLE BUYER (
    user_id         INT             PRIMARY KEY,
    profile_name    VARCHAR(150),
    bio             TEXT,
    member_since    DATETIME        DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_buyer_user
        FOREIGN KEY (user_id) REFERENCES USER(user_id)
        ON DELETE CASCADE
);


CREATE TABLE SELLER (
    user_id         INT             PRIMARY KEY,
    is_verified     BOOLEAN         DEFAULT FALSE,
    member_since    DATETIME        DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_seller_user
        FOREIGN KEY (user_id) REFERENCES USER(user_id)
        ON DELETE CASCADE
);


CREATE TABLE AGENT (
    user_id         INT             PRIMARY KEY,
    specialization  VARCHAR(200),
    bio             TEXT,
    member_since    DATETIME        DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_agent_user
        FOREIGN KEY (user_id) REFERENCES USER(user_id)
        ON DELETE CASCADE
);


CREATE TABLE ADMIN (
    user_id         INT             PRIMARY KEY,
    last_login      DATETIME,

    CONSTRAINT fk_admin_user
        FOREIGN KEY (user_id) REFERENCES USER(user_id)
        ON DELETE CASCADE
);


CREATE TABLE BANK (
    bank_id         INT             PRIMARY KEY AUTO_INCREMENT,
    bank_name       VARCHAR(200)    NOT NULL,
    bank_code       VARCHAR(50)     NOT NULL UNIQUE
);


CREATE TABLE BANK_ACCOUNT (
    bank_account_id         INT             PRIMARY KEY AUTO_INCREMENT,
    seller_id               INT             NOT NULL,
    bank_id                 INT             NOT NULL,
    account_holder_name     VARCHAR(200)    NOT NULL,
    account_number          VARCHAR(100)    NOT NULL,
    ifsc_code               VARCHAR(50)     NOT NULL,
    account_type            ENUM('SAVINGS', 'CURRENT', 'SALARY', 'NRI')
                                            NOT NULL DEFAULT 'SAVINGS',

    CONSTRAINT fk_bankaccount_seller
        FOREIGN KEY (seller_id) REFERENCES SELLER(user_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_bankaccount_bank
        FOREIGN KEY (bank_id) REFERENCES BANK(bank_id)
        ON DELETE RESTRICT
);


CREATE TABLE PROPERTY_TYPE (
    property_type_id    INT             PRIMARY KEY AUTO_INCREMENT,
    type_name           VARCHAR(100)    NOT NULL
);


CREATE TABLE TRANSACTION_TYPE (
    transaction_type_id     INT             PRIMARY KEY AUTO_INCREMENT,
    name                    VARCHAR(100)    NOT NULL
);


CREATE TABLE LISTING_STATUS (
    status_id       INT             PRIMARY KEY AUTO_INCREMENT,
    status_name     VARCHAR(100)    NOT NULL
);


CREATE TABLE PROPERTY (
    property_id             INT             PRIMARY KEY AUTO_INCREMENT,
    seller_id               INT             NOT NULL,
    agent_id                INT,
    property_type_id        INT             NOT NULL,
    transaction_type_id     INT             NOT NULL,
    status_id               INT             NOT NULL,
    address_id              INT             NOT NULL,

    property_type_enum      ENUM(
                                'APARTMENT',
                                'HOUSE',
                                'VILLA',
                                'PLOT',
                                'COMMERCIAL',
                                'WAREHOUSE',
                                'LAND'
                            )               NOT NULL,

    transaction_type_enum   ENUM(
                                'SALE',
                                'RENT',
                                'LEASE'
                            )               NOT NULL,

    furnishing_type         ENUM(
                                'FULLY_FURNISHED',
                                'SEMI_FURNISHED',
                                'UNFURNISHED'
                            )               DEFAULT 'UNFURNISHED',

    status_enum             ENUM(
                                'PENDING',
                                'ACTIVE',
                                'SOLD',
                                'RENTED',
                                'REJECTED',
                                'INACTIVE'
                            )               NOT NULL DEFAULT 'PENDING',

    price                   DECIMAL(15,2)   NOT NULL,
    bedrooms                INT,
    bathrooms               INT,
    sqft                    DECIMAL(10,2),
    description             TEXT,
    listed_date             DATETIME        DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_property_seller
        FOREIGN KEY (seller_id) REFERENCES SELLER(user_id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_property_agent
        FOREIGN KEY (agent_id) REFERENCES AGENT(user_id)
        ON DELETE SET NULL,

    CONSTRAINT fk_property_type
        FOREIGN KEY (property_type_id) REFERENCES PROPERTY_TYPE(property_type_id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_property_transaction
        FOREIGN KEY (transaction_type_id) REFERENCES TRANSACTION_TYPE(transaction_type_id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_property_status
        FOREIGN KEY (status_id) REFERENCES LISTING_STATUS(status_id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_property_address
        FOREIGN KEY (address_id) REFERENCES ADDRESS(address_id)
        ON DELETE RESTRICT
);


CREATE TABLE PROPERTY_IMAGE (
    image_id        INT             PRIMARY KEY AUTO_INCREMENT,
    property_id     INT             NOT NULL,
    image_url       VARCHAR(500)    NOT NULL,
    is_primary      BOOLEAN         DEFAULT FALSE,

    CONSTRAINT fk_image_property
        FOREIGN KEY (property_id) REFERENCES PROPERTY(property_id)
        ON DELETE CASCADE
);


CREATE TABLE DOCUMENT_TYPE (
    doc_type_id     INT             PRIMARY KEY AUTO_INCREMENT,
    type_name       VARCHAR(100)    NOT NULL
);


CREATE TABLE PROPERTY_DOCUMENT (
    document_id             INT             PRIMARY KEY AUTO_INCREMENT,
    property_id             INT             NOT NULL,
    seller_id               INT             NOT NULL,
    doc_type_id             INT             NOT NULL,
    verified_by_admin_id    INT,
    document_url            VARCHAR(500)    NOT NULL,

    -- ENUMs
    doc_type_enum           ENUM(
                                'TITLE_DEED',
                                'SALE_DEED',
                                'NOC',
                                'TAX_RECEIPT',
                                'ENCUMBRANCE_CERTIFICATE',
                                'BUILDING_PLAN',
                                'LEASE_AGREEMENT',
                                'IDENTITY_PROOF',
                                'OTHER'
                            )               NOT NULL,

    verification_status     ENUM(
                                'PENDING',
                                'VERIFIED',
                                'REJECTED'
                            )               NOT NULL DEFAULT 'PENDING',

    rejection_reason        TEXT,

    CONSTRAINT fk_doc_property
        FOREIGN KEY (property_id) REFERENCES PROPERTY(property_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_doc_seller
        FOREIGN KEY (seller_id) REFERENCES SELLER(user_id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_doc_type
        FOREIGN KEY (doc_type_id) REFERENCES DOCUMENT_TYPE(doc_type_id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_doc_admin
        FOREIGN KEY (verified_by_admin_id) REFERENCES ADMIN(user_id)
        ON DELETE SET NULL
);


CREATE TABLE SHORTLIST (
    buyer_id        INT             NOT NULL,
    property_id     INT             NOT NULL,
    shortlisted_at  DATETIME        DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (buyer_id, property_id),

    CONSTRAINT fk_shortlist_buyer
        FOREIGN KEY (buyer_id) REFERENCES BUYER(user_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_shortlist_property
        FOREIGN KEY (property_id) REFERENCES PROPERTY(property_id)
        ON DELETE CASCADE
);


CREATE TABLE VISIT_STATUS (
    status_id       INT             PRIMARY KEY AUTO_INCREMENT,
    status_name     VARCHAR(100)    NOT NULL
);


CREATE TABLE VISIT (
    visit_id        INT             PRIMARY KEY AUTO_INCREMENT,
    property_id     INT             NOT NULL,
    buyer_id        INT             NOT NULL,
    seller_id       INT,
    agent_id        INT,
    status_id       INT             NOT NULL,

    status_enum     ENUM(
                        'REQUESTED',
                        'APPROVED',
                        'SCHEDULED',
                        'COMPLETED',
                        'CANCELLED',
                        'REJECTED'
                    )               NOT NULL DEFAULT 'REQUESTED',

    requested_date  DATETIME        NOT NULL,
    scheduled_date  DATETIME,

    CONSTRAINT fk_visit_property
        FOREIGN KEY (property_id) REFERENCES PROPERTY(property_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_visit_buyer
        FOREIGN KEY (buyer_id) REFERENCES BUYER(user_id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_visit_seller
        FOREIGN KEY (seller_id) REFERENCES SELLER(user_id)
        ON DELETE SET NULL,

    CONSTRAINT fk_visit_agent
        FOREIGN KEY (agent_id) REFERENCES AGENT(user_id)
        ON DELETE SET NULL,

    CONSTRAINT fk_visit_status
        FOREIGN KEY (status_id) REFERENCES VISIT_STATUS(status_id)
        ON DELETE RESTRICT
);


CREATE TABLE NEGOTIATION_STATUS (
    status_id       INT             PRIMARY KEY AUTO_INCREMENT,
    status_name     VARCHAR(100)    NOT NULL
);


CREATE TABLE NEGOTIATION (
    negotiation_id  INT             PRIMARY KEY AUTO_INCREMENT,
    property_id     INT             NOT NULL,
    buyer_id        INT             NOT NULL,
    seller_id       INT,
    agent_id        INT,
    status_id       INT             NOT NULL,

    status_enum     ENUM(
                        'PENDING',
                        'COUNTERED',
                        'ACCEPTED',
                        'REJECTED',
                        'WITHDRAWN'
                    )               NOT NULL DEFAULT 'PENDING',

    buyer_offer     DECIMAL(15,2)   NOT NULL,
    counter_offer   DECIMAL(15,2),

    CONSTRAINT fk_neg_property
        FOREIGN KEY (property_id) REFERENCES PROPERTY(property_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_neg_buyer
        FOREIGN KEY (buyer_id) REFERENCES BUYER(user_id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_neg_seller
        FOREIGN KEY (seller_id) REFERENCES SELLER(user_id)
        ON DELETE SET NULL,

    CONSTRAINT fk_neg_agent
        FOREIGN KEY (agent_id) REFERENCES AGENT(user_id)
        ON DELETE SET NULL,

    CONSTRAINT fk_neg_status
        FOREIGN KEY (status_id) REFERENCES NEGOTIATION_STATUS(status_id)
        ON DELETE RESTRICT
);


CREATE TABLE PURCHASE_STATUS (
    status_id       INT             PRIMARY KEY AUTO_INCREMENT,
    status_name     VARCHAR(100)    NOT NULL
);


CREATE TABLE PURCHASE (
    purchase_id     INT             PRIMARY KEY AUTO_INCREMENT,
    property_id     INT             NOT NULL UNIQUE,
    buyer_id        INT             NOT NULL,
    seller_id       INT,
    agent_id        INT,
    status_id       INT             NOT NULL,

    status_enum     ENUM(
                        'INITIATED',
                        'AGREEMENT_SIGNED',
                        'PAYMENT_PENDING',
                        'COMPLETED',
                        'CANCELLED'
                    )               NOT NULL DEFAULT 'INITIATED',

    agreed_price    DECIMAL(15,2)   NOT NULL,

    CONSTRAINT fk_purchase_property
        FOREIGN KEY (property_id) REFERENCES PROPERTY(property_id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_purchase_buyer
        FOREIGN KEY (buyer_id) REFERENCES BUYER(user_id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_purchase_seller
        FOREIGN KEY (seller_id) REFERENCES SELLER(user_id)
        ON DELETE SET NULL,

    CONSTRAINT fk_purchase_agent
        FOREIGN KEY (agent_id) REFERENCES AGENT(user_id)
        ON DELETE SET NULL,

    CONSTRAINT fk_purchase_status
        FOREIGN KEY (status_id) REFERENCES PURCHASE_STATUS(status_id)
        ON DELETE RESTRICT
);


CREATE TABLE PAYMENT_METHOD (
    payment_method_id   INT             PRIMARY KEY AUTO_INCREMENT,
    method_name         VARCHAR(100)    NOT NULL
);


CREATE TABLE PAYMENT_STATUS (
    status_id       INT             PRIMARY KEY AUTO_INCREMENT,
    status_name     VARCHAR(100)    NOT NULL
);


CREATE TABLE PAYMENT (
    payment_id              INT             PRIMARY KEY AUTO_INCREMENT,
    purchase_id             INT             NOT NULL,
    payer_user_id           INT             NOT NULL,
    receiver_user_id        INT             NOT NULL,
    payment_method_id       INT             NOT NULL,
    status_id               INT             NOT NULL,

    payment_method_enum     ENUM(
                                'UPI',
                                'NET_BANKING',
                                'CREDIT_CARD',
                                'DEBIT_CARD',
                                'BANK_TRANSFER',
                                'CHEQUE',
                                'CASH',
                                'DEMAND_DRAFT'
                            )               NOT NULL,

    status_enum             ENUM(
                                'INITIATED',
                                'PENDING',
                                'SUCCESS',
                                'FAILED',
                                'REFUNDED'
                            )               NOT NULL DEFAULT 'INITIATED',

    amount                  DECIMAL(15,2)   NOT NULL,
    transaction_id          VARCHAR(255)    NOT NULL UNIQUE,

    CONSTRAINT fk_payment_purchase
        FOREIGN KEY (purchase_id) REFERENCES PURCHASE(purchase_id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_payment_payer
        FOREIGN KEY (payer_user_id) REFERENCES USER(user_id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_payment_receiver
        FOREIGN KEY (receiver_user_id) REFERENCES USER(user_id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_payment_method
        FOREIGN KEY (payment_method_id) REFERENCES PAYMENT_METHOD(payment_method_id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_payment_status
        FOREIGN KEY (status_id) REFERENCES PAYMENT_STATUS(status_id)
        ON DELETE RESTRICT
);


CREATE TABLE NOTIFICATION (
    notification_id     INT             PRIMARY KEY AUTO_INCREMENT,
    user_id             INT             NOT NULL,

    type                ENUM(
                            'LISTING_APPROVED',
                            'LISTING_REJECTED',
                            'DOCUMENT_VERIFIED',
                            'DOCUMENT_REJECTED',
                            'VISIT_REQUESTED',
                            'VISIT_SCHEDULED',
                            'VISIT_COMPLETED',
                            'OFFER_RECEIVED',
                            'OFFER_ACCEPTED',
                            'OFFER_REJECTED',
                            'PURCHASE_INITIATED',
                            'PAYMENT_SUCCESS',
                            'PAYMENT_FAILED',
                            'REPORT_FILED',
                            'GENERAL'
                        )               NOT NULL DEFAULT 'GENERAL',

    title               VARCHAR(255)    NOT NULL,
    message             TEXT            NOT NULL,
    is_read             BOOLEAN         DEFAULT FALSE,
    created_at          DATETIME        DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_notification_user
        FOREIGN KEY (user_id) REFERENCES USER(user_id)
        ON DELETE CASCADE
);


CREATE TABLE REPORT (
    report_id               INT             PRIMARY KEY AUTO_INCREMENT,
    reported_user_id        INT             NOT NULL,
    reported_by_user_id     INT             NOT NULL,
    reason                  VARCHAR(255)    NOT NULL,
    description             TEXT,

    status                  ENUM(
                                'OPEN',
                                'UNDER_REVIEW',
                                'RESOLVED',
                                'DISMISSED'
                            )               NOT NULL DEFAULT 'OPEN',

    report_date             DATETIME        DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_report_reported
        FOREIGN KEY (reported_user_id) REFERENCES USER(user_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_report_reportedby
        FOREIGN KEY (reported_by_user_id) REFERENCES USER(user_id)
        ON DELETE CASCADE
);


