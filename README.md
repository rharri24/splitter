NOTES SO FAR:
    - remember to change the main in package.json to index later wheni make it, right now its test.js

    -.env has google apikey

Progress:
Day 1:
Made user class and was able to get user location and use OPENROUTE API to get travel distance 
was also able to calculate travel distance and expeted arrival time in a window
- next should probably be soring in databas and makein a way for users to interact with each other
    - currently getting users current location based on their ip using the getUserLocation() in LocationServoces.js
        This is suboptimal a better way was implement above to get more accurate loaction from browser but since 
        I am testing currently on terminal that wont work right now as im not on a browser
            - Can switch to it later though
    - Another thing that I can switch to is the googleMap api, I have the key but need to go to library and enably the geocoder and a fer other options.
        Was about to do this but it asked for credit card. If this progresses its already implemented as TravelTimeServices(Google), just switch out the versions,
        the api key is alr in .env but would probably need to make another one
    - can track full addresses for destination or just cities 
        - ex valid ( 123 street, Bowie MD) also cvalid for destination (Germantown, New Youk)

Location Services clas main purpose is to get user location

User class creates users
    - currently usear and student NEED TO SET CLEAR DEFINITION BEFORE I START ANY DATABASE IMPLEMENTATION
        - Should these be seperate, WIll I actually verify info like uid and email???


Goood progress(summary)
-Able to get user destination and currLocation and determine a departure time when the uber would need to pick them up

Potential Improvements:
- Can ask user how early they dont mind reaching instead of otu assumed 1hr window
- can implement caching assuming same ips and same destination
    - ex multiple students with college park ip and wanting to go to airport no need to keep getting those routes and wasting api calls
    -  can give people options to avoid mistakes and work with clubs like if a club has an evenb at another school or people who host eventd to provide reliable transportation
        - ex of options, party venue, airport, cities to go home, dc, muusuem idk
        - maybe can even turn into a meeting people with similar intrest app dfepends well see
- Seperaing user and rides could also be good
    have user just store their info and rides have a user id to identify user but seperate idk tho well see once again

Implementation Ideas
- Store users in DB
    - Compare times an find overlapping times with same destination
        This is where being a student becomes useful agin easier to pick met up spot on campus, either closer to either student or in the middle
            - would need a more accuraete way thhan ip bcause ip is very broad
- Since the destination have time a nd date when we add a student to a database instead of making duplicate students is they have multiple places they wana go on different dates for example we can have an array of destinations which would work better, 
- finding matches lets have a 3 person per match limit where it gerts full and taken off the potential list that other users can see in the database
- it the time is too late alert user cant make it in time

-HOW WILL I INCORPERATE UBER INTO THIS LOOK INTO TOMMOROW LOL WHATS THIS IS ALL BUIULT AROUND
- MAYBE GIVE PEOPLE WITH CARS THE OPTION TO LET OTHER PEOPLE KNOW THEY ARE GOING TO A COMMON AREA AND ALLOW THEM TO MEET WITH EACHOTHER AND TRAVEL TOGETHER
    - ex i have a car and im going to resturant A at 5PM who wants to go and split gas?


Potential ISSues:
- I may have to manually get the orgin destination because people need to be local in order for this to work
    - this idea works in small scale areas like a campus where people can easliy walk to each other and then ride share
    - I am not on a campus so I will always be pulling my IP
        - This should be an easy fix just hard code IP addresses for now

Day 2:
Database implemented (painfully done), Console.log everytihing can be deleted when frontend is implemented
    -adding, removing 
    - finding matches 
    - groupin gthe rider in groups of 3 functions

Things to add
- make driver (User) people can see when and where a driver is going and join (max 3)

*******************
 - best implementation is groupThem() when passed with just findSame destinatino
 - it will sort and optimize the groups
 ---previously all goping to mwi 5, 6, 6.19, 6.30 and 7 would olny group the 3 6's and put the 7 in a group by itself
 - now it correctly groups 5 and 6 together and then 6:19, 6:30 and 7:00 together 
 ---***** need to change it tho so it should use the earliest group set time
*************


DAY 2.5
    *** the basis of the app is if people are in same location they can ride together
    *** implementation so far doesnt support this
    *** we can either get orgin of each student 
    OR ...
        if isStudent() (some sort of student verification) (assuming each student enters a valid email ending in (.umd.edu)) then we can assume similar orgin
        this makes sense because they should be on campus
        - can be scaled per campus later on or even implementing user orgin and allowing meetup for travel of large distances

START IMPLEMENTING FRONT END
 - Name: ? Splitter ???


 - Update: spend too lon gdebugging cocde that wasnt broken, 
 turns out that i was broken, kept inputing saie id for differnt users and i searched by id, 
 changing to search by email since you cannot register with same email for different users @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@# uberProj
