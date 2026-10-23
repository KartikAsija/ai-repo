@echo off
echo ===================================================
echo Starting Your AI Career Navigator (Linked Full-Stack)
echo ===================================================

REM Prepend Python and Node if present in AppData
if exist "%LOCALAPPDATA%\Programs\Python\Python311" (
    set "PATH=%LOCALAPPDATA%\Programs\Python\Python311;%PATH%"
)
if exist "%LOCALAPPDATA%\Programs\nodejs" (
    set "PATH=%LOCALAPPDATA%\Programs\nodejs;%PATH%"
)

echo Starting website & API linked on http://localhost:8001 ...
python run.py
pause

