# Contributing

Contributions to UI eXtension are most welcome, either integration or frontend code, or updates to documentation.

## Integration

The integrations main purpose is to handle updates to Frontend resource. However being an integration opens an avenue for services to communicate with Frontend resource. If you have any creative ideas on new UIX services, please submit a PR. If you are not sure then start a [discussion](https://github.com/Lint-Free-Technology/uix/discussions/categories/ideas) to see where it may lead.

!!! tip "Developing integration"
    If you are a seasoned integration developer, you will find the best way is to add `custom_components/uix` as a mount to your Home Assistant core dev container. Tips when testing:

    - update version in `package.json` development tag e.g. 5.0.1-mydev.1
    - run `npm run build` which will update the version in the integration `manifest.json` and compile `uix.js`
    - restart Home Assistant running in your dev container
  
!!! warning
    Failure to follow best practice integration building tips will leave your UIX integration in a indeterminate state as far as integration vs Frontend resource, where your changes may not work, you will receive repeated `Reload` warnings and/or needing to clear Frontend caches on devices.

## Frontend

The Frontend javascript resource is the where all the UIX magic happens. If you have thoughts on a new UIX to add, or UI element that needs patching by UIX, please submit a PR. If you are not sure then start a [discussion](https://github.com/Lint-Free-Technology/uix/discussions/categories/ideas) to see where it may lead.

!!! tip "Developing Frontend"
    If you have a Home Assistant dev container, following the tips in [integration](#integration). Otherwise follow these tips when testing:

    - update version in `package.json` development tag e.g. 5.0.1-mydev.1
    - run `npm run build` which will update the version in the integration `manifest.json` and compile `uix.js`
    - copy `uix.js` and `manifest.json` to `custom_components/uix`
    - restart Home Assistant.

!!! warning
    Failure to follow best practice Frontend resource building tips will leave your UIX Frontend resource in a indeterminate state as far as integration vs Frontend resource, where your changes may not work, you will receive repeated `Reload` warnings and/or needing to clear Frontend caches on devices.

## Documentation

Documentation is where every UIX user can contribute. As long as you have python installed in your environment you can modify the document source and see results in real time.

!!! tip "Documentation updating"
    UIX documentation is built from markdown source files using [Zensical](https://zensical.org/doc). Follow these tips to server teh documentation website in your local environment:

    - Clone [repo](https://github.com/Lint-Free-Technology/uix)
    - Make a python virtual environment and install zensical (not required if you have zensical installed globally)
    ```console
    python3 -m venv .venv
    source .venv/bin/activate
    pip3 install zensical
    ```
    - Change to the `docs` directory and run zensical
    ```console
    cd docs
    zensical serve
    ```
    - Documentation website will then be available at `http://localhost:8000`
    - You can run zensical at another bound ip address and/or port using `--dev-addr`. e.g. `zensical serve localhost:9000` to run on port 9000.

## Submitting pull requests

- **DO NOT** include `uix.js` in your commits in a pull request. The resource file will be built on release. As UIX is an integration it can't use release assets as `uix.js` needs to be in the `custom_components/uix` folder.
- Use conventional commits style naming for commits. While this is not mandatory as pull requests will be squash and title updated to use conventional commit naming.
- In commit footer or pull request include `BREAKING CHANGE: ...` if it is a breaking change.
- In commit footer or pull request include references to issues fixed/closed e.g. `fixes #1234`.
