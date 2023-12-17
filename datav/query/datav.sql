CREATE DATABASE xobserve;

USE xobserve;

CREATE TABLE IF NOT EXISTS user (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) DEFAULT '',
    password VARCHAR(100) DEFAULT '',
    salt VARCHAR(50),
    role VARCHAR(10) DEFAULT 'Viewer',
    mobile VARCHAR(11) DEFAULT '',
    email VARCHAR(255),
    last_seen_at DATETIME,
    is_diabled BOOL NOT NULL DEFAULT false,
    come_from VARCHAR(32) DEFAULT 'local',
    visit_count INTEGER DEFAULT 0,
    current_tenant INTEGER DEFAULT 0,
    current_team INTEGER DEFAULT 0,
    data MEDIUMTEXT,
    status TINYINT DEFAULT 0,
    statusUpdated DATETIME,
    created DATETIME NOT NULL,
    updated DATETIME NOT NULL
);

CREATE INDEX user_username ON user (username);

CREATE INDEX user_status ON user (status);

CREATE TABLE IF NOT EXISTS tenant (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL UNIQUE,
    data MEDIUMTEXT,
    is_public BOOL DEFAULT false,
    status TINYINT DEFAULT 0,
    statusUpdated DATETIME,
    created DATETIME NOT NULL,
    updated DATETIME NOT NULL
);

CREATE INDEX tenant_name ON tenant (name);

CREATE INDEX tenant_status ON tenant (status);

CREATE TABLE IF NOT EXISTS tenant_user (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    tenant_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    role VARCHAR(10) DEFAULT 'Viewer',
    created DATETIME NOT NULL,
    updated DATETIME NOT NULL
);

CREATE INDEX tenant_user_tenant_id ON tenant_user (tenant_id);

CREATE INDEX tenant_user_user_id ON tenant_user (user_id);

CREATE UNIQUE INDEX tenant_user_tenant_user_id ON tenant_user (tenant_id, user_id);

CREATE TABLE IF NOT EXISTS sessions (
    sid VARCHAR(255) PRIMARY KEY,
    user_id INTEGER
);

CREATE INDEX sessions_userid ON sessions (user_id);

CREATE TABLE IF NOT EXISTS team (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    brief VARCHAR(255) DEFAUlT '',
    is_public BOOL DEFAULT false,
    created_by INTEGER NOT NULL,
    data MEDIUMTEXT,
    tenant_id INTEGER NOT NULL,
    sidemenu MEDIUMTEXT,
    sync_users BOOL DEFAULT false,
    status TINYINT DEFAULT 0,
    statusUpdated DATETIME,
    created DATETIME NOT NULL,
    updated DATETIME NOT NULL
);

CREATE UNIQUE INDEX team_name ON team (tenant_id, name);

CREATE INDEX team_tenant ON team (tenant_id);

CREATE INDEX team_status ON team (status);

CREATE INDEX team_created_by ON team (created_by);

CREATE TABLE IF NOT EXISTS team_member (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    tenant_id INTEGER NOT NULL,
    team_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    role VARCHAR(10) DEFAULT 'Viewer',
    created DATETIME NOT NULL,
    updated DATETIME NOT NULL
);

CREATE INDEX team_member_tenant_id ON team_member (tenant_id);

CREATE INDEX team_member_team_id ON team_member (team_id);

CREATE INDEX team_member_user_id ON team_member (user_id);

CREATE UNIQUE INDEX team_member_team_user_id ON team_member (team_id, user_id);

CREATE TABLE IF NOT EXISTS variable (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(60) NOT NULL,
    type VARCHAR(10) NOT NULL,
    value MEDIUMTEXT,
    description VARCHAR(255) DEFAULT '',
    datasource INTEGER,
    refresh VARCHAR(32),
    enableMulti BOOL NOT NULL DEFAULT false,
    enableAll BOOL NOT NULL DEFAULT false,
    sort SMALLINT DEFAULT 0,
    regex TEXT,
    team_id INTEGER NOT NULL,
    data MEDIUMTEXT,
    created DATETIME NOT NULL,
    updated DATETIME NOT NULL
);

