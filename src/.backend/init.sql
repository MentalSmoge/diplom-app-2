-- Сначала создаем таблицы без внешних ключей
CREATE TABLE IF NOT EXISTS users
(
    id integer NOT NULL,
    name character varying(100) COLLATE pg_catalog."default",
    email character varying(100) COLLATE pg_catalog."default",
    password character varying(100) COLLATE pg_catalog."default",
    CONSTRAINT users_pkey PRIMARY KEY (id)
) TABLESPACE pg_default;

CREATE TABLE IF NOT EXISTS projects
(
    id integer NOT NULL,
    title character varying(255) COLLATE pg_catalog."default" NOT NULL,
    description text COLLATE pg_catalog."default",
    creation_date date NOT NULL DEFAULT CURRENT_DATE,
    CONSTRAINT projects_pkey PRIMARY KEY (id)
) TABLESPACE pg_default;

-- Затем создаем последовательности и связываем их с таблицами
CREATE SEQUENCE IF NOT EXISTS users_id_seq
    INCREMENT 1
    START 1
    MINVALUE 1
    MAXVALUE 2147483647
    CACHE 1;
ALTER SEQUENCE users_id_seq OWNED BY users.id;

CREATE SEQUENCE IF NOT EXISTS projects_id_seq
    INCREMENT 1
    START 1
    MINVALUE 1
    MAXVALUE 2147483647
    CACHE 1;
ALTER SEQUENCE projects_id_seq OWNED BY projects.id;

-- Теперь можно создать таблицы, которые зависят от уже созданных
CREATE TABLE IF NOT EXISTS boards
(
    id integer NOT NULL DEFAULT nextval('boards_id_seq'::regclass),
    title character varying(100) COLLATE pg_catalog."default" NOT NULL,
    project_id integer,
    CONSTRAINT boards_pkey PRIMARY KEY (id),
    CONSTRAINT fk_boards_project FOREIGN KEY (project_id)
        REFERENCES projects (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
) TABLESPACE pg_default;

CREATE SEQUENCE IF NOT EXISTS boards_id_seq
    INCREMENT 1
    START 1
    MINVALUE 1
    MAXVALUE 2147483647
    CACHE 1;
ALTER SEQUENCE boards_id_seq OWNED BY boards.id;

CREATE TABLE IF NOT EXISTS project_users
(
    id integer NOT NULL,
    user_id integer NOT NULL,
    project_id integer NOT NULL,
    role integer NOT NULL,
    CONSTRAINT project_users_pkey PRIMARY KEY (id),
    CONSTRAINT unique_user_project UNIQUE (user_id, project_id),
    CONSTRAINT fk_project FOREIGN KEY (project_id)
        REFERENCES projects (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE,
    CONSTRAINT fk_user FOREIGN KEY (user_id)
        REFERENCES users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
) TABLESPACE pg_default;

CREATE SEQUENCE IF NOT EXISTS project_users_id_seq
    INCREMENT 1
    START 1
    MINVALUE 1
    MAXVALUE 2147483647
    CACHE 1;
ALTER SEQUENCE project_users_id_seq OWNED BY project_users.id;

-- И наконец таблица elements, которая зависит от boards
CREATE TABLE IF NOT EXISTS elements
(
    id character varying(36) COLLATE pg_catalog."default" NOT NULL,
    type character varying(50) COLLATE pg_catalog."default" NOT NULL,
    board_id integer NOT NULL,
    data jsonb NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT elements_pkey PRIMARY KEY (id),
    CONSTRAINT fk_elements_board FOREIGN KEY (board_id)
        REFERENCES boards (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
) TABLESPACE pg_default;

-- Устанавливаем владельца для всех объектов
ALTER TABLE users OWNER TO postgres;
ALTER TABLE projects OWNER TO postgres;
ALTER TABLE boards OWNER TO postgres;
ALTER TABLE project_users OWNER TO postgres;
ALTER TABLE elements OWNER TO postgres;
ALTER SEQUENCE users_id_seq OWNER TO postgres;
ALTER SEQUENCE projects_id_seq OWNER TO postgres;
ALTER SEQUENCE boards_id_seq OWNER TO postgres;
ALTER SEQUENCE project_users_id_seq OWNER TO postgres;