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
    created DATETIME NOT NULL,
    updated DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS tenant (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(255) NOT NULL UNIQUE,
    nickname VARCHAR(255) DEFAULT '',
    data MEDIUMTEXT,
    is_public BOOL DEFAULT false,
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
    sidemenu MEDIUMTEXT NOT NULL,
    sync_users BOOL DEFAULT false,
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
    id INTEGER PRIMARY KEY AUTOINCREMENT,
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
    team_id INTEGER NOT NULL,
    data MEDIUMTEXT,
    created DATETIME NOT NULL,
    updated DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS dashboard (
    id VARCHAR(40) PRIMARY KEY NOT NULL,
    title VARCHAR(255) NOT NULL,
    team_id INTEGER NOT NULL,
    visible_to VARCHAR(32) DEFAULT 'team',
    created_by INTEGER NOT NULL,
    tags TEXT,
    data MEDIUMTEXT NOT NULL,
    weight SMALLINT DEFAULT 0,
    created DATETIME NOT NULL,
    updated DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS dashboard_history (
    dashboard_id VARCHAR(40),
    version DATETIME,
    changes TEXT,
    history MEDIUMTEXT
);


CREATE TABLE IF NOT EXISTS datasource (
    id  INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(64),
    type VARCHAR(32),
    url VARCHAR(255),
    data MEDIUMTEXT,
    team_id INTEGER NOT NULL,
    created DATETIME NOT NULL,
    updated DATETIME NOT NULL
);


CREATE TABLE IF NOT EXISTS star_dashboard (
    id  INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id  INTEGER NOT NULL,
    dashboard_id VARCHAR(40) NOT NULL,
    created DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id  INTEGER PRIMARY KEY AUTOINCREMENT,
    op_id  INTEGER NOT NULL,
    op_type VARCHAR(32) NOT NULL,
    target_id VARCHAR(64),
    data MEDIUMTEXT,
    tenant INTEGER NOT NULL,
    created DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS annotation (
    id  INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT,
    time  INTEGER NOT NULL,
    duration VARCHAR(32) NOT NULL,
    tags VARCHAR(255),
    namespace_id VARCHAR(40),
    group_id INTEGER,
    userId INTEGER,
    created DATETIME NOT NULL,
    updated DATETIME NOT NULL
);
`

const SqliteIndex = `
CREATE INDEX IF NOT EXISTS user_username ON user (username);

CREATE INDEX IF NOT EXISTS tenant_name ON tenant (name);

CREATE INDEX IF NOT EXISTS tenant_user_tenant_id ON tenant_user (tenant_id);
CREATE INDEX IF NOT EXISTS tenant_user_user_id ON tenant_user (user_id);
CREATE UNIQUE INDEX IF NOT EXISTS tenant_user_tenant_user_id ON tenant_user (tenant_id, user_id);

CREATE UNIQUE INDEX IF NOT EXISTS team_name ON team (tenant_id,name);
CREATE INDEX IF NOT EXISTS team_tenant ON team (tenant_id);
CREATE INDEX IF NOT EXISTS team_created_by ON team (created_by);


CREATE INDEX IF NOT EXISTS team_member_team_id ON team_member (team_id);
CREATE INDEX IF NOT EXISTS team_member_tenant_id ON team_member (tenant_id);
CREATE INDEX IF NOT EXISTS team_member_user_id ON team_member (user_id);
CREATE UNIQUE INDEX IF NOT EXISTS team_member_team_user_id ON team_member (team_id, user_id);


CREATE UNIQUE INDEX IF NOT EXISTS variable_name ON variable (team_id, name);
CREATE INDEX IF NOT EXISTS variable_team ON variable (team_id);

CREATE INDEX IF NOT EXISTS  dashboard_team_id ON dashboard (team_id);
CREATE INDEX IF NOT EXISTS  dashboard_visible_to ON dashboard (visible_to);
CREATE INDEX IF NOT EXISTS  dashboard_created_by ON dashboard (created_by);


CREATE UNIQUE INDEX IF NOT EXISTS  dashboard_id_version ON dashboard_history (dashboard_id,version);



CREATE UNIQUE INDEX IF NOT EXISTS  datasource_name ON datasource (team_id,name);
CREATE INDEX IF NOT EXISTS datasource_team ON datasource (team_id);


CREATE UNIQUE INDEX IF NOT EXISTS  star_dashboard_id ON star_dashboard (user_id,dashboard_id);


CREATE INDEX IF NOT EXISTS   audit_logs_op_id ON audit_logs (op_id);
CREATE INDEX IF NOT EXISTS   audit_logs_op_type ON audit_logs (op_type);
CREATE INDEX IF NOT EXISTS audit_logs_tenant ON audit_logs (tenant);

CREATE INDEX IF NOT EXISTS annotation_npid ON annotation (namespace_id);
CREATE UNIQUE INDEX IF NOT EXISTS  annotation_time_ng ON annotation (namespace_id,group_id,time);
`
