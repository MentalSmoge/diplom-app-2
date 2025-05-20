-- DROP TABLE IF EXISTS public.boards;

CREATE TABLE IF NOT EXISTS public.boards
(
    id integer NOT NULL DEFAULT nextval('boards_id_seq'::regclass),
    title character varying(100) COLLATE pg_catalog."default" NOT NULL,
    project_id bigint,
    CONSTRAINT boards_pkey PRIMARY KEY (id),
    CONSTRAINT fk_boards_project FOREIGN KEY (project_id)
        REFERENCES public.projects (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.boards
    OWNER to postgres;
-- Table: public.elements

-- DROP TABLE IF EXISTS public.elements;

CREATE TABLE IF NOT EXISTS public.elements
(
    id character varying(36) COLLATE pg_catalog."default" NOT NULL,
    type character varying(50) COLLATE pg_catalog."default" NOT NULL,
    board_id integer NOT NULL,
    data jsonb NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT elements_pkey PRIMARY KEY (id),
    CONSTRAINT fk_elements_board FOREIGN KEY (board_id)
        REFERENCES public.boards (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.elements
    OWNER to postgres;
-- Table: public.project_users

-- DROP TABLE IF EXISTS public.project_users;

CREATE TABLE IF NOT EXISTS public.project_users
(
    id integer NOT NULL DEFAULT nextval('project_users_id_seq'::regclass),
    user_id integer NOT NULL,
    project_id integer NOT NULL,
    role integer NOT NULL,
    CONSTRAINT project_users_pkey PRIMARY KEY (id),
    CONSTRAINT unique_user_project UNIQUE (user_id, project_id),
    CONSTRAINT fk_project FOREIGN KEY (project_id)
        REFERENCES public.projects (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE,
    CONSTRAINT fk_user FOREIGN KEY (user_id)
        REFERENCES public.users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.project_users
    OWNER to postgres;
-- Table: public.projects

-- DROP TABLE IF EXISTS public.projects;

CREATE TABLE IF NOT EXISTS public.projects
(
    id integer NOT NULL DEFAULT nextval('projects_id_seq'::regclass),
    title character varying(255) COLLATE pg_catalog."default" NOT NULL,
    description text COLLATE pg_catalog."default",
    creation_date date NOT NULL DEFAULT CURRENT_DATE,
    CONSTRAINT projects_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.projects
    OWNER to postgres;
-- Table: public.users

-- DROP TABLE IF EXISTS public.users;

CREATE TABLE IF NOT EXISTS public.users
(
    id integer NOT NULL DEFAULT nextval('users_id_seq'::regclass),
    name character varying(100) COLLATE pg_catalog."default",
    email character varying(100) COLLATE pg_catalog."default",
    password character varying(100) COLLATE pg_catalog."default",
    CONSTRAINT users_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.users
    OWNER to postgres;
-- SEQUENCE: public.boards_id_seq

-- DROP SEQUENCE IF EXISTS public.boards_id_seq;

CREATE SEQUENCE IF NOT EXISTS public.boards_id_seq
    INCREMENT 1
    START 1
    MINVALUE 1
    MAXVALUE 2147483647
    CACHE 1;

ALTER SEQUENCE public.boards_id_seq
    OWNED BY public.boards.id;

ALTER SEQUENCE public.boards_id_seq
    OWNER TO postgres;
-- SEQUENCE: public.project_users_id_seq

-- DROP SEQUENCE IF EXISTS public.project_users_id_seq;

CREATE SEQUENCE IF NOT EXISTS public.project_users_id_seq
    INCREMENT 1
    START 1
    MINVALUE 1
    MAXVALUE 2147483647
    CACHE 1;

ALTER SEQUENCE public.project_users_id_seq
    OWNED BY public.project_users.id;

ALTER SEQUENCE public.project_users_id_seq
    OWNER TO postgres;
-- SEQUENCE: public.projects_id_seq

-- DROP SEQUENCE IF EXISTS public.projects_id_seq;

CREATE SEQUENCE IF NOT EXISTS public.projects_id_seq
    INCREMENT 1
    START 1
    MINVALUE 1
    MAXVALUE 2147483647
    CACHE 1;

ALTER SEQUENCE public.projects_id_seq
    OWNED BY public.projects.id;

ALTER SEQUENCE public.projects_id_seq
    OWNER TO postgres;
-- SEQUENCE: public.users_id_seq

-- DROP SEQUENCE IF EXISTS public.users_id_seq;

CREATE SEQUENCE IF NOT EXISTS public.users_id_seq
    INCREMENT 1
    START 1
    MINVALUE 1
    MAXVALUE 2147483647
    CACHE 1;

ALTER SEQUENCE public.users_id_seq
    OWNED BY public.users.id;

ALTER SEQUENCE public.users_id_seq
    OWNER TO postgres;