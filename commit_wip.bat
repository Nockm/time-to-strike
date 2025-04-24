@echo off
:ASK
echo.=================================================
echo Arrange current changes into commits by category.
echo.=================================================
echo.
echo This will reset the existing git stage.
echo.
echo Proceed? (y/n)
set INPUT=
set /P INPUT=Type input: %=%
If /I "%INPUT%"=="y" goto DOIT
If /I "%INPUT%"=="n" goto END
echo Incorrect input & goto ASK

:DOIT
git reset .
git add data/cache && git commit -m "chore(data.cache)"
git add data/output && git commit -m "chore(data.output)"
git add docs && git commit -m "chore(docs)"
git add data && git commit -m "wip(data)"
git add src && git commit -m "wip(site)"
git add TODO.md && git commit -m "docs(TODO)"
:END