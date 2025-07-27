CREATE TABLE users (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    given_name VARCHAR(255),
    family_name VARCHAR(255),
    picture VARCHAR(255),
    groups TEXT[] DEFAULT '{}'
);

CREATE TABLE directories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    parent_id UUID,
    owner_id VARCHAR(255) NOT NULL,
    last_modified_at TIMESTAMP NOT NULL DEFAULT NOW(),

    FOREIGN KEY (parent_id) REFERENCES directories(id),
    FOREIGN KEY (owner_id) REFERENCES users(id)
);

CREATE TABLE files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    owner_id VARCHAR(255) NOT NULL,
    parent_id UUID NOT NULL,
    mime_type VARCHAR(255) NOT NULL,
    size INTEGER NOT NULL DEFAULT 0,
    last_modified_at TIMESTAMP NOT NULL DEFAULT NOW(),

    FOREIGN KEY (owner_id) REFERENCES users(id),
    FOREIGN KEY (parent_id) REFERENCES directories(id)
);

CREATE TABLE entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL,
    name VARCHAR(255) NOT NULL,
    mime_type VARCHAR NOT NULL,
    parent_id UUID
);

CREATE TABLE rescans_running (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id VARCHAR(255) NOT NULL,
    total_files INTEGER NOT NULL DEFAULT 0,
    processed_files INTEGER NOT NULL DEFAULT 0,
    started_at TIMESTAMP NOT NULL DEFAULT NOW(),

    FOREIGN KEY (owner_id) REFERENCES users(id)
);

CREATE TABLE rescans_completed (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id VARCHAR(255) NOT NULL,
    started_at TIMESTAMP NOT NULL DEFAULT NOW(),
    finished_at TIMESTAMP NOT NULL DEFAULT NOW(),
    total_files INTEGER NOT NULL DEFAULT 0,
    processed_files INTEGER NOT NULL DEFAULT 0,

    FOREIGN KEY (owner_id) REFERENCES users(id)
);

CREATE TABLE rescans_error (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    started_at TIMESTAMP NOT NULL DEFAULT NOW(),
    finished_at TIMESTAMP NOT NULL DEFAULT NOW(),

    FOREIGN KEY (owner_id) REFERENCES users(id)
);

CREATE VIEW entities AS
SELECT directories.id,
       'directory'::text       AS type,
       directories.name,
       NULL::character varying AS mime_type,
       directories.parent_id
FROM directories
UNION ALL
SELECT files.id,
       'file'::text AS type,
       files.name,
       files.mime_type,
       files.parent_id
FROM files;
