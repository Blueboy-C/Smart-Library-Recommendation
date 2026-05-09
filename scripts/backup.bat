@echo off
set TIMESTAMP=%date:~0,4%%date:~5,2%%date:~8,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set TIMESTAMP=%TIMESTAMP: =0%
set BACKUP_DIR=backups
set DB_FILE=data\smart_library.db

if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"
set BACKUP_FILE=%BACKUP_DIR%\smart_library_%TIMESTAMP%.db

if exist "%DB_FILE%" (
    copy "%DB_FILE%" "%BACKUP_FILE%" >nul
    echo [OK] Backup: %BACKUP_FILE%
) else (
    echo [FAIL] Database not found: %DB_FILE%
)
