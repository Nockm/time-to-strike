| Type       | Description                                                              | Examples                           |
| --         | --                                                                       | --                                 |
|            | **Code-specific**                                                        | ☑️                                 |
| `feat`     | Change to **code** that adds a new feature                               | ☑️                                 |
| `fix`      | Change to **code** that fixes a bug (user-facing or functional).         | ☑️                                 |
| `perf`     | Change to **code** that improves performance.                            | ☑️                                 |
| `refactor` | Change to **code** that neither fixes a bug nor adds a feature           | ☑️ Includes refactoring of tests   |
| `style`    | Change to **code** that makes no logic changes                           | ☑️ whitespace, semicolons, etc.    |
| `test`     | Change to **code** that add or modifies tests (unit, integration, etc.). | ☑️                                 |
|            | **Others**                                                               | ☑️                                 |
| `build`    | Change to **build tools, dependencies, or CI/CD config**.                | ☑️ npm, Docker, etc.               |
| `chore`    | Maintenance work that doesn’t change app behavior                        | ☑️ package upgrades                |
| `ci`       | Change to **CI configuration file/script/tool**.                         | ☑️ GitHub Actions, Travis, etc.    |
| `docs`     | Change to **documentation**.                                             | ☑️                                 |
| `revert`   | A commit that undoes a previous commit.                                  | ☑️                                 |
| `wip`      | Work in progress (usually avoided on main, used on dev branches).        | ☑️                                 |


| Area |
| -- |
| data |
| data.cache |
| site |
| site.docs |
| lint |
| test |