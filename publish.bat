rmdir /s/q dist
rmdir /s/q docs
CALL npm run build
rename dist docs
echo. > docs\.nojekyll
git reset .
git add docs
git commit -m "chore(site.docs): Update."
@REM git push