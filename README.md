# For translation use the LibreTranslation https://libretranslate.com
https://libretranslate.com

# Run LibreTranslation docker
docker run -ti --rm -p 5070:5000 -e LT_UPDATE_MODELS=false libretranslate/libretranslate
docker pull libretranslate/libretranslate

# Database script
-- Create the database
CREATE DATABASE chat;

-- Use the database
USE chat;

-- Create the users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    password VARCHAR(255) NOT NULL,
    createdat DATETIME DEFAULT CURRENT_TIMESTAMP,
    updateat DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
