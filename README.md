# A Fabric that Remembers
Sofwtare, Hardware, and Weaving Files for producing an interactive fabric installation. This fabric measures press via resistive sensing is 6 regions, transfers press data to a firebase realtime database and then visualizes the press data using and Angular project hosted on firebase. 


## Directory Structure

### hw (hardware)
contains Platform IO project for programming the microcontroller. We used a Sparkfun Thing ESP32 Board and code that allows us to write realtime press data to a Fibebase Database. 

### interface
contains an Angular project that reads from the realtime database to update a webpage at https://a-fabric-that-remembers-rtd.web.app/

### Installing Interface Code
1. pull/clone this directory
2. navigate to the download directory and run `npm install`
