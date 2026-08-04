@echo off
title Pizza House Restaurant Management App Launcher
echo ============================================================
echo           Starting Pizza House POS & Ordering App
echo ============================================================

cd /d "%~dp0"

echo [1/2] Launching Backend Server (Port 5000)...
start "Pizza House Backend" cmd /k "cd server && npm start"

timeout /t 3 /nobreak > NUL

echo [2/2] Launching Frontend Web App (Port 3000)...
start "Pizza House Frontend" cmd /k "cd client && npm run dev"

timeout /t 3 /nobreak > NUL

echo Opening app in default web browser...
start http://localhost:3000

echo ============================================================
echo App started successfully! Keep the server windows open.
echo ============================================================
