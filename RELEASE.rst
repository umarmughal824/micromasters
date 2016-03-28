Release Notes
=============

Version 0.2.0
-------------

- Updated dockerignore
- Removed pip from apt.txt, this gets installed separately
- Moved factory libraries to requirements.txt to fix management commands
- Use sitepackages=True so tox reuses the same packages in the docker environment
- Added REST API for profiles
- Added dockerignore
- Implemented student Dashboard
- Implemented course list component
- Profiles creation
- Correct the heroku runtime
- Added model for user profiles
- Added django specific pylint
- Upgraded Django to security release
- Removed static/sass, merged into static/scss
- Removed setup.py
- Rename inner to dashboard, and outer to public.
- Add react, redux and friends.

Version 0.1.0
-------------

- Fetch information for user profile from edX
- Pass authentication info to template.
- Implemented home page
- Added Servers status app
- Implemented proof of concept for Python Social Auth backend
- Renamed npm_install_if_prod.sh to webpack_if_prod.sh
- Added setting for TLS redirection
- Add missing variables to app.json
- Added logging and email config
- Configured sass and css in webpack
- Add pre and post compile hooks (migrations and git hash)
- Created admin for courses and programs.
- upgraded uwsgi for incompatibility with mac env
- Added courses &amp; programs w/ REST API
- Fix failing tests.
- Specify python 3 runtime for Heroku
- Add newrelic agent
- Initial setup for micromasters portal

