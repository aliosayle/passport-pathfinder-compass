-- Reset admin user password to 'admin123'
-- This password hash is generated using bcrypt with 10 rounds for the string 'admin123'

UPDATE users 
SET password = '$2b$10$MBnMFHx4mwgwxfr/IDscwOvp8iW/P86Q7CE4k9LUdBveH4q33bjT6' 
WHERE email = 'admin@example.com' OR username = 'admin';