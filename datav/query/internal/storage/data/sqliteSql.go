package storageData

import (
	_ "github.com/mattn/go-sqlite3"
)

const SqliteSQL = `
CREATE TABLE IF NOT EXISTS user (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
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

CREATE TABLE IF NOT EXISTS tenant (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(255) NOT NULL UNIQUE,
    nickname VARCHAR(255) DEFAULT '',
    data MEDIUMTEXT,
    is_public BOOL DEFAULT false,
    status TINYINT DEFAULT 0,
    statusUpdated DATETIME,
    created DATETIME NOT NULL,
    updated DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS tenant_user (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tenant_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    role VARCHAR(10) DEFAULT 'Viewer',
    created DATETIME NOT NULL,
    updated DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
    sid VARCHAR(255) PRIMARY KEY,
    user_id INTEGER
);

CREATE TABLE IF NOT EXISTS team (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
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

CREATE TABLE IF NOT EXISTS team_member (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tenant_id INTEGER NOT NULL,
    team_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    role VARCHAR(10) DEFAULT 'Viewer',
    created DATETIME NOT NULL,
    updated DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS variable (
    team_id INTEGER NOT NULL,
    id INTEGER  NOT NULL,
    name VARCHAR(60) NOT NULL,
    type VARCHAR(10) NOT NULL,
    value MEDIUMTEXT,
    default_selected VARCHAR(255),
    description VARCHAR(255) DEFAULT '',
    datasource INTEGER,
    refresh VARCHAR(32),
    enableMulti BOOL NOT NULL DEFAULT false,
    enableAll BOOL NOT NULL DEFAULT false,
    sort TINYINT DEFAULT 0,
    regex TEXT,
    data MEDIUMTEXT,
    template_id INTEGER DEFAULT 0,
    created DATETIME NOT NULL,
    updated DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS dashboard (
    team_id INTEGER NOT NULL,
    id VARCHAR(40) NOT NULL,
    title VARCHAR(255) NOT NULL,
    visible_to VARCHAR(32) DEFAULT 'team',
    created_by INTEGER NOT NULL,
    tags TEXT,
    data MEDIUMTEXT,
    weight SMALLINT DEFAULT 0,
    template_id INTEGER DEFAULT 0, 
    created DATETIME NOT NULL,
    updated DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS dashboard_history (
    team_id INTEGER NOT NULL,
    dashboard_id VARCHAR(40),
    version DATETIME,
    changes TEXT,
    history MEDIUMTEXT
);


CREATE TABLE IF NOT EXISTS datasource (
    team_id INTEGER NOT NULL,
    id INTEGER NOT NULL,
    name VARCHAR(64),
    type VARCHAR(32),
    url VARCHAR(255),
    data MEDIUMTEXT,
    template_id INTEGER DEFAULT 0, 
    created DATETIME NOT NULL,
    updated DATETIME NOT NULL
);


CREATE TABLE IF NOT EXISTS star_dashboard (
    id  INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id  INTEGER NOT NULL,
    team_id INTEGER NOT NULL,
    dashboard_id VARCHAR(40) NOT NULL,
    created DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id  INTEGER PRIMARY KEY AUTOINCREMENT,
    op_id  INTEGER NOT NULL,
    op_type VARCHAR(32) NOT NULL,
    target_id VARCHAR(64),
    data MEDIUMTEXT,
    tenant_id INTEGER NOT NULL,
    team_id INTEGER NOT NULL,
    created DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS annotation (
    id  INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT,
    time  INTEGER NOT NULL,
    duration VARCHAR(32) NOT NULL,
    tags VARCHAR(255),
    team_id INTEGER NOT NULL,
    namespace_id VARCHAR(40),
    group_id INTEGER,
    userId INTEGER,
    created DATETIME NOT NULL,
    updated DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS template (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type SMALLINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    scope SMALLINT NOT NULL,
    owned_by INTEGER NOT NULL,
    provider VARCHAR(255) NOT NULL,
    tags TEXT,
    content_id INTEGER DEFAULT 0,
    created DATETIME NOT NULL,
    updated DATETIME
);

CREATE TABLE IF NOT EXISTS template_content (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    template_id INTEGER NOT NULL,
    content MEDIUMTEXT,
    description VARCHAR(255) NOT NULL,
    version VARCHAR(32) NOT NULL,
    created DATETIME NOT NULL,
    created_by INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS template_use (
    scope SMALLINT NOT NULL,
    scope_id INTEGER NOT NULL,
    template_id INTEGER NOT NULL,
    created DATETIME NOT NULL,
    created_by INTEGER NOT NULL
);
`

