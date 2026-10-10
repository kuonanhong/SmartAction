@echo off
setlocal
cd /d "%~dp0"
set "SMARTACTION_GIT_BASH="
if exist "%ProgramFiles%\Git\bin\bash.exe" set "SMARTACTION_GIT_BASH=%ProgramFiles%\Git\bin\bash.exe"
if not defined SMARTACTION_GIT_BASH if exist "%LOCALAPPDATA%\Programs\Git\bin\bash.exe" set "SMARTACTION_GIT_BASH=%LOCALAPPDATA%\Programs\Git\bin\bash.exe"
if not defined SMARTACTION_GIT_BASH (
  echo Git Bash not found. Please install Git for Windows: https://git-scm.com/downloads/win
  pause
  exit /b 1
)
"%SMARTACTION_GIT_BASH%" Upload_SmartAction.sh %*
set "SMARTACTION_RESULT=%ERRORLEVEL%"
pause
exit /b %SMARTACTION_RESULT%
