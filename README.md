# Micromasters
Portal for learners and course teams to access MITx Micromasters programs

## Major Dependencies
- Docker
  - OSX recommended install method: [Download from Docker website](https://docs.docker.com/mac/)
- docker-compose
  - Recommended install: pip `pip install docker-compose`
- Virtualbox (https://www.virtualbox.org/wiki/Downloads)

## (OSX only) Getting your machine Docker-ready

#### Create your docker container:

The following commands create a Docker machine named ``mm``, start the
container, and configure environment variables to facilitate communication
with the edX instance.

    docker-machine create --driver virtualbox mm
    docker-machine start mm
    # 'docker-machine env (machine)' prints export commands for important environment variables
    eval "$(docker-machine env mm)"

#### Enable file syncing between the host machine and Docker:

Due to file notification issues using Docker in OSX, development is more
efficient if you install [docker-osx-dev](https://github.com/brikis98/docker-osx-dev).
This synchronizes host file-system changes with the Docker container.

First, set up ``docker-osx-dev`` via shell script.

    . ./osx_docker_dev_setup.sh

Subsequently, before you run the application with ``docker-compose up``,
you would run this command in a separate terminal tab (assumes machine
name ``mm``):
  
    docker-osx-dev -m mm -s ./ --ignore-file '.rsync-ignore'

This starts a process that monitors the file system for changes. On startup
you may receive this error:
  
      [ERROR] Found VirtualBox shared folders on your Boot2Docker VM. 
      These may void any performance benefits from using docker-osx-dev:
      
      /Users
      
      [INSTRUCTIONS] Would you like this script to remove them?
      1) yes
      2) no

Answer ``yes``.

## Running edX devstack locally _(optional, but recommended)_

Micromasters can work with a live instance of edX, but it's recommended that
you get it running locally. It's obviously more configurable that way, and you'll
likely need to run it locally for other projects in the future.

#### 1) Install edX
Run through the
[instructions provided by edX](https://edx-installing-configuring-and-running.readthedocs.io/en/latest/installation/devstack/install_devstack.html)
up to and including the **LMS Workflow** section. Note that this section mentions
some helpful dummy accounts that edX devstack comes preloaded with (eg: staff@example.com).

#### 2) Run the machine and SSH into it

    # Start the VM
    vagrant up
    # Once that's done, ssh into the running VM
    vagrant ssh
    # Switch to the edxapp account within SSH session
    sudo su edxapp

Switching to the edxapp account sources the edxapp environment and sets the
current working directory to the edx-platform repository. If you get the error
_"Unknown task: devstack, the working directory has not been updated properly"_,
simply run ``cd /edx/app/edxapp/edx-platform`` and re-run the command.

#### 3) Set up a user with superuser permissions

Once in the VM, creating a superuser/setting superuser permissions can be done
in Django admin or in a shell. It's preferable to do it in Django admin as you'll
need to use Django admin for the next step anyway.

- **In Django admin**

    Run the server (``paver devstack --fast lms``) and navigate to Django admin
    (eg: http://192.168.33.10:8000/admin). In the **Authentication and Authorization**
    section, select a **User**, or add one then select it. In the **Permissions**
    section, check the **Superuser status** box and save.

- **In a Python shell**

        # Kick off an interactive shell
        python manage.py lms --settings=devstack shell

        ### RUN THESE WITHIN THE SHELL ###
        from django.contrib.auth.models import User
        # We'll update the dummy user 'staff' to have superuser permissions
        user = User.objects.get(username='staff')
        user.is_superuser=True
        user.save()

#### 4) Add an OAuth client

Run Django admin (see "In Django admin" section from step 2), navigate to the
OAuth2 clients section (eg: http://192.168.33.10:8000/admin/oauth2/client/), and add a
new client. Fill in the values as follows:

- **User**: Use the lookup (magnifying glass) to find your superuser
- **Name**: Anything you want. Something like 'micromasters-local'
- **Url**: The URL where Micromasters will be running. If you're running it via
Docker, run ``docker-machine ip`` from the host machine to get the container IP.
Micromasters runs on port ``8079`` by default, so this value should be something
like ``http://192.168.99.100:8079``
- **Redirect uri**: Your **Url** value with "/complete/edxorg/" at the end

#### 5) Copy relevant values to use in the Micromasters .env file

The Micromasters codebase contains a ``.env.sample`` file which will be used as
a template to create your ``.env`` file. For Micromasters to work, it needs 3 values:

- ``EDXORG_BASE_URL``

    This value _should_ be ``http://192.168.33.10:8000``. The Vagrant VM IP is hard-coded
    in the Vagrantfile, and it's unlikely that edX will change that. The LMS server runs
    on port ``8000`` by default.
- ``EDXORG_CLIENT_ID`` and ``EDXORG_CLIENT_SECRET``

    These values can be found in Django admin OAuth client section discussed above.
    **Client id:** and **Client secret:** values should be auto-generated for
    your new client. Use those values for the corresponding ``EDXORG_``
    variables in the ``.env`` file

## Docker Container Configuration and Start-up

First, create a ``.env`` file from the sample in the codebases:

    cp .env.sample .env

Set the ``EDXORG_BASE_URL``, ``EDXORG_CLIENT_ID``, and ``EDXORG_CLIENT_SECRET``
variables in the ``.env`` file appropriately.

For first-time container start-up, start it with a full build:

    docker-compose up --build

In another terminal tab, navigate the the Micromasters directory
and add a superuser in the now-running Docker container:

    docker-compose run web python3 manage.py createsuperuser

Starting the container after this can be done without the ``--build``
param: ``docker-compose up``

You should now be able to do the following:

1. Visit Micromasters in your browser on port `8079`. _(OSX Only)_ Docker auto-assigns
 the container IP. Run ``docker-machine ip`` to see it. Your Micromasters URL will
 be something like this: ``192.168.99.100:8079``.
1. Click "Sign in with edX.org" and sign in by authorizing an edX client. If you're
 running edX locally, this will be the client you created in the steps above.

As shown above, manage commands can be executed on the Docker-contained
Micromasters app. For example, you can run a shell with the following command:

    docker-compose run web python3 manage.py shell


