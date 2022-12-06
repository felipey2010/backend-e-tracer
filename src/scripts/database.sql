--replace database name with production or local name
CREATE DATABASE smartdash_db;

--Local Database
--CREATE DATABASE smartdash_local;


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

--register requests for password reset
create table if not exists public.password_reset_requests (
    id serial not null constraint password_request_id primary key,
    user_id integer not null constraint fk_user_id references public.persons,
    verification_code varchar(8) not null,
    password_reset_token varchar(255),
    date_created timestamp not null,
    date_verified timestamp
);


--create rooms
create table if not exists public.rooms (
    id serial not null constraint room_pkey primary key,
    name varchar(50),
    image varchar(255),
    date_created timestamp not null,
    user_id integer not null constraint fk_room_owner_id references public.persons
);

--altering a table
-- ALTER TABLE public.person ADD COLUMN date_registered timestamp;

