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
    password         varchar(255)

);

--creation of table to store notifications
create table if not exists public.notifications (
    id serial not null constraint notification_pkey primary key,
    message varchar(255),
    read boolean,
    date_created timestamp,
    user_id integer not null constraint fk_person_id references public.persons
);

--altering a table
-- ALTER TABLE public.person ADD COLUMN date_registered timestamp;