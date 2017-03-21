# Project Keystone

Project Keystone is an open source portal for roller coaster enthusiasts with focus on the simulation software [NoLimits 2 - Roller Coaster Simulation](http://www.nolimitscoaster.com/) created by Olé Lange.

# Getting started (development)

## What you need

- You need `node.js` installed on your development environment. For more information about how to setup up `node.js` on your machine read [this article](https://nodejs.org/en/download/package-manager/).

- Functioning MongoDB on your development environment. [This article](https://docs.mongodb.com/manual/installation/) will help you getting MongoDB installed on your machine.

- Essentiall knowledge in software patterns, especially when it comes to abstracting components, pages, services and controller. We are working on a wiki to help getting started with the essential software pattern focused on the used patterns in keystone.

- Some basic knowledge in node.js because if you know the software patterns, there is nothing special about node.js. Even if you developed in PHP and used well known frameworks for years and years, you will get used to the coding style in JavaScript. Its important that you know the common patterns.

## Cloning repository and installing dependencies

Clone this repository on your desktop and install all dependencies

```
git clone https://github.com/geforcefan/keystone.git 
```

since this is a private repository, you will asked to authenticate yourself with your github account. Maybe it might be a better idea to fork this repository first and clone then your fork.

```
npm install
```

which is installing all dependencies of this project

## Configuring keystone

During the development you will never have an access to the database of keystone directly, so you always start with a fresh instance of keystone. If you installed MongoDB on your local machine without any changes in its configuration, there is no need for adjustments in the configuration file (`config/server.js`).

You can also configure the HTTP port when you want another listening port. Default port is 4000.

## Running the client and server watcher

```
npm run start
```

This command will run a file watcher for the server and restarts the server when changes on the source code happens. 
Wait for this message:

```
Server running on http://localhost:4000 [production]
```

This means the server is running on host localhost at port 4000 (which you can change in the configuration file)
What we need is to build the client side bundle. Open another terminal, change to the repository root directory and start the bundle watcher

```
npm run bundle
```

Keep both terminal windows running in the background.

Now you can view keystone for the first time in your prefered (Chrome) browser by typing this URL: `http://localhost:4000`

# Contribution

## Non core team members

Feel free to fork this project, implement features, improve the code quality, fixing bugs, etc. We will provide some guidelines about the coding style, name conventions, documentations and unit testing in the future. This is an absolute important point when it comes to maintainability of this project. Just make a push request, the core team will review the code and decide whether it will merged to the master branch or not.

## Core team members

Usual approach: Fork this project, and push your code to the master branch, you are the master of puppets, you can pull the strings on keystone.

# Production environment and deployment

Nothing to deploy right now. This project is in its very early stage. 

# Documentation

Just install yuidocs by executing

```
npm install -g yuidocjs
```

and generate the docs

```
npm run docs
```

Now you can access the documentation inside the new created **docs/** folder. 

# Wiki

Please visit the [wiki](https://github.com/geforcefan/keystone/wiki) to get details about code conventions, adding own services, components and pages. 

# Core team

- Ercan "geforcefan" Akyürek, [GitHub](https://github.com/geforcefan/) | [eMail](mailto:ercan.akyuerek@gmail.com)

# License information 

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program. If not, see <http://www.gnu.org/licenses/>.

