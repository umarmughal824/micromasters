Install Open edX
---


#### Setup Open edX Devstack

Following steps are inspired by [edx-devstack](https://github.com/edx/devstack).

#### Clone edx/devstack

```
$ git clone https://github.com/edx/devstack
$ cd devstack
$ git checkout open-release/ironwood.master
$ make requirements
$ export OPENEDX_RELEASE=ironwood.master
$ make dev.clone
```

#### Clone and checkout edx-platform (if not already).
```
$ git clone https://github.com/mitodl/edx-platform
$ git checkout open-release/ironwood.master
```

#### Pull latest images and run provision

```
$ make pull
$ make dev.provision 
```

#### Start your servers

`make dev.up`

#### Stop your servers

`make stop`

#### Configure Micromasters to support OAuth2 authentication from Open edX

  - In Open edX:
    - go to `/admin/oauth2_provider/application/` and verify that an application named `micromasters` (name does not really matter here) exists with these settings:
      - `Redirect uris`: `http://mm.odl.local:8079/complete/edxorg`
      - `Client type`: "Confidential"
      - `Authorization grant type`: "Authorization code"
      - `Skip authorization`: checked
      - Other values are arbitrary but be sure to fill them all out. Save the client id and secret for later
  - In Micromasters:
    - Set `EDXORG_BASE_URL` to the correct URL that is accessible from Micromasters container and host, e.g. `http://edx.odl.local:18000/`
      - If Micromasters isn't able to access the Open edX hostname directly (primarily due to the way networking is handled in compose projects) you will need to set `OPENEDX_HOST_ENTRY` in `.env` file such that Mircomasters is able to resolve the Open edX hostname from within the container. Typically this would mean setting the value similar to `edx.odl.local:172.22.0.1`.
    - Set `OPENEDX_API_CLIENT_ID` to the client id
    - Set `OPENEDX_API_CLIENT_SECRET` to the client secret
