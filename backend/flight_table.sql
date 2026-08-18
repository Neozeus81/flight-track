use flight_data;

CREATE TABLE IF NOT EXISTS flight_data (
    id SERIAL PRIMARY KEY,
    callsign VARCHAR(10) NOT NULL,
    origin VARCHAR(10) NOT NULL,
    destination VARCHAR(10) NOT NULL,
    altitude INT,
    heading INT,
    speed INT,
    airline VARCHAR(50),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);