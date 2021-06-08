# README #

### What is this repository for? ###

* Express API for app a bridge between database & the Mobile App

### How do I get set up? ###

* Clone the repo on your local machine
* run command 
  * npm install
* Database configuration (MongoDB Authentication Setup [One Time])
  ```
  use admin
  db.createUser(
    {
      user: "admin",
      pwd: "superadmin",
      roles: [ { role: "userAdminAnyDatabase", db: "admin" }, "readWriteAnyDatabase" ]
    }
  )
  ```
  ` alias mongo_admin='mongo --port 27017 -u "admin" -p "superadmin" --authenticationDatabase "admin"' `
* Create an user for Heartpool Database (One time setup)
  ```
  use myDb
  db.createUser(
    {
      user: "user",
      pwd:  "user123",
      roles: [ { role: "readWrite", db: "myDb" }, { role: "read", db: "myDbbckp" } ]
    }
  )
  ```
  ` alias mongo_myDb='mongo --port 27017 -u "user" -p "user123" --authenticationDatabase "myDb"' `

  ```
  use sessions
  db.createUser(
    {
      user: "session",
      pwd:  "session123",
      roles: [ { role: "readWrite", db: "sessions" }, { role: "read", db: "sessionsbckp" } ]
    }
  )
  ```
  ` alias mongo_sessions='mongo --port 27017 -u "session" -p "session123" --authenticationDatabase "sessions"' `

* Open the mongod.conf file and add these 2 lines
  ```
  security:
    authorization: enabled
  ```

* connect to mongodb by shell
  * `mongo --port 27017 -u "user" -p "user123" --authenticationDatabase "myDb"`


### Contribution guidelines ###

* Code review
  * Make Sure your indentation is proper 2 characters & Indent using spaces
  * No console.log is allowed when submitting the Pull Request
  * Makes sure you don't add extra white spaces when submitting the PR.
  * Please don't make unnecessary changes like indenting the whole block of code, as it makes the reviewer difficult to review the changes made.
    * If such type of changes are to be made, please submit a different PR stating that the changes are only indentation related.

### Who do I talk to? ###

* Repo owner or admin
* Other community or team contact
