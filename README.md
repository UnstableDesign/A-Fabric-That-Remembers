# A Fabric that Remembers
Sofwtare, Hardware, and Weaving Files for producing an interactive fabric installation. This fabric measures press via resistive sensing is 6 regions, transfers press data to a firebase realtime database and then visualizes the press data using and Angular project hosted on firebase. 

![A Fabric that Remembers Install at Center for Heritage, Arts, and Textile, Hong Kong](/documentation/chat_install.jpg)

![the Present Mode of the interface shows press data in realtime](/documentation/interface_present.png)

![the Past Mode of the interface shows where presses were collected over time](/documentation/interface_past.png)


## Directory Structure

### hw (hardware)
contains Platform IO project for programming the microcontroller. We used a Sparkfun Thing ESP32 Board and code that allows us to write realtime press data to a Fibebase Realtime Database. 

### interface
Contains an Angular project that reads from the realtime database to update a webpage at https://a-fabric-that-remembers-rtd.web.app/

### weave
contains the weaving drafts and supporting documents used to develop the fabric.  
- the .ada file was used to develop the core strcutures, can can be opened in https://adacad-weaver.firebaseapp.com/
- the .tiff file was directly sent to our TC2 loom for weaving (3W, 30epi, warped with 20/2 cotton)
- the .psd file displays the particular relationships between stitch regions and mapping.
- the structure/ directory contains all the generated structures for the weave as bitmaps. 

### documentation
contains images used in this readme. 


## Installing and Debugging the Hardware

1. pull/clone this directory
2. open the project using the Platform IO extension in VSCode. 
3. select "open" -> "import arduino project" -> navigate to the /hw directory and select 'SparkFun ESP32 Thing' from the boards list
4. make changes to your code, compile and push to the microcontroller. 
5. if having trouble debugging, you may reference the code we build ours upon at: https://RandomNerdTutorials.com/esp32-firebase-realtime-database/

:old_key:	Note: if you are looking to run our project, you will need to request the firebase key and database id directly from us and insert it into the code in the indicated positions


## Installing Interface Code
1. pull/clone this directory
2. navigate to the /interface directory and run `npm install`
3. run `ng serve` to deploy and test code changes locally
4. when satisified with code run `ng build` then `firebase deploy` to push the contents of the generated dist/ directory to your hosting server. 

:old_key: Note: if you are looking to run our project, you will need to request a file that will be placed at interface/src/environments/environments.ts that contains all of our secret firebase authentication codes and API keys. 


## Installing The Fabric
1. connect the pin outs from the fabric to the breakout board as shown in this image: ![Connection Detail](/documentation/connection_detail.jpg). 
2. Screw down terminals to secure connection. The black wire connects to power, the following grey wires are the analog outs for each section of the fabric. The breakout board contains the remaining wireing to complete the voltage dividers, using a fixed resistor of size 10 ohms. 
3. Make sure the arudino code connects to your local 2.4GHz network.
4. Upload the code, pressing the button labeled "0" as you upload to enable uploading mode on the Thing.  
5. Ensure the microcontroller is connecting to the network and firebase by monitoring the serial montior. 
6. When it works, disconnect the uploading cable and replace with a power cable. 
7. Navigate to https://a-fabric-that-remembers-rtd.web.app/ to seeif your press data is transfering. SOmetimes, depending on the network, it may take 1-2 seconds to reflect your press data. 


## User Interface Details
The user inerface for A Fabric that Remembers is viewable to anyone who can access it at the URL: https://a-fabric-that-remembers-rtd.web.app/ 
It contains two mode: Past and Present. 

### Present Mode
![The Present Mode shows the incoming press data in realtime](/documentation/interface_present.png).
Six large rectangles in the main window turn red when the corresponding region on the fabric is pressed. The depth of the red color corresponds to how hard the region is being pressed. At times, network delays can delay the reading (up to 5 seconds in our experince), so its best to press and wait. To ensure data, is in fact, stalled or being received, refer to the "data count" on teh bottom center of the view. This shows how many changes the interface has registered. If you are pressing the fabric, and this number is not changing, there is a network delay. When it does change, you should see the press values on the screen or as numeric values in the "data in" region. 

The bottom left corner of this view also contains a region for an admin to login. Logging in is required to ensure that the visualized is then cleaned and logged in firebase. Because anyone can open the interface, yet we only want one user who is co-located to the fabric writing to the database, we use the admin login as a feature to ensure only one client is writing to the database. 

![Clicking login reveals inputs for your information](/documentation/login_detail.png).
Pushing the login button reveals inputs for your login information. This login information uses username and password to authenticate. 

![Clicking login reveals inputs for your information](/documentation/logout_detail.png).
If you are logged in successfully, you will see this, which allows you to logout again if you wish. Login state is persistant across screen refreshes so you will likely not have to login more than once. 

### Past Mode
![The past mode stores the "memory" of the fabric and how it was pressed over time](/documentation/interface_past.png).
Past mode allows a person to look through the memory of the fabric, revealing where it was pressed at which times. The timeline on the bottom of the page shows the bulk number of presses over time, showing when it received more or less activity over the given timewindow. Scrolling over the timeline reveals the areas that were pressed most and least within that timewindow.

Behind the scenes, data is accumulated and logged every hour. It is only logged while the interface is running and the primary user is logged in. For viewing, all data points will be split into 50 regions, overtime, each segment of the history graph will represent a larger and larger portion of time. 

## Acknowledgements
This has been a collaborative project led by Laura Devendorf with weaving structure input by Sasha de Koninck, original network support by Shanel Wu and Emma Goodwill and documentation support by Mallory Benna and Nikita Menon. 


## Read More and Demo Video
https://unstable.design/a-fabric-that-remembers/
