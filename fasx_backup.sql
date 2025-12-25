--
-- PostgreSQL database dump
--

\restrict hYPgzm6QlnHi2wUkNPhycHpdEsrY23L08NFlV8DqATb1xmxBkkzqkRz9RVGPo6G

-- Dumped from database version 15.14 (Debian 15.14-1.pgdg12+1)
-- Dumped by pg_dump version 15.14 (Debian 15.14-1.pgdg12+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: fasx_user
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO fasx_user;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: fasx_user
--

COMMENT ON SCHEMA public IS '';


--
-- Name: WorkoutType; Type: TYPE; Schema: public; Owner: fasx_user
--

CREATE TYPE public."WorkoutType" AS ENUM (
    'Running',
    'XC_Skiing_Classic',
    'XC_Skiing_Skate',
    'RollerSki_Classic',
    'StrengthTraining',
    'Other',
    'Bike',
    'RollerSki_Skate'
);


ALTER TYPE public."WorkoutType" OWNER TO fasx_user;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: DailyInformation; Type: TABLE; Schema: public; Owner: fasx_user
--

CREATE TABLE public."DailyInformation" (
    id integer NOT NULL,
    "userId" text NOT NULL,
    date timestamp(3) without time zone NOT NULL,
    main_param text,
    physical integer DEFAULT 0 NOT NULL,
    mental integer DEFAULT 0 NOT NULL,
    sleep_quality integer DEFAULT 0 NOT NULL,
    pulse integer,
    sleep_duration text,
    comment text,
    created_at timestamp(3) without time zone DEFAULT now() NOT NULL,
    CONSTRAINT "DailyInformation_mental_check" CHECK (((mental >= 0) AND (mental <= 10))),
    CONSTRAINT "DailyInformation_physical_check" CHECK (((physical >= 0) AND (physical <= 10))),
    CONSTRAINT "DailyInformation_pulse_check" CHECK (((pulse >= 30) AND (pulse <= 250))),
    CONSTRAINT "DailyInformation_sleep_quality_check" CHECK (((sleep_quality >= 0) AND (sleep_quality <= 10)))
);


ALTER TABLE public."DailyInformation" OWNER TO fasx_user;

--
-- Name: DailyInformation_id_seq; Type: SEQUENCE; Schema: public; Owner: fasx_user
--

CREATE SEQUENCE public."DailyInformation_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."DailyInformation_id_seq" OWNER TO fasx_user;

--
-- Name: DailyInformation_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: fasx_user
--

ALTER SEQUENCE public."DailyInformation_id_seq" OWNED BY public."DailyInformation".id;


--
-- Name: Follow; Type: TABLE; Schema: public; Owner: fasx_user
--

CREATE TABLE public."Follow" (
    id text NOT NULL,
    "followerId" text NOT NULL,
    "followingId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Follow" OWNER TO fasx_user;

--
-- Name: Profile; Type: TABLE; Schema: public; Owner: fasx_user
--

CREATE TABLE public."Profile" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "fullName" text NOT NULL,
    bio text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    gender text DEFAULT 'Мужчина'::text,
    "sportType" text DEFAULT 'Лыжные гонки'::text,
    club text DEFAULT 'Не указан'::text,
    association text DEFAULT 'ФЛГР'::text,
    "hrZones" jsonb DEFAULT '{"I1": "118-143", "I2": "143-161", "I3": "161-171", "I4": "171-181", "I5": "181-200"}'::jsonb,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Profile" OWNER TO fasx_user;

--
-- Name: User; Type: TABLE; Schema: public; Owner: fasx_user
--

CREATE TABLE public."User" (
    id text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    name text NOT NULL,
    "avatarUrl" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "isVerified" boolean DEFAULT false NOT NULL,
    "verificationToken" text
);


ALTER TABLE public."User" OWNER TO fasx_user;

--
-- Name: Workout; Type: TABLE; Schema: public; Owner: fasx_user
--

CREATE TABLE public."Workout" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    distance double precision,
    duration integer NOT NULL,
    date timestamp(3) without time zone NOT NULL,
    "zone1Min" integer DEFAULT 0 NOT NULL,
    "zone2Min" integer DEFAULT 0 NOT NULL,
    "zone3Min" integer DEFAULT 0 NOT NULL,
    "zone4Min" integer DEFAULT 0 NOT NULL,
    "zone5Min" integer DEFAULT 0 NOT NULL,
    type public."WorkoutType" NOT NULL,
    name text NOT NULL,
    comment text,
    effort integer,
    feeling integer,
    "updatedAt" timestamp(3) without time zone
);


ALTER TABLE public."Workout" OWNER TO fasx_user;

--
-- Name: DailyInformation id; Type: DEFAULT; Schema: public; Owner: fasx_user
--

ALTER TABLE ONLY public."DailyInformation" ALTER COLUMN id SET DEFAULT nextval('public."DailyInformation_id_seq"'::regclass);


--
-- Data for Name: DailyInformation; Type: TABLE DATA; Schema: public; Owner: fasx_user
--

COPY public."DailyInformation" (id, "userId", date, main_param, physical, mental, sleep_quality, pulse, sleep_duration, comment, created_at) FROM stdin;
1	cmc5e85an0000qq8ty9tz0rxl	2025-09-30 00:00:00	syk	10	10	10	80	07:30	test	2025-09-30 19:18:49.786
4	cmc5e85an0000qq8ty9tz0rxl	2025-09-28 00:00:00	fridag	5	5	5	89	07:40	Test4	2025-10-01 13:05:51.318
5	cmc5e85an0000qq8ty9tz0rxl	2025-09-27 00:00:00	skadet	3	3	3	\N	\N	er	2025-10-01 13:12:44.598
6	cmc5e85an0000qq8ty9tz0rxl	2025-09-25 00:00:00	skadet	5	3	5	90	09:30	test	2025-10-01 14:27:01.407
7	cmc5e85an0000qq8ty9tz0rxl	2025-09-26 00:00:00	\N	4	3	0	70	\N	Test	2025-10-01 14:35:59.232
8	cmc5e85an0000qq8ty9tz0rxl	2025-09-24 00:00:00	\N	3	2	0	75	\N	test9	2025-10-01 14:37:19.344
3	cmc5e85an0000qq8ty9tz0rxl	2025-09-29 00:00:00	fridag	4	6	2	88	11:12	test 3	2025-10-01 13:03:17.61
9	cmc5e85an0000qq8ty9tz0rxl	2025-09-23 00:00:00	syk	3	3	6	100	11:00	test 20	2025-10-01 14:58:13.089
2	cmc5e85an0000qq8ty9tz0rxl	2025-10-01 00:00:00	syk	3	3	8	70	08:30	Test 8	2025-10-01 07:47:04.2
10	cmc5e85an0000qq8ty9tz0rxl	2025-10-02 00:00:00	fridag	5	6	3	90	09:00	Все круто	2025-10-01 21:29:48.951
11	cmc5e85an0000qq8ty9tz0rxl	2025-11-20 00:00:00	fridag	6	0	6	60	07:30	\N	2025-11-20 19:28:17.251
12	cmc5e85an0000qq8ty9tz0rxl	2025-12-10 00:00:00	skadet	5	5	7	70	07:30	Тест	2025-12-11 13:13:58.466
13	cmc5e85an0000qq8ty9tz0rxl	2025-12-15 00:00:00	paReise	6	6	6	60	07:20	Test	2025-12-15 17:39:18.788
14	cmc5e85an0000qq8ty9tz0rxl	2025-12-16 00:00:00	syk	9	6	6	60	07:20	test	2025-12-16 15:11:51.855
\.


--
-- Data for Name: Follow; Type: TABLE DATA; Schema: public; Owner: fasx_user
--

COPY public."Follow" (id, "followerId", "followingId", "createdAt") FROM stdin;
\.


--
-- Data for Name: Profile; Type: TABLE DATA; Schema: public; Owner: fasx_user
--

COPY public."Profile" (id, "userId", "fullName", bio, "createdAt", gender, "sportType", club, association, "hrZones", "updatedAt") FROM stdin;
cmj8ptnj70001v1hxhagcmsxw	cmc5e85an0000qq8ty9tz0rxl	Максим	Биография t	2025-12-16 15:06:17.826	Мужчина	Лыжные гонки	Bivium	ФЛГР	{"I1": "120-150", "I2": "150-160", "I3": "161-170", "I4": "171-180", "I5": "181-190"}	2025-12-16 16:51:08.944
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: fasx_user
--

COPY public."User" (id, email, password, name, "avatarUrl", "createdAt", "isVerified", "verificationToken") FROM stdin;
cmc5a4nra0000qql0ktipo3xt	test@gmail.com	$2b$10$pGFyCtlOeSvSKALxs4hsCuOhwutFo/CAnQajjjJIjBPCGzuQag1DK	test	\N	2025-06-20 20:45:42.598	f	\N
cmc7s84qs0000qqpxmtq85jf2	maksim@gmail.com	$2b$10$IJNdNc06TVfcBvGTdhWmL.MDd601NyS5hhjTSN61ecuHy57QSIpW2	Максим	\N	2025-06-22 14:47:50.02	f	\N
cmdc2p03p0000qq3nvjrtqni5	test@yandex.ru	$2b$10$DtxKnarwOhY7pW8EldQdsOAUp0uF7ahCRLfvhtuj3aSpmz0ilStfm	test	\N	2025-07-20 19:31:40.357	f	\N
cmfllpbhj0000v1h5tbrg5hrj	test@mail.com	$2b$10$Oek.29olexyPOxfmIk4TbueiB.9Be87EC5VAELNjI6GjzcvQpbSfe	test1	\N	2025-09-15 20:53:08.071	f	\N
cmflmegt10002v1modjcgdmq8	test3@mail.ru	$2b$10$srrbNbth/Ac5oFcUUK34WudkicrS..BD/qu/jDgggoomuwiC2qRsK	test3	\N	2025-09-15 21:12:41.365	f	\N
cmflmhg840005v1moxwof6339	test4@mail.com	$2b$10$H8N4.wLrWXhGZ9vP/dyFPO8W1r.6NPUEt/Wd0c3HNntuhUNW6eJny	test4	\N	2025-09-15 21:15:00.581	f	\N
cmfnqi2c60000v1wrs22t5ot3	test1709@mail.ru	$2b$10$b5LUsHpnVUeUDAafeUW96OzSJzyuMJdUZa4C5wlJ0HFBhF70cEt5.	test	\N	2025-09-17 08:43:00.055	f	\N
cmgcfu9ws0000v1sdamjju060	test2@mail.ru	$2b$10$xL41x2U/UU20YRaBSNzkCuHtRMMMOGjw6Qvog6uXcW/lMgHeWA1xO	test1	\N	2025-10-04 15:38:48.365	f	22667b408d7e693ce042e59b1585eb5c26540d5257195eb92e99d1eaadaed752
cmgcfwzgf0000v1u6zihvfya2	pep3@mail.ru	$2b$10$q7zImJBJpdCersV15xKa5.W9/JKJj50e16/xnaE99/S7xC9gzwLeq	test5	\N	2025-10-04 15:40:54.783	f	9f60cedda11413474bfa7bee3bd4fe6813df933fd151e4436ad881ba78333cd2
cmgcfzvgi0000v1w6rhrorrlg	test6@mail.ru	$2b$10$nSFhGV/cHSZMoG4zcptNK.hduxjtfFTo.7xQrCMkTkds5/ZI/QMJu	test6	\N	2025-10-04 15:43:09.571	f	ff0ae2769c504d1d9a49968ec4fbb5421abf9b7b739ffe7f8feebafd672f51cb
cmgcg5jm60000v1xs30858mio	test7@mail.ru	$2b$10$HzXKLhYuPteANjsTa8ZTHuZB7pt1lcsaUUoZYhQmA2imAEY8GnrP6	test6	\N	2025-10-04 15:47:34.158	f	98fc0e6895751a07169b0e806fc2aaed350a3a595d8b57fc45e141b6cb8b4024
cmgcges670000v11ug58h882b	test8@mail.ru	$2b$10$G1w1H.8vTlMsKD.p.RQqFu/PuOpxLL2Lq7fMKdu/ZXIeJKC9G6Bw2	test7	\N	2025-10-04 15:54:45.151	f	6e2be5219269e54ac6c9af8686be6e35bb8d036f67777fda43cd407720d836fd
cmgcgj5oq0000v13l3vm4v64o	test9@mail.ru	$2b$10$ghqY6n93sq5taQi7S613t.QCgvPHC7oQtpgFpYRRuHskfSwgFvle6	test9	\N	2025-10-04 15:58:09.29	f	2f884bff5c853a04b884a611cedefa12f9c6b1c70bfffbcfca50e5407441e226
cmgcgmq240000v14z56vdwh38	test10@mail.ru	$2b$10$p05PX6glpkNHggV7bYXFbueeU8dcauyv5fj4Rof.iZcnbj8dq0OfW	test10	\N	2025-10-04 16:00:55.66	f	81c23e2a29fefdd22ff14e35e03952d71aa7aea1e3a510ea4da9fb986a81f3f4
cmgcgvo0r0000v17fz1a7cdgx	test12@mail.ru	$2b$10$GRbeiCjgP1hGSyTHX5a9neX8gN/ZLjqMlrCXcEPC9HdyEUf3PzYU6	test12	\N	2025-10-04 16:07:52.924	f	919928e38617659e340f19dc5406c6d53cade2c438efee9cfd55501dff552fb1
cmgckk4ir0000v1u752gi172i	test14@mail.ru	$2b$10$6ip1vy.Ygtf0Ygv2xRKq2uy5jsBEJ4mNLexTXCLCoeFswG5S0RjDW	test14	\N	2025-10-04 17:50:52.9	f	a34d976cdafb7224c9cc4beff022c0f4d225e7caaf4ce4cb18a3ca9f5c402e25
cmgckppmy0000v1xsb9aibmay	test20@mail.ru	$2b$10$b9EKYjiPR03fHUA5p0Z4DeHANj.63PX.llKfLHp0KyiBh1fFFT6kC	test20	\N	2025-10-04 17:55:13.546	f	cddc887bd0e1d58a1feee1b78a48362586e954955706efcfacc1e576e23a3b60
cmgcly1yj0000v1a38bkna3ec	test21@mail.ru	$2b$10$7JjhjwZyLNz1VqTdIzA5WuERqITfnpNeNXmJpQMsGqampUyHdjo.C	test20	\N	2025-10-04 18:29:42.38	f	f7faf90533f00d78c7f7427093a90d6108710b7003bd6aefd40dbfe7f42b4c3e
cmgclyyj80000v1c8ezs1bazf	test22@mail.ru	$2b$10$dy/mKfwxmrxKvTjpDe/KB.bd2kdLliLpIkwijIWts.1OB5hTQA8aK	test22	\N	2025-10-04 18:30:24.596	f	93e9e28162482cce047ab59331c75561ea48eb73b33b04c82ee238679743a46e
cmgcm3vpy0000v1epbp73t8qz	test23@mail.ru	$2b$10$uD3XQ823d92Vvm2.mJsXOOJSaJXmUl5jUYDYEc1KPKizSZ5SqrbeO	test23	\N	2025-10-04 18:34:14.23	f	293c12ec5ad10c7cb9b7b37a54cf873b99b1625dcec5184f06cb4c377fa19b60
cmgcm7xcv0000v1ge0rhsjkre	test24@mail.ru	$2b$10$oRT6POP6zWFLQ4GiWISq1O5oGpYBqdSCxIwRQ0YBB/B7VEaoAa84i	test24	\N	2025-10-04 18:37:22.975	f	11f434f17538052323747e9fc265508b968336ea3d426223e5888dd852158363
cmgcdja900000v10oeilvvbcy	none3	$2b$10$LFtIGBUf7Mc6HAtkY2/Gd.iW9XljuAbJy2HIxUK/oLjaAAraWilqC	testreg	\N	2025-10-04 14:34:16.356	f	\N
cmgcf3ljb0000v1ixx4bptsva	none2	$2b$10$jzQpZqRKGE61mwcH4/9c2.Or1qVgborQygSJ2GdCBwu5N3UP6xs26	test	\N	2025-10-04 15:18:03.719	f	9319500ac1266af904f825eff846b40892a97fbca90c2f5136e9c4e34fd9a84d
cmgcf7qyp0000v1knr3txpj8y	none1	$2b$10$8t1K1OKKDXpdG7WxIrlRSeSW7oSZKQ1YSL.IosCjssmzAOuZbOxFS	test	\N	2025-10-04 15:21:17.378	f	5eed0dee98bab5b3689c7446018cee21228cf779d7f4a12f972b24fb8a105a3b
cmgcfnpxn0000v1pxayfm4b9m	none	$2b$10$o1YMbVDQHFLKQd/kWubRJupCAzQIymgBgWpDpPQaRFV0EI7k4QCEq	test	\N	2025-10-04 15:33:42.54	f	4637d91794a3e8d46d2fc836e0852ec5e691ca281a25c0eeb00d5a2eb9286587
cmgcn4b0i0000v1r7sx2euacd	none4	$2b$10$OZM9H1V5diiyAvBKc.6aqOU8.bjXN0C.kI2KDZ0/qVjY5GpzqSiWq	maksimblj	\N	2025-10-04 19:02:33.666	f	a297e40affd79460d11a910f73c77201674daa84a6ea6b6fb820c20d56fb1369
cmgcndfc20000v1uxavpdvyrq	none5	$2b$10$HN6CGIllLgj4nJVRFd6no.TObMucH2tfJIE0BVv9FQ/KAkuYGV8EG	maksimtest	\N	2025-10-04 19:09:39.17	f	eef3243b1933376cbdb9aae738f64309bd6b64de0a2662b6abd1739a9f6ab301
cmgcnzo4r0001v1uxw987nf1a	none6	$2b$10$vi08R.To7kQwnOl2oJUTt.pR0jxv18NopmrudGPG1b5sgIW.izf5y	test25	\N	2025-10-04 19:26:57.003	f	735ea3487c748383cc154d9b61561f92c0f01c3b4bae028b5630930ab1f47984
cmgcoassa0000v164ifq3p2x8	none7	$2b$10$4UV9eOeNCkqR1NksAuWr1.YMOpbvovUXwskGyE72Mr2Ap/EMPBToW	mxtest1	\N	2025-10-04 19:35:36.25	f	27afd5d7760f2419aa9a5ffbb19eaf4cf05054d2f7020364d117540dec9a173d
cmgcofpgw0000v19l8kif3nmr	none8	$2b$10$jmp0efQ84YEQuHUN/uJAZun98WO7l1w/Fn/UDPeDGWyLrJgMRw/pq	mxtest2	\N	2025-10-04 19:39:25.232	f	ca4f53eb46996e0eed61e9391a63d094cec7230e2bc3a8767091d0214e280434
cmgcombf80000v1czzfxkhw2l	mb1@mail.ru	$2b$10$wPxRjoNMH/7UCmubuNlMrur5YFvGpMI9nYw/SB1aqZk0RpHMIAdFO	mbtest1	\N	2025-10-04 19:44:33.62	f	44ccb92e04fc6d5caefe50f5b3f83df977ee28c7f66a9e85a0c5fbf7b4a87755
cmgcox4x00000v1ftw56qa211	mb2@mail.ru	$2b$10$ZaNqU8JKod94Uiql.kWGNeSjtiRSTu287bUgHuWH5V7QIf8whPs5G	mb2	\N	2025-10-04 19:52:58.404	f	1c187fcd85232dcc55a32f651af009d72cfe3d3651905a2e46fe32c1f9ceaf76
cmc5e85an0000qq8ty9tz0rxl	baliabin.maksim@gmail.com	$2b$10$VIQRw5F1lgN2UhxXDsuuEeC1SoPfFnTeL6L..iEZoS3QjvCWi1xIy	Максим Балябин	\N	2025-06-20 22:40:23.759	f	\N
\.


--
-- Data for Name: Workout; Type: TABLE DATA; Schema: public; Owner: fasx_user
--

COPY public."Workout" (id, "userId", "createdAt", distance, duration, date, "zone1Min", "zone2Min", "zone3Min", "zone4Min", "zone5Min", type, name, comment, effort, feeling, "updatedAt") FROM stdin;
cmc5cpjg10002qql0xb9yrz3h	cmc5a4nra0000qql0ktipo3xt	2025-06-20 21:57:56.016	15.5	90	2025-06-20 07:00:00	10	20	30	20	10	Running	Утренняя пробежка	Отличная тренировка	\N	\N	\N
cmcey91ye0001qq589vnqglgk	cmc5e85an0000qq8ty9tz0rxl	2025-06-27 15:10:53.989	8.9	64	2025-06-16 00:00:00	12	41	9	2	0	Running	Lop		10	8	2025-06-27 15:10:53.989
cmceybe900005qq58e4fiyvbe	cmc5e85an0000qq8ty9tz0rxl	2025-06-27 15:12:43.235	\N	43	2025-06-16 00:00:00	43	0	0	0	0	StrengthTraining	Styrke	Силовая тренировка	10	9	2025-06-27 15:12:43.235
cmceyen7l0007qq58f3jt4d13	cmc5e85an0000qq8ty9tz0rxl	2025-06-27 15:15:14.804	31.4	121	2025-06-17 00:00:00	92	26	3	0	0	RollerSki_Classic	Rulleski klassisk		10	8	2025-06-27 15:15:14.804
cmceyihpo0009qq587yue070u	cmc5e85an0000qq8ty9tz0rxl	2025-06-27 15:18:14.314	35.9	120	2025-06-18 00:00:00	78	39	1	1	1	RollerSki_Skate	Rulleski Skoyting		10	8	2025-06-27 15:18:14.314
cmceykb3y000bqq58o71gln7t	cmc5e85an0000qq8ty9tz0rxl	2025-06-27 15:19:39.07	17.4	60	2025-06-19 00:00:00	32	23	4	1	0	RollerSki_Classic	Rulleski klassisk		9	9	2025-06-27 15:19:39.07
cmceylpvz000dqq58hdlevah6	cmc5e85an0000qq8ty9tz0rxl	2025-06-27 15:20:44.868	\N	35	2025-06-19 00:00:00	35	0	0	0	0	StrengthTraining	Styrke		10	10	2025-06-27 15:20:44.868
cmceynu5r000fqq58qis1072i	cmc5e85an0000qq8ty9tz0rxl	2025-06-27 15:22:23.713	32.6	120	2025-06-20 00:00:00	49	41	21	8	1	RollerSki_Skate	Rulleski Skoyting		10	8	2025-06-27 15:22:23.713
cmceyaino0003qq58yeu9n3wl	cmc5e85an0000qq8ty9tz0rxl	2025-06-27 15:12:02.292	\N	17	2025-06-16 00:00:00	17	0	0	0	0	StrengthTraining	XC Training	Тренировка с эспандером	10	10	2025-06-27 15:43:43.771
cmceypntd000hqq58cikqvbtg	cmc5e85an0000qq8ty9tz0rxl	2025-06-27 15:23:48.816	39.3	136	2025-06-22 00:00:00	83	50	3	0	0	RollerSki_Skate	Rulleski Skoyting		9	8	2025-06-27 19:30:52.039
cmcoidr9z0001qqie0niqn2ke	cmc5e85an0000qq8ty9tz0rxl	2025-07-04 07:44:21.334	17.5	60	2025-06-24 00:00:00	34	24	2	0	0	RollerSki_Classic	Rulleski klassisk		9	9	2025-07-04 07:44:21.334
cmcoiexnh0003qqiec4rjxi69	cmc5e85an0000qq8ty9tz0rxl	2025-07-04 07:45:16.253	\N	60	2025-06-24 00:00:00	60	0	0	0	0	StrengthTraining	Styrke		9	8	2025-07-04 07:45:16.253
cmcok0kjh0005qqieqxqdaig6	cmc5e85an0000qq8ty9tz0rxl	2025-07-04 08:30:05.296	\N	16	2025-06-25 00:00:00	16	0	0	0	0	StrengthTraining	Styrke		9	8	2025-07-04 08:30:05.296
cmcumvgye0001qq1djmpq2pwm	cmc5e85an0000qq8ty9tz0rxl	2025-07-08 14:36:43.272	30.9	118	2025-06-25 00:00:00	79	32	2	5	0	RollerSki_Classic	Rulleski klassisk		8	9	2025-07-08 14:36:43.272
cmcumx2nz0003qq1dby0xjzv8	cmc5e85an0000qq8ty9tz0rxl	2025-07-08 14:37:58.078	23.4	90	2025-06-28 00:00:00	25	53	10	1	1	RollerSki_Skate	Rulleski skoyte		8	8	2025-07-08 14:37:58.078
cmcumyg470005qq1dodboi2pk	cmc5e85an0000qq8ty9tz0rxl	2025-07-08 14:39:02.166	25.6	91	2025-06-28 00:00:00	11	46	24	10	0	RollerSki_Classic	Rulleski klassisk		9	7	2025-07-08 14:39:02.166
cmcumzzch0007qq1dhbaatqzw	cmc5e85an0000qq8ty9tz0rxl	2025-07-08 14:40:13.744	33.5	119	2025-06-29 00:00:00	33	45	31	10	0	RollerSki_Skate	Rulleski skoyte		8	8	2025-07-08 14:40:13.744
cmcuni5cx000bqq1dmbaef8si	cmc5e85an0000qq8ty9tz0rxl	2025-07-08 14:54:21.344	16.3	63	2025-07-04 00:00:00	16	30	11	6	0	RollerSki_Classic	Rulleski klassisk		9	8	2025-07-08 14:54:21.344
cmcunjx3e000dqq1d9jdgw73w	cmc5e85an0000qq8ty9tz0rxl	2025-07-08 14:55:43.946	31	75	2025-07-05 00:00:00	0	0	0	0	75	RollerSki_Skate	Rulleski skoyte		10	7	2025-07-08 14:55:43.946
cmcungwib0009qq1djwf1czvw	cmc5e85an0000qq8ty9tz0rxl	2025-07-08 14:53:23.208	25.2	87	2025-07-03 00:00:00	35	46	6	0	0	RollerSki_Skate	Rulleski skoyte		8	8	2025-07-08 14:58:56.049
cmdr7tnsa0001qqqa3ud3sz43	cmc5e85an0000qq8ty9tz0rxl	2025-07-31 09:51:48.394	\N	56	2025-07-07 00:00:00	56	0	0	0	0	StrengthTraining	Styrke		9	9	2025-07-31 09:51:48.394
cme4p53ho0003qq3jk8u2cavj	cmc5e85an0000qq8ty9tz0rxl	2025-08-09 20:17:35.724	17.4	57	2025-08-02 00:00:00	32	23	2	0	0	RollerSki_Skate	Rulleski skoyte		9	8	2025-08-09 20:17:35.724
cmdrhj1mw000fqqqakfzenqsc	cmc5e85an0000qq8ty9tz0rxl	2025-07-31 14:23:29.288	10	57	2025-07-11 00:00:00	57	0	0	0	0	Bike	Вело	Велосипед	5	5	2025-07-31 14:23:29.288
cmdrr903g0001qqfbzi0atl70	cmc5e85an0000qq8ty9tz0rxl	2025-07-31 18:55:36.891	9.8	60	2025-07-28 00:00:00	24	31	5	0	0	Running	Lop		10	8	2025-07-31 18:55:58.211
cmdrrbsv10003qqfbq5oi50i2	cmc5e85an0000qq8ty9tz0rxl	2025-07-31 18:57:47.475	17.5	60	2025-07-29 00:00:00	39	21	0	0	0	RollerSki_Classic	Rulleski klassisk		9	8	2025-07-31 18:57:47.475
cmdrrdpsw0005qqfbgw0vhq2k	cmc5e85an0000qq8ty9tz0rxl	2025-07-31 18:59:16.831	17.2	66	2025-07-30 00:00:00	30	35	1	0	0	RollerSki_Skate	Rulleski skoyte		8	8	2025-07-31 18:59:16.831
cme4p6j9y0005qq3jfee4h9z3	cmc5e85an0000qq8ty9tz0rxl	2025-08-09 20:18:42.837	17.5	61	2025-08-04 00:00:00	24	37	0	0	0	RollerSki_Skate	Rulleski skoyte	Утренняя разминка	7	9	2025-08-09 20:18:42.837
cme4p7s8z0007qq3jp9uaihek	cmc5e85an0000qq8ty9tz0rxl	2025-08-09 20:19:41.109	17.4	62	2025-08-04 00:00:00	25	37	0	0	0	RollerSki_Classic	Rulleski klassisk	Разминка перед силовой тренировкой	7	10	2025-08-09 20:19:41.109
cme4p8iy00009qq3j2w3l8a3n	cmc5e85an0000qq8ty9tz0rxl	2025-08-09 20:20:15.719	\N	57	2025-08-04 00:00:00	57	0	0	0	0	StrengthTraining	Styrke	Силовая тренировка	10	10	2025-08-09 20:20:15.719
cmcunlffk000fqq1dir9kn3an	cmc5e85an0000qq8ty9tz0rxl	2025-07-08 14:56:54.368	24.3	90	2025-07-07 00:00:00	90	0	0	0	0	RollerSki_Skate	Rulleski skoyte		7	10	2025-07-31 20:39:17.088
cmdrrfojb0007qqfb77aeaf4u	cmc5e85an0000qq8ty9tz0rxl	2025-07-31 19:00:48.502	20	68	2025-07-31 00:00:00	61	6	1	0	0	RollerSki_Skate	Rulleski skoyte		10	9	2025-07-31 20:44:34.391
cme4pagb8000bqq3js71boizn	cmc5e85an0000qq8ty9tz0rxl	2025-08-09 20:21:45.619	31.6	115	2025-08-05 00:00:00	30	35	23	27	0	RollerSki_Skate	Rulleski skoyte Interval	Интервальная тренировка 4*10 в  I3	10	7	2025-08-09 20:21:45.619
cme4pd5b9000dqq3js2i8f386	cmc5e85an0000qq8ty9tz0rxl	2025-08-09 20:23:51.332	18.5	175	2025-08-06 00:00:00	129	38	8	0	0	Running	Running with poles	Шаговая имитация в зоне I1	10	8	2025-08-09 20:23:51.332
cme4p37iv0001qq3jrlyrzr49	cmc5e85an0000qq8ty9tz0rxl	2025-08-09 20:16:07.638	16.4	61	2025-08-01 00:00:00	30	29	2	0	0	RollerSki_Classic	Rulleski klassisk	Тренировка на лыжероллерах классическим стилем	9	8	2025-08-09 20:16:28.224
cme4pepg1000fqq3jedh80ct2	cmc5e85an0000qq8ty9tz0rxl	2025-08-09 20:25:04.071	15.6	63	2025-08-07 00:00:00	31	29	3	0	0	RollerSki_Skate	Rulleski skoyte	Утренняя разминка на лыжероллерах	7	10	2025-08-09 20:25:04.071
cme4pgeow000hqq3jzlvuw8un	cmc5e85an0000qq8ty9tz0rxl	2025-08-09 20:26:23.455	14.2	65	2025-08-07 00:00:00	59	6	0	0	0	RollerSki_Classic	Rulleski klassisk	Разминка на лыжероллерах перед силовой тренировкой	7	10	2025-08-09 20:26:23.455
cme4ph13a000jqq3jn0h31o0d	cmc5e85an0000qq8ty9tz0rxl	2025-08-09 20:26:52.485	\N	60	2025-08-07 00:00:00	60	0	0	0	0	StrengthTraining	Styrke	Силовая тренировка	10	10	2025-08-09 20:26:52.485
cme4pm13k000lqq3jgn9523ri	cmc5e85an0000qq8ty9tz0rxl	2025-08-09 20:30:45.764	34.6	124	2025-08-08 00:00:00	44	41	15	13	11	RollerSki_Classic	Rulleski klassisk Interval	Интервальная тренировка на лыжероллерах, 4*10 в зоне I4	10	10	2025-08-09 20:30:45.764
cme4pnu63000nqq3jkd6qw892	cmc5e85an0000qq8ty9tz0rxl	2025-08-09 20:32:10.107	50.6	182	2025-08-09 00:00:00	169	13	0	0	0	RollerSki_Skate	Rulleski skoyte	Длительная, низкоинтенсивная сессия	10	9	2025-08-09 20:32:10.107
cmfjgozzk0005qquac37odqh8	cmc5e85an0000qq8ty9tz0rxl	2025-09-14 08:57:22.735	5.6	30	2025-09-12 00:00:00	30	0	0	0	0	Running	Беговая тренировка		5	6	2025-09-14 08:57:22.735
cmecw0pfe0001qquh5mxrpug7	cmc5e85an0000qq8ty9tz0rxl	2025-08-15 13:52:17.594	10.1	58	2025-08-11 00:00:00	11	37	10	0	0	Running	Lop	Бег по пересеченной местности	10	9	2025-08-15 13:52:17.594
cmecw1snb0005qquhnktgfjxx	cmc5e85an0000qq8ty9tz0rxl	2025-08-15 13:53:08.41	\N	16	2025-08-11 00:00:00	0	16	0	0	0	StrengthTraining	XC training	Резина, тренажер	10	10	2025-08-15 13:53:08.41
cmecw3uw20007qquh3wego2v1	cmc5e85an0000qq8ty9tz0rxl	2025-08-15 13:54:44.641	18.6	62	2025-08-11 00:00:00	52	10	0	0	0	RollerSki_Skate	Rulleski skoyte		7	10	2025-08-15 13:54:44.641
cmecw4hnx0009qquhn9r85pvq	cmc5e85an0000qq8ty9tz0rxl	2025-08-15 13:55:14.157	\N	55	2025-08-11 00:00:00	55	0	0	0	0	StrengthTraining	Styrke	Силовая тренировка	10	10	2025-08-15 13:55:14.157
cmecw7ojl000bqquhbz8ujdtu	cmc5e85an0000qq8ty9tz0rxl	2025-08-15 13:57:43.04	29	120	2025-08-12 00:00:00	94	22	3	1	0	RollerSki_Skate	Rulleski skoyte		8	10	2025-08-15 13:57:43.04
cmecw8ryn000dqquhofdop0rf	cmc5e85an0000qq8ty9tz0rxl	2025-08-15 13:58:34.116	15	60	2025-08-13 00:00:00	31	29	0	0	0	RollerSki_Classic	Rulleski klassisk		9	8	2025-08-15 13:58:34.116
cmecwaprw000fqquh919pcmt6	cmc5e85an0000qq8ty9tz0rxl	2025-08-15 14:00:04.603	13.1	110	2025-08-13 00:00:00	65	29	13	3	0	Running	Running with poles	Шаговая имитация с палками	10	4	2025-08-15 14:00:04.603
cmecwbydf000hqquhot7y9s3x	cmc5e85an0000qq8ty9tz0rxl	2025-08-15 14:01:02.402	17.4	58	2025-08-14 00:00:00	47	11	0	0	0	RollerSki_Skate	Rulleski skoyte		6	10	2025-08-15 14:01:02.402
cmecwciuy000jqquhkn2z9x6b	cmc5e85an0000qq8ty9tz0rxl	2025-08-15 14:01:28.954	\N	55	2025-08-14 00:00:00	55	0	0	0	0	StrengthTraining	Styrke		10	10	2025-08-15 14:01:28.954
cmeq4gf1d0001qqc31g2eckhp	cmc5e85an0000qq8ty9tz0rxl	2025-08-24 20:09:27.841	17.5	60	2025-08-14 00:00:00	49	11	0	0	0	RollerSki_Skate	Rulleski skoyting		9	9	2025-08-24 20:09:27.841
cmeq4gyyi0003qqc3twffbct6	cmc5e85an0000qq8ty9tz0rxl	2025-08-24 20:09:53.658	\N	55	2025-08-14 00:00:00	55	0	0	0	0	StrengthTraining	Styrke		10	10	2025-08-24 20:09:53.658
cmeq4iix40005qqc342pvjrvv	cmc5e85an0000qq8ty9tz0rxl	2025-08-24 20:11:06.184	29.6	106	2025-08-15 00:00:00	49	36	12	6	3	RollerSki_Classic	Rulleski klassisk		10	9	2025-08-24 20:11:06.184
cmeq4jlcf0007qqc37r4ajkhn	cmc5e85an0000qq8ty9tz0rxl	2025-08-24 20:11:55.983	48.4	170	2025-08-16 00:00:00	151	19	0	0	0	RollerSki_Skate	Rulleski skoyting		10	10	2025-08-24 20:11:55.983
cmeq4ksb60009qqc3vz0yvdtv	cmc5e85an0000qq8ty9tz0rxl	2025-08-24 20:12:51.653	11	48	2025-08-18 00:00:00	41	7	0	0	0	RollerSki_Classic	Rulleski klassik		5	8	2025-08-24 20:12:51.653
cmeq4l8hr000bqqc3nxdwzocv	cmc5e85an0000qq8ty9tz0rxl	2025-08-24 20:13:12.639	\N	63	2025-08-18 00:00:00	63	0	0	0	0	StrengthTraining	Styrke		10	10	2025-08-24 20:13:12.639
cmeq4mf8a000dqqc306ughamx	cmc5e85an0000qq8ty9tz0rxl	2025-08-24 20:14:08.025	27.8	102	2025-08-19 00:00:00	28	25	15	22	12	RollerSki_Skate	Rulleski skoyting		10	10	2025-08-24 20:14:08.025
cmeq4ny09000fqqc3ybm263ag	cmc5e85an0000qq8ty9tz0rxl	2025-08-24 20:15:19.016	10.8	105	2025-08-20 00:00:00	101	4	0	0	0	Running	Running with poles		10	10	2025-08-24 20:15:19.016
cmeq4owyp000hqqc38melsr9w	cmc5e85an0000qq8ty9tz0rxl	2025-08-24 20:16:04.32	14	60	2025-08-21 00:00:00	45	15	0	0	0	RollerSki_Skate	Rulleski skoyting		10	10	2025-08-24 20:16:04.32
cmeq4pg47000jqqc3qtbaal3f	cmc5e85an0000qq8ty9tz0rxl	2025-08-24 20:16:29.143	\N	60	2025-08-21 00:00:00	60	0	0	0	0	StrengthTraining	Styrke		10	10	2025-08-24 20:16:29.143
cmeq4qowp000lqqc359zzax94	cmc5e85an0000qq8ty9tz0rxl	2025-08-24 20:17:27.193	33.3	118	2025-08-22 00:00:00	22	60	23	13	0	RollerSki_Classic	Rulleski klassisk		10	6	2025-08-24 20:17:27.193
cmeq4rwmu000nqqc3ooqps8j4	cmc5e85an0000qq8ty9tz0rxl	2025-08-24 20:18:23.848	16.1	61	2025-08-23 00:00:00	24	32	4	1	0	RollerSki_Skate	Rulleski skoyting		10	10	2025-08-24 20:18:23.848
cmf4g8iyn0001qql1t41cpn70	cmc5e85an0000qq8ty9tz0rxl	2025-09-03 20:48:01.533	18.6	66	2025-08-26 00:00:00	39	27	0	0	0	RollerSki_Skate	Rulleski skoyte		8	5	2025-09-03 20:48:01.533
cmf4gbcyq0005qql14e6n3eal	cmc5e85an0000qq8ty9tz0rxl	2025-09-03 20:50:13.729	16	59	2028-08-29 00:00:00	40	17	2	0	0	RollerSki_Classic	Rulleski klassisk		6	4	2025-09-03 20:50:13.729
cmf4ga79o0003qql17wl8rrj0	cmc5e85an0000qq8ty9tz0rxl	2025-09-03 20:49:19.692	17.4	59	2025-08-28 00:00:00	27	23	6	3	0	RollerSki_Skate	Rulleski skoyte	Плохое самочувствие	6	5	2025-09-03 20:51:16.966
cmf4geopv0007qql1pjddlr3e	cmc5e85an0000qq8ty9tz0rxl	2025-09-03 20:52:48.93	16	59	2025-08-29 00:00:00	41	16	2	0	0	RollerSki_Skate	Rulleski skoyte		6	5	2025-09-03 20:52:48.93
cmf4ghnmp0009qql17y74fbgf	cmc5e85an0000qq8ty9tz0rxl	2025-09-03 20:55:07.489	9.9	66	2025-08-30 00:00:00	11	25	28	2	0	Running	Lop		10	2	2025-09-03 20:55:07.489
cmf4gitce000bqql1mn7lsfv0	cmc5e85an0000qq8ty9tz0rxl	2025-09-03 20:56:01.549	9.6	74	2025-09-01 00:00:00	43	22	5	4	0	Running	Lop		10	4	2025-09-03 20:56:01.549
cmf4gkict000dqql1cseljuq8	cmc5e85an0000qq8ty9tz0rxl	2025-09-03 20:57:20.608	15	59	2025-09-02 00:00:00	54	5	0	0	0	RollerSki_Skate	Rulleski skoyte		7	3	2025-09-03 20:57:20.608
cmf4gm3n9000fqql1ppvqrzik	cmc5e85an0000qq8ty9tz0rxl	2025-09-03 20:58:34.869	15	60	2025-09-03 00:00:00	21	26	8	5	0	RollerSki_Classic	Rulleski klassisk		9	3	2025-09-03 20:58:34.869
cmfjgm39r0003qquar0r096tv	cmc5e85an0000qq8ty9tz0rxl	2025-09-14 08:55:07.022	\N	35	2025-09-12 00:00:00	35	0	0	0	0	StrengthTraining	Силовая тренировка	Комплекс упражнений	10	9	2025-09-14 08:55:07.022
cmfjgkpp00001qqua5ebd3sjb	cmc5e85an0000qq8ty9tz0rxl	2025-09-14 08:54:02.76	50	118	2025-09-13 00:00:00	0	0	0	15	103	RollerSki_Skate	Лыжероллеры свободный стиль	Соревнования по лыжероллерам, свободный стиль	10	6	2025-09-14 08:55:35.504
cmflmgf4q0004v1moy1x6eosg	cmflmegt10002v1modjcgdmq8	2025-09-15 21:14:12.506	1	15	2025-09-16 00:00:00	15	0	0	0	0	RollerSki_Classic	test		7	6	2025-09-15 21:14:12.506
cmj7j2x9i0001v1e0z8zo4o1f	cmc5e85an0000qq8ty9tz0rxl	2025-12-15 19:09:46.853	25	45	2025-12-14 00:00:00	30	15	0	0	0	XC_Skiing_Skate	test	test	6	6	2025-12-15 19:09:46.853
cmj7j3mdg0003v1e04aatk7qv	cmc5e85an0000qq8ty9tz0rxl	2025-12-15 19:10:19.396	25	65	2025-12-14 00:00:00	65	0	0	0	0	RollerSki_Skate	test2	test	5	6	2025-12-15 19:10:19.396
cmh3yi1ko0001v1s53g8exd1k	cmc5e85an0000qq8ty9tz0rxl	2025-10-23 21:50:57.144	1.9	15	2025-10-24 00:00:00	15	0	0	0	0	XC_Skiing_Skate	Test	Test	6	5	2025-10-23 21:50:57.144
cmj1fuwrz0001v1bl7uwfi6s5	cmc5e85an0000qq8ty9tz0rxl	2025-12-11 12:52:57.071	12.1	14	2025-12-10 00:00:00	14	0	0	0	0	XC_Skiing_Classic	test		3	3	2025-12-11 13:05:30.548
cmj7j4ngm0005v1e0df3fyege	cmc5e85an0000qq8ty9tz0rxl	2025-12-15 19:11:07.461	25	75	2025-12-15 00:00:00	75	0	0	0	0	RollerSki_Classic	Ski	ski	6	5	2025-12-15 19:11:07.461
cmj7k7vqd0007v1e0moqkd57t	cmc5e85an0000qq8ty9tz0rxl	2025-12-15 19:41:37.765	18	60	2025-12-14 00:00:00	0	60	0	0	0	XC_Skiing_Skate	test	test	7	5	2025-12-15 19:41:37.765
cmj8x2jsv0001v1rn1iotky9o	cmc5e85an0000qq8ty9tz0rxl	2025-12-16 18:29:10.191	50.1	90	2025-12-16 00:00:00	50	20	15	2	3	XC_Skiing_Classic	Лыжи классический стиль	Тренировка прошла хорошо	7	6	2025-12-16 18:29:10.191
\.


--
-- Name: DailyInformation_id_seq; Type: SEQUENCE SET; Schema: public; Owner: fasx_user
--

SELECT pg_catalog.setval('public."DailyInformation_id_seq"', 14, true);


--
-- Name: DailyInformation DailyInformation_pkey; Type: CONSTRAINT; Schema: public; Owner: fasx_user
--

ALTER TABLE ONLY public."DailyInformation"
    ADD CONSTRAINT "DailyInformation_pkey" PRIMARY KEY (id);


--
-- Name: Follow Follow_pkey; Type: CONSTRAINT; Schema: public; Owner: fasx_user
--

ALTER TABLE ONLY public."Follow"
    ADD CONSTRAINT "Follow_pkey" PRIMARY KEY (id);


--
-- Name: Profile Profile_pkey; Type: CONSTRAINT; Schema: public; Owner: fasx_user
--

ALTER TABLE ONLY public."Profile"
    ADD CONSTRAINT "Profile_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: fasx_user
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: Workout Workout_pkey; Type: CONSTRAINT; Schema: public; Owner: fasx_user
--

ALTER TABLE ONLY public."Workout"
    ADD CONSTRAINT "Workout_pkey" PRIMARY KEY (id);


--
-- Name: Profile_userId_key; Type: INDEX; Schema: public; Owner: fasx_user
--

CREATE UNIQUE INDEX "Profile_userId_key" ON public."Profile" USING btree ("userId");


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: fasx_user
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: Follow Follow_followerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fasx_user
--

ALTER TABLE ONLY public."Follow"
    ADD CONSTRAINT "Follow_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Follow Follow_followingId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fasx_user
--

ALTER TABLE ONLY public."Follow"
    ADD CONSTRAINT "Follow_followingId_fkey" FOREIGN KEY ("followingId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Profile Profile_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fasx_user
--

ALTER TABLE ONLY public."Profile"
    ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Workout Workout_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fasx_user
--

ALTER TABLE ONLY public."Workout"
    ADD CONSTRAINT "Workout_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: DailyInformation fk_daily_user; Type: FK CONSTRAINT; Schema: public; Owner: fasx_user
--

ALTER TABLE ONLY public."DailyInformation"
    ADD CONSTRAINT fk_daily_user FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: fasx_user
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;
GRANT ALL ON SCHEMA public TO mbaliabin_fsx_psql;


--
-- Name: TABLE "Follow"; Type: ACL; Schema: public; Owner: fasx_user
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public."Follow" TO mbaliabin_fsx_psql;


--
-- Name: TABLE "Profile"; Type: ACL; Schema: public; Owner: fasx_user
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public."Profile" TO mbaliabin_fsx_psql;


--
-- Name: TABLE "User"; Type: ACL; Schema: public; Owner: fasx_user
--

GRANT SELECT,INSERT,REFERENCES,DELETE,UPDATE ON TABLE public."User" TO mbaliabin_fsx_psql;


--
-- Name: TABLE "Workout"; Type: ACL; Schema: public; Owner: fasx_user
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public."Workout" TO mbaliabin_fsx_psql;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT SELECT,INSERT,DELETE,UPDATE ON TABLES  TO mbaliabin_fsx_psql;


--
-- PostgreSQL database dump complete
--

\unrestrict hYPgzm6QlnHi2wUkNPhycHpdEsrY23L08NFlV8DqATb1xmxBkkzqkRz9RVGPo6G

