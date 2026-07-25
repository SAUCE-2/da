-- Rename query version document columns: body → query, content_hash → query_hash
-- Run after oracle-query-document-rework.sql on schemas that still use the old names.
-- Local H2 uses Hibernate ddl-auto and does not need this script.

ALTER TABLE query_versions RENAME COLUMN body TO query;
ALTER TABLE query_versions RENAME COLUMN content_hash TO query_hash;
