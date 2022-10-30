CREATE DATABASE smartdash_db;

CREATE SCHEMA IF NOT EXISTS public;

--creation of tables related to users
create table if not exists public.persons (
        id           serial not null constraint pessoa_pkey primary key,
        name         varchar(255),
        cpf          varchar(12),
        birthdate timestamp,
        sex           varchar(3),
        email           varchar(255),
        date_registered timestamp,
        last_accessed timestamp,
        term_agreed boolean,
    password         varchar(255),

);

--altering a table
-- ALTER TABLE public.person ADD COLUMN date_registered timestamp;