DROP TABLE IF EXISTS charApp;
CREATE TABLE charApp (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    house VARCHAR(255),
    patronus VARCHAR(255),
    isAlive boolean NOT NULL DEFAULT true,
    createdBy VARCHAR(255)
)