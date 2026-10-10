@echo off
setlocal
where py >nul 2>nul
if %errorlevel% equ 0 (
  py -3 "%~dp0download_model.py" %*
) else (
  where python >nul 2>nul
  if errorlevel 1 (
    echo Install Python 3 from https://www.python.org/downloads/ and try again.
    exit /b 1
  )
  python "%~dp0download_model.py" %*
)
exit /b %errorlevel%
