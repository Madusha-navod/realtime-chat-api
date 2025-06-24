# For translation use the LibreTranslation https://libretranslate.com
https://libretranslate.com

# Run LibreTranslation docker
docker run -ti --rm -p 5070:5000 libretranslate/libretranslate
docker run -ti --rm -p 5070:5000 -e LT_LOAD_ONLY=en,ar,hi,fr,zh,de,es,ja,ko,ru,th,tr libretranslate/libretranslate
docker run -ti --rm -p 5070:5000 -e LT_LOAD_ONLY=en,ar,hi,fr,zh,de,es,ja,ko,ru,th,tr -v /Users/eranga/libretranslate-data/local:/home/libretranslate/.local -e HOME=/home/libretranslate libretranslate/libretranslate
docker pull libretranslate/libretranslate

# Database script
-- Create the database
CREATE DATABASE chat;

-- Use the database
USE chat;

-- Create the users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    password VARCHAR(255) NOT NULL,
    createdat DATETIME DEFAULT CURRENT_TIMESTAMP,
    updateat DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
