CREATE DATABASE datav;

USE datav;

CREATE TABLE IF NOT EXISTS user (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) DEFAULT '',
    password VARCHAR(100) DEFAULT '',
    salt VARCHAR(50),
    mobile VARCHAR(11) DEFAULT '',
    email VARCHAR(255),
    last_seen_at DATETIME,
    is_diabled BOOL NOT NULL DEFAULT false,
    sidemenu INTEGER DEFAULT 1,
    created DATETIME NOT NULL,
    updated DATETIME NOT NULL
);

CREATE INDEX user_username ON user (username);

CREATE TABLE IF NOT EXISTS sessions (
    sid VARCHAR(255) PRIMARY KEY,
    user_id INTEGER
);

CREATE TABLE IF NOT EXISTS team (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL UNIQUE,
    brief VARCHAR(255) DEFAUlT '',
    created_by INTEGER NOT NULL,
    created DATETIME NOT NULL,
    updated DATETIME NOT NULL
);

CREATE INDEX team_name ON team (name);

CREATE INDEX team_created_by ON team (created_by);

CREATE TABLE IF NOT EXISTS team_member (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    team_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    role VARCHAR(10) DEFAULT 'Viewer',
    created DATETIME NOT NULL,
    updated DATETIME NOT NULL
);

CREATE INDEX team_member_team_id ON team_member (team_id);

CREATE INDEX team_member_user_id ON team_member (user_id);

CREATE UNIQUE INDEX team_member_team_user_id ON team_member (team_id, user_id);

CREATE TABLE IF NOT EXISTS sidemenu (
    team_id INTEGER PRIMARY KEY NOT NULL,
    is_public BOOL NOT NULL,
    brief VARCHAR(255) DEFAUlT '',
    data MEDIUMTEXT NOT NULL,
    created_by INTEGER NOT NULL,
    created DATETIME NOT NULL,
    updated DATETIME NOT NULL
);

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
    sort TINYINT DEFAULT 0,
    regex TEXT,
    created DATETIME NOT NULL,
    updated DATETIME NOT NULL
);

CREATE UNIQUE INDEX variable_name ON variable (name);

CREATE TABLE IF NOT EXISTS dashboard (
    id VARCHAR(40) PRIMARY KEY NOT NULL,
    title VARCHAR(255) NOT NULL,
    owned_by INTEGER NOT NULL DEFAULT '1',
    created_by INTEGER NOT NULL,
    tags TEXT,
    data MEDIUMTEXT NOT NULL,
    created DATETIME NOT NULL,
    updated DATETIME NOT NULL
);


CREATE INDEX  dashboard_owned_by ON dashboard (owned_by);

CREATE INDEX  dashboard_created_by ON dashboard (created_by);

CREATE TABLE IF NOT EXISTS dashboard_history (
    dashboard_id VARCHAR(40),
    version DATETIME,
    changes TEXT,
    history MEDIUMTEXT
);


CREATE UNIQUE INDEX  dashboard_id_version ON dashboard_history (dashboard_id,version);


CREATE TABLE IF NOT EXISTS datasource (
    id  INTEGER PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(64),
    type VARCHAR(32),
    url VARCHAR(255),
    data MEDIUMTEXT,
    created DATETIME NOT NULL,
    updated DATETIME NOT NULL
);


CREATE UNIQUE INDEX  datasource_name ON datasource (name);

CREATE TABLE IF NOT EXISTS star_dashboard (
    user_id  INTEGER NOT NULL,
    dashboard_id VARCHAR(40) NOT NULL,
    created DATETIME NOT NULL
);
CREATE UNIQUE INDEX  star_dashboard_id ON star_dashboard (user_id,dashboard_id);


CREATE TABLE IF NOT EXISTS audit_logs (
    id  INTEGER PRIMARY KEY AUTO_INCREMENT,
    op_id  INTEGER NOT NULL,
    op_type VARCHAR(32) NOT NULL,
    target_id VARCHAR(64),
    data MEDIUMTEXT,
    created DATETIME NOT NULL
);

CREATE INDEX  audit_logs_op_id ON audit_logs (op_id);
CREATE INDEX  audit_logs_op_type ON audit_logs (op_type);

CREATE TABLE IF NOT EXISTS annotation (
    id  INTEGER PRIMARY KEY AUTO_INCREMENT,
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

CREATE INDEX  annotation_npid ON annotation (namespace_id);
CREATE UNIQUE INDEX  annotation_time_ng ON annotation (namespace_id,group_id,time);