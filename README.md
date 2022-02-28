# A Fabric that Remembers
Sofwtare, Hardware, and Weaving Files for producing an interactive fabric installation. This fabric measures press via resistive sensing is 6 regions, transfers press data to a firebase realtime database and then visualizes the press data using and Angular project hosted on firebase. 


## Directory Structure

### hw (hardware)
contains Platform IO project for programming the microcontroller. We used a Sparkfun Thing ESP32 Board and code that allows us to write realtime press data to a Fibebase Database. 

### interface
contains an Angular project that reads from the realtime database to update a webpage at https://a-fabric-that-remembers-rtd.web.app/

### Installing and Debugging the Hardware

1. pull/clone this directory
2. open the project using the Platform IO extension in VSCode. 
3. select "open" -> "import arduino project" -> navigate to the /hw directory and select 'SparkFun ESP32 Thing' from the boards list
4. make changes to your code, compile and push to the microcontroller. 
5. if having trouble debugging, you may reference the code we build ours upon at: https://RandomNerdTutorials.com/esp32-firebase-realtime-database/

:old_key:	Note: if you are looking to run our project, you will need to request the firebase key and database id directly from us and insert it into the code in the indicated positions


### Installing Interface Code
1. pull/clone this directory
2. navigate to the /interface directory and run `npm install`
3. run `ng serve` to deploy and test code changes locally
4. when satisified with code run `ng build` then `firebase deploy` to push the contents of the generated dist/ directory to your hosting server. 

:old_key:	Note: if you are looking to run our project, you will need to request a file that will be placed at interface/src/environments/environments.ts that contains all of our secret firebase authentication codes and API keys. 
