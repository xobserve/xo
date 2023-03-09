CREATE DATABASE aiapm;

USE aiapm;

CREATE TABLE IF NOT EXISTS user (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) DEFAULT '',
    password VARCHAR(100) DEFAULT '',
    salt VARCHAR(50),
    mobile VARCHAR(11) DEFAULT '',
    email VARCHAR(255) NOT NULL UNIQUE,
    last_seen_at DATETIME,
    is_diabled BOOL NOT NULL DEFAULT false,
    sidemenu INTEGER DEFAULT 1,
    created DATETIME NOT NULL,
    updated DATETIME NOT NULL
);

CREATE INDEX user_username ON user (username);

CREATE INDEX user_email ON user (email);

CREATE TABLE IF NOT EXISTS sessions (
    sid VARCHAR(255) PRIMARY KEY,
    user_id INTEGER
);

CREATE TABLE IF NOT EXISTS team (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL UNIQUE,
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
    team_id INTEGER PRIMARY KEY  NOT NULL,
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
    value TEXT,
    external_url VARCHAR(255) DEFAULT '',
    created DATETIME NOT NULL,
    updated DATETIME NOT NULL
);

CREATE UNIQUE INDEX variable_name ON variable (name);
