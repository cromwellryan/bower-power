-- Baseline schema, exported from production D1. For a new database only.
-- Never reset production or import family data into Git.
CREATE TABLE trips(id TEXT PRIMARY KEY,name TEXT NOT NULL,token_hash TEXT NOT NULL UNIQUE,created_at TEXT NOT NULL);
CREATE TABLE players(id TEXT PRIMARY KEY,trip_id TEXT NOT NULL REFERENCES trips(id),name TEXT NOT NULL,UNIQUE(trip_id,id),UNIQUE(trip_id,name));
CREATE TABLE games(id TEXT PRIMARY KEY,trip_id TEXT NOT NULL REFERENCES trips(id),played_at TEXT NOT NULL,w1 TEXT NOT NULL,w2 TEXT NOT NULL,l1 TEXT NOT NULL,l2 TEXT NOT NULL,
FOREIGN KEY(trip_id,w1) REFERENCES players(trip_id,id),FOREIGN KEY(trip_id,w2) REFERENCES players(trip_id,id),FOREIGN KEY(trip_id,l1) REFERENCES players(trip_id,id),FOREIGN KEY(trip_id,l2) REFERENCES players(trip_id,id),
CHECK(w1<>w2 AND w1<>l1 AND w1<>l2 AND w2<>l1 AND w2<>l2 AND l1<>l2));
CREATE INDEX games_trip_time ON games(trip_id,played_at);
