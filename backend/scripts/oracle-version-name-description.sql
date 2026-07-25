-- Versioned query metadata: name + description on query_versions
-- Keeps denormalized copies on queries for list/sort.
-- Local H2 uses Hibernate ddl-auto and does not need this script.

ALTER TABLE query_versions ADD name VARCHAR2(200);
ALTER TABLE query_versions ADD description VARCHAR2(1000);

UPDATE query_versions v
   SET name = (
         SELECT q.name FROM queries q WHERE q.id = v.query_id
       ),
       description = (
         SELECT q.description FROM queries q WHERE q.id = v.query_id
       )
 WHERE v.name IS NULL;

UPDATE query_versions SET name = 'Untitled' WHERE name IS NULL;

ALTER TABLE query_versions MODIFY name NOT NULL;