const SqliteIndex = `
CREATE INDEX IF NOT EXISTS user_username ON user (username);
CREATE INDEX IF NOT EXISTS user_status ON user (status);

CREATE INDEX IF NOT EXISTS tenant_name ON tenant (name);
CREATE INDEX IF NOT EXISTS tenant_status ON tenant (status);

CREATE INDEX IF NOT EXISTS tenant_user_tenant_id ON tenant_user (tenant_id);
CREATE INDEX IF NOT EXISTS tenant_user_user_id ON tenant_user (user_id);
CREATE UNIQUE INDEX IF NOT EXISTS tenant_user_tenant_user_id ON tenant_user (tenant_id, user_id);

CREATE UNIQUE INDEX IF NOT EXISTS team_name ON team (tenant_id,name);
CREATE INDEX IF NOT EXISTS team_status ON team (status);
CREATE INDEX IF NOT EXISTS team_tenant ON team (tenant_id);
CREATE INDEX IF NOT EXISTS team_created_by ON team (created_by);


CREATE INDEX IF NOT EXISTS team_member_team_id ON team_member (team_id);
CREATE INDEX IF NOT EXISTS team_member_tenant_id ON team_member (tenant_id);
CREATE INDEX IF NOT EXISTS team_member_user_id ON team_member (user_id);
CREATE UNIQUE INDEX IF NOT EXISTS team_member_team_user_id ON team_member (team_id, user_id);

CREATE UNIQUE INDEX IF NOT EXISTS variable_id ON variable (team_id, id);
CREATE UNIQUE INDEX IF NOT EXISTS variable_name ON variable (team_id, name);
CREATE INDEX IF NOT EXISTS variable_team ON variable (team_id);
CREATE INDEX IF NOT EXISTS variable_team_template ON variable (team_id, template_id);

CREATE UNIQUE INDEX IF NOT EXISTS dashboard_team_dash_id ON dashboard (team_id, id);
CREATE INDEX IF NOT EXISTS  dashboard_team_id ON dashboard (team_id);
CREATE INDEX IF NOT EXISTS  dashboard_visible_to ON dashboard (visible_to);
CREATE INDEX IF NOT EXISTS  dashboard_created_by ON dashboard (created_by);
CREATE INDEX IF NOT EXISTS  dashboard_team_id_template ON dashboard (team_id, template_id);


CREATE UNIQUE INDEX IF NOT EXISTS  dashboard_id_version ON dashboard_history (team_id,dashboard_id,version);


CREATE UNIQUE INDEX IF NOT EXISTS datasource_id ON datasource (team_id, id);
CREATE UNIQUE INDEX IF NOT EXISTS  datasource_name ON datasource (team_id,name);
CREATE INDEX IF NOT EXISTS datasource_team ON datasource (team_id);
CREATE INDEX IF NOT EXISTS datasource_team_template ON datasource (team_id, template_id);


CREATE UNIQUE INDEX IF NOT EXISTS  star_dashboard_id ON star_dashboard (user_id,team_id,dashboard_id);


CREATE INDEX IF NOT EXISTS   audit_logs_op_id ON audit_logs (op_id);
CREATE INDEX IF NOT EXISTS   audit_logs_op_type ON audit_logs (op_type);
CREATE INDEX IF NOT EXISTS audit_logs_tenant ON audit_logs (tenant_id);
CREATE INDEX IF NOT EXISTS audit_logs_team ON audit_logs (team_id);


CREATE INDEX IF NOT EXISTS annotation_npid ON annotation (team_id,namespace_id);
CREATE UNIQUE INDEX IF NOT EXISTS  annotation_time_ng ON annotation (team_id,namespace_id,group_id,time);

CREATE INDEX IF NOT EXISTS template_type ON template (type);
CREATE INDEX IF NOT EXISTS template_scope ON template (scope);
CREATE UNIQUE INDEX IF NOT EXISTS template_scope_title ON template (scope, title);
CREATE INDEX IF NOT EXISTS template_owned_by ON template (owned_by);
CREATE INDEX IF NOT EXISTS template_provider ON template (provider);

CREATE INDEX IF NOT EXISTS template_content_tid ON template_content (template_id);
CREATE UNIQUE INDEX IF NOT EXISTS template_content_tid_version ON template_content (template_id, version);

CREATE UNIQUE INDEX IF NOT EXISTS template_use_scope_template ON template_use (scope, scope_id, template_id);
CREATE INDEX IF NOT EXISTS template_use_scope ON template_use (scope, scope_id);
`
