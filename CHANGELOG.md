## [5.3.0-beta.1](https://github.com/Lint-Free-Technology/uix/compare/v5.2.2...v5.3.0-beta.1) (2026-03-08)

### ⭐ New Features

* Macro support for UIX templates - See https://uix.lf.technology/using/templates/[#macros](https://github.com/Lint-Free-Technology/uix/issues/macros) ([#75](https://github.com/Lint-Free-Technology/uix/issues/75)) ([3f6dd64](https://github.com/Lint-Free-Technology/uix/commit/3f6dd64a504d2760503b315803c9f08f02c6e034))

## [5.2.2](https://github.com/Lint-Free-Technology/uix/compare/v5.2.1...v5.2.2) (2026-03-07)

### 🐞 Bug Fixes

* Remove UI warnings whe using uix config when editing badges ([edc2f28](https://github.com/Lint-Free-Technology/uix/commit/edc2f2876df04034218e48a49d38c49d70a4ba6f))

## [5.2.2-beta.1](https://github.com/Lint-Free-Technology/uix/compare/v5.2.1...v5.2.2-beta.1) (2026-03-04)

### 🐞 Bug Fixes

* Remove UI warnings whe using uix config when editing badges ([edc2f28](https://github.com/Lint-Free-Technology/uix/commit/edc2f2876df04034218e48a49d38c49d70a4ba6f))

## [5.2.1](https://github.com/Lint-Free-Technology/uix/compare/v5.2.0...v5.2.1) (2026-03-03)

### 🐞 Bug Fixes

* hassfest updates ahead of submission to HACS ([065dc1c](https://github.com/Lint-Free-Technology/uix/commit/065dc1cbe07297bdd73aa0023722ad44be317dee))

### ⚙️ Miscellaneous

* Uix naming in integration code and dev container ([f6a782a](https://github.com/Lint-Free-Technology/uix/commit/f6a782af9c4e023cebc42f2150082f1bb0d39242))

## [5.2.1-beta.2](https://github.com/Lint-Free-Technology/uix/compare/v5.2.1-beta.1...v5.2.1-beta.2) (2026-03-01)

### ⚙️ Miscellaneous

* Uix naming in integration code and dev container ([f6a782a](https://github.com/Lint-Free-Technology/uix/commit/f6a782af9c4e023cebc42f2150082f1bb0d39242))

## [5.2.1-beta.1](https://github.com/Lint-Free-Technology/uix/compare/v5.2.0...v5.2.1-beta.1) (2026-02-27)

### 🐞 Bug Fixes

* hassfest updates ahead of submission to HACS ([065dc1c](https://github.com/Lint-Free-Technology/uix/commit/065dc1cbe07297bdd73aa0023722ad44be317dee))

## [5.2.0](https://github.com/Lint-Free-Technology/uix/compare/v5.1.0...v5.2.0) (2026-02-27)

### ⭐ New Features

* Add dashboard resources and extra_module_url to UIX diagnostics download ([7219214](https://github.com/Lint-Free-Technology/uix/commit/72192140504caa065f1be64832ddba9ea7f66282)), closes [#57](https://github.com/Lint-Free-Technology/uix/issues/57)

### 🐞 Bug Fixes

* Apply dialog patch to edit card dialog. Previously this was missed by dialog patch as edit card has its own patch for brush icon. ([ae1d818](https://github.com/Lint-Free-Technology/uix/commit/ae1d8184b58a7cc43af2c849440004f829416106))

### ⚙️ Miscellaneous

* Add local brand icons which can be used by Home Assistant 2026.3+ ([4bf0662](https://github.com/Lint-Free-Technology/uix/commit/4bf0662a00e17f8d036f432929e7d5eaaafeaaeb))

## [5.2.0-beta.2](https://github.com/Lint-Free-Technology/uix/compare/v5.2.0-beta.1...v5.2.0-beta.2) (2026-02-26)

### 🐞 Bug Fixes

* Apply dialog patch to edit card dialog. Previously this was missed by dialog patch as edit card has its own patch for brush icon. ([ae1d818](https://github.com/Lint-Free-Technology/uix/commit/ae1d8184b58a7cc43af2c849440004f829416106))

## [5.2.0-beta.1](https://github.com/Lint-Free-Technology/uix/compare/v5.1.0...v5.2.0-beta.1) (2026-02-26)

### ⭐ New Features

* Add dashboard resources and extra_module_url to UIX diagnostics download ([7219214](https://github.com/Lint-Free-Technology/uix/commit/72192140504caa065f1be64832ddba9ea7f66282)), closes [#57](https://github.com/Lint-Free-Technology/uix/issues/57)

### ⚙️ Miscellaneous

* Add local brand icons which can be used by Home Assistant 2026.3+ ([4bf0662](https://github.com/Lint-Free-Technology/uix/commit/4bf0662a00e17f8d036f432929e7d5eaaafeaaeb))

## [5.1.0](https://github.com/Lint-Free-Technology/uix/compare/v5.0.0...v5.1.0) (2026-02-24)

### ⭐ New Features

* Support for notifications via Home Assistant notification manager and ha-toast element. ([e8e2297](https://github.com/Lint-Free-Technology/uix/commit/e8e2297eca9be3aa077338b737f0797b3f4859f3)), closes [#51](https://github.com/Lint-Free-Technology/uix/issues/51)

### 🐞 Bug Fixes

* Fix --uix-icon not working ha-icon-button (and any other element that does not use ha-icon in slot) ([34a71d2](https://github.com/Lint-Free-Technology/uix/commit/34a71d281c67ae16c1ff4e21445f3e684c00b9da)), closes [#54](https://github.com/Lint-Free-Technology/uix/issues/54)
* Use custom card's original config (hui-card) if uix and card_mod are empty in custom card's altered config. ([7ce8830](https://github.com/Lint-Free-Technology/uix/commit/7ce883093c566cf9eff7833435b8549db80ec3d5)), closes [#56](https://github.com/Lint-Free-Technology/uix/issues/56)

## [5.1.0-beta.3](https://github.com/Lint-Free-Technology/uix/compare/v5.1.0-beta.2...v5.1.0-beta.3) (2026-02-23)

### 🐞 Bug Fixes

* Fix --uix-icon not working ha-icon-button (and any other element that does not use ha-icon in slot) ([34a71d2](https://github.com/Lint-Free-Technology/uix/commit/34a71d281c67ae16c1ff4e21445f3e684c00b9da)), closes [#54](https://github.com/Lint-Free-Technology/uix/issues/54)

## [5.1.0-beta.2](https://github.com/Lint-Free-Technology/uix/compare/v5.1.0-beta.1...v5.1.0-beta.2) (2026-02-23)

### 🐞 Bug Fixes

* Use custom card's original config (hui-card) if uix and card_mod are empty in custom card's altered config. ([7ce8830](https://github.com/Lint-Free-Technology/uix/commit/7ce883093c566cf9eff7833435b8549db80ec3d5)), closes [#56](https://github.com/Lint-Free-Technology/uix/issues/56)

## [5.1.0-beta.1](https://github.com/Lint-Free-Technology/uix/compare/v5.0.0...v5.1.0-beta.1) (2026-02-23)

### ⭐ New Features

* Support for notifications via Home Assistant notification manager and ha-toast element. ([e8e2297](https://github.com/Lint-Free-Technology/uix/commit/e8e2297eca9be3aa077338b737f0797b3f4859f3)), closes [#51](https://github.com/Lint-Free-Technology/uix/issues/51)

## [5.0.0](https://github.com/Lint-Free-Technology/uix/compare/v4.2.1...v5.0.0) (2026-02-22)

### ⭐ New Features

* Apply UIX to ha-panel-profile ([6bd54f7](https://github.com/Lint-Free-Technology/uix/commit/6bd54f7b9c9d479f8bf845eed9b670a7fcaa9b5e))

### 🐞 Bug Fixes

* Add ha-adaptive-dialog to dialogs where UIX is added. Remove old ha-wa-dialog and ha-md-dialog. ([6f186a8](https://github.com/Lint-Free-Technology/uix/commit/6f186a8c792e274f26bf505b11ffc70365a265b3))
* Fix reading uix-theme. ([b645d17](https://github.com/Lint-Free-Technology/uix/commit/b645d17d12e95b43f57f133e911e094e38e7d81f))
* Restore babel in rollup ([d216a38](https://github.com/Lint-Free-Technology/uix/commit/d216a3895f90c090d8ff6191d197d5259f31d79b))
* Restore ha-wa-dialog and ha-md-dialog until 2026.3 ([beff1bd](https://github.com/Lint-Free-Technology/uix/commit/beff1bd3e6c1d260b50d40300099d87be93e99f7))
* UIX not showing in UI editor when editing card ([1520a9c](https://github.com/Lint-Free-Technology/uix/commit/1520a9cb72e0d4f2752b4e41cb95a71f37507768))
* Update theme load warning to UIX ([17ac8d8](https://github.com/Lint-Free-Technology/uix/commit/17ac8d883df7342ba488cd35e1edbdc8ec085578))

### ⚙️ Miscellaneous

* Adjust Toast reload warning to be more friendly. ([a0cbe37](https://github.com/Lint-Free-Technology/uix/commit/a0cbe3799dd448f71d4980d30989d26a8d202e9f))
* Migrate to UIX ([b6c0672](https://github.com/Lint-Free-Technology/uix/commit/b6c0672f4a134429c32d6484e059506cbda9ab14))

## [5.0.0-beta.6](https://github.com/Lint-Free-Technology/uix/compare/v5.0.0-beta.5...v5.0.0-beta.6) (2026-02-22)

### 🐞 Bug Fixes

* UIX not showing in UI editor when editing card ([1520a9c](https://github.com/Lint-Free-Technology/uix/commit/1520a9cb72e0d4f2752b4e41cb95a71f37507768))

<!-- markdownlint-configure-file { "MD024": false } -->
<!-- markdownlint-configure-file { "MD041": false } -->
## [5.0.0-beta.5](https://github.com/Lint-Free-Technology/uix/compare/v5.0.0-beta.4...v5.0.0-beta.5) (2026-02-22)

### ⭐ New Features

* Apply UIX to ha-panel-profile ([6bd54f7](https://github.com/Lint-Free-Technology/uix/commit/6bd54f7b9c9d479f8bf845eed9b670a7fcaa9b5e))

## [5.0.0-beta.4](https://github.com/Lint-Free-Technology/uix/compare/v5.0.0-beta.3...v5.0.0-beta.4) (2026-02-21)

### 🐞 Bug Fixes

* Fix reading uix-theme. ([b645d17](https://github.com/Lint-Free-Technology/uix/commit/b645d17d12e95b43f57f133e911e094e38e7d81f))
* Restore babel in rollup ([d216a38](https://github.com/Lint-Free-Technology/uix/commit/d216a3895f90c090d8ff6191d197d5259f31d79b))

## [5.0.0-beta.3](https://github.com/Lint-Free-Technology/uix/compare/v5.0.0-beta.2...v5.0.0-beta.3) (2026-02-20)

### 🐞 Bug Fixes

* Restore ha-wa-dialog and ha-md-dialog until 2026.3 ([beff1bd](https://github.com/Lint-Free-Technology/uix/commit/beff1bd3e6c1d260b50d40300099d87be93e99f7))

### ⚙️ Miscellaneous

* Migrate to UIX ([b6c0672](https://github.com/Lint-Free-Technology/uix/commit/b6c0672f4a134429c32d6484e059506cbda9ab14))

## [5.0.0-beta.2](https://github.com/Lint-Free-Technology/uix/compare/v5.0.0-beta.1...v5.0.0-beta.2) (2026-02-18)

### 🐞 Bug Fixes

* Add ha-adaptive-dialog to dialogs where UIX is added. Remove old ha-wa-dialog and ha-md-dialog. ([6f186a8](https://github.com/Lint-Free-Technology/uix/commit/6f186a8c792e274f26bf505b11ffc70365a265b3))
