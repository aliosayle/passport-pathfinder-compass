@echo off
echo Setting up Passport Management Database...

REM Set your MySQL credentials here
set MYSQL_USER=root
set MYSQL_PASSWORD=goldfish@2025

REM Run the SQL script
echo Running database setup script...
mysql -u %MYSQL_USER% -p%MYSQL_PASSWORD% < setup_database.sql

IF %ERRORLEVEL% EQU 0 (
    echo Database setup completed successfully!
) ELSE (
    echo Error setting up database. Please check your MySQL credentials and try again.
)

pause