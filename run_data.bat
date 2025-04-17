@echo off
cls
call npm run lint
call npm run test
call node data\get_data.ts
echo Run complete.