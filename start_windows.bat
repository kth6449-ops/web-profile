@echo off
cd /d "%~dp0"
where py >nul 2>&1
if %errorlevel%==0 (
  py -3 preview.py
) else (
  where python >nul 2>&1
  if %errorlevel%==0 (
    python preview.py
  ) else (
    echo Python 3 is required. Open index.html for reading only.
    pause
  )
)