CREATE UNIQUE INDEX variable_name ON variable (team_id, name);

CREATE INDEX variable_team ON variable (team_id);

CREATE TABLE IF NOT EXISTS dashboard (
    id VARCHAR(40) PRIMARY KEY NOT NULL,
    title VARCHAR(255) NOT NULL,
    team_id INTEGER NOT NULL,
    visible_to VARCHAR(32) DEFAULT 'team',
    created_by INTEGER NOT NULL,
    tags TEXT,
    data MEDIUMTEXT NOT NULL,
    weight TINYINT DEFAULT 0,
    created DATETIME NOT NULL,
    updated DATETIME NOT NULL
);

CREATE INDEX dashboard_team_id ON dashboard (team_id);

CREATE INDEX dashboard_created_by ON dashboard (created_by);

CREATE TABLE IF NOT EXISTS dashboard_history (
    dashboard_id VARCHAR(40),
    version DATETIME,
    changes TEXT,
    history MEDIUMTEXT
);

CREATE UNIQUE INDEX dashboard_id_version ON dashboard_history (dashboard_id, version);

CREATE TABLE IF NOT EXISTS datasource (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(64),
    type VARCHAR(32),
    url VARCHAR(255),
    data MEDIUMTEXT,
    team_id INTEGER NOT NULL,
    created DATETIME NOT NULL,
    updated DATETIME NOT NULL
);

CREATE UNIQUE INDEX datasource_name ON datasource (team_id, name);

CREATE INDEX datasource_team ON datasource (team_id);

CREATE TABLE IF NOT EXISTS star_dashboard (
    user_id INTEGER NOT NULL,
    dashboard_id VARCHAR(40) NOT NULL,
    created DATETIME NOT NULL
);

CREATE UNIQUE INDEX star_dashboard_id ON star_dashboard (user_id, dashboard_id);

CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    op_id INTEGER NOT NULL,
    op_type VARCHAR(32) NOT NULL,
    target_id VARCHAR(64),
    data MEDIUMTEXT,
    tenant_id INTEGER NOT NULL,
    created DATETIME NOT NULL
);

CREATE INDEX audit_logs_op_id ON audit_logs (op_id);

CREATE INDEX audit_logs_op_type ON audit_logs (op_type);

CREATE INDEX audit_logs_tenant ON audit_logs (tenant_id);

CREATE TABLE IF NOT EXISTS annotation (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    text TEXT,
    time INTEGER NOT NULL,
    duration VARCHAR(32) NOT NULL,
    tags VARCHAR(255),
    namespace_id VARCHAR(40),
    group_id INTEGER,
    userId INTEGER,
    created DATETIME NOT NULL,
    updated DATETIME NOT NULL
);

CREATE INDEX annotation_npid ON annotation (namespace_id);

CREATE UNIQUE INDEX annotation_time_ng ON annotation (namespace_id, group_id, time);

CREATE TABLE IF NOT EXISTS template (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    type SMALLINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    scope SMALLINT NOT NULL,
    owned_by INTEGER NOT NULL,
    provider VARCHAR(255) NOT NULL,
    content_id INTEGER DEFAULT 0,
    created DATETIME NOT NULL,
    updated DATETIME
);

CREATE INDEX template_type ON template (type);

CREATE INDEX template_scope ON template (scope);

CREATE UNIQUE INDEX template_scope_title ON template (scope, title);

CREATE INDEX template_owned_by ON template (owned_by);

CREATE INDEX template_provider ON template (provider);

CREATE TABLE IF NOT EXISTS template_content (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    template_id INTEGER NOT NULL,
    content MEDIUMTEXT,
    description VARCHAR(255) NOT NULL,
    version VARCHAR(32) NOT NULL,
    created DATETIME NOT NULL,
    created_by INTEGER NOT NULL
);

CREATE INDEX template_content_tid ON template_content (template_id);

CREATE UNIQUE INDEX template_content_tid_created ON template_content (template_id, created);