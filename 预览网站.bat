@echo off
setlocal
cd /d "%~dp0"

where py >nul 2>nul
if %errorlevel%==0 (
  start "" http://127.0.0.1:8080/
  py -3 -m http.server 8080
  goto :eof
)

where python >nul 2>nul
if %errorlevel%==0 (
  start "" http://127.0.0.1:8080/
  python -m http.server 8080
  goto :eof
)

echo 未找到 Python。请安装 Python，或手动运行：
echo python3 -m http.server 8080
pause
