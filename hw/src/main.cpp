/*
  A Fabric that Remembers Version 2 Code
  raw input values are sent directly to firebase database, when in turn updates live visulalization at 
  https://a-fabric-that-remembers-rtd.web.app/
  
  Modified from: Rui Santos
  Complete project details at our blog.
    - ESP32: https://RandomNerdTutorials.com/esp32-firebase-realtime-database/
    - ESP8266: https://RandomNerdTutorials.com/esp8266-nodemcu-firebase-realtime-database/
  Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files.
  The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
  Based in the RTDB Basic Example by Firebase-ESP-Client library by mobizt
  https://github.com/mobizt/Firebase-ESP-Client/blob/main/examples/RTDB/Basic/Basic.ino
*/

#include <Arduino.h>
#if defined(ESP32)
  #include <WiFi.h>
#elif defined(ESP8266)
  #include <ESP8266WiFi.h>
#endif
#include <Firebase_ESP_Client.h>

//Provide the token generation process info.
#include "addons/TokenHelper.h"
//Provide the RTDB payload printing info and other helper functions.
#include "addons/RTDBHelper.h"

// Insert your network credentials - must be 2.4 Ghz
#define WIFI_SSID "YOUR WIFI NETWORK HERE"
#define WIFI_PASSWORD "YOUR PASSWORD HERE"

// Insert Firebase project API Key
#define API_KEY "FIREBASE API KEY HERE"

// Insert RTDB URLefine the RTDB URL */
#define DATABASE_URL "DATABASE URL HERE" 

//Define Firebase Data object
FirebaseData fbdo;

FirebaseAuth auth;
FirebaseConfig config;

unsigned long sendDataPrevMillis = 0;
int count = 0;
bool signupOK = false;


//pins for force region 1-6 
//36 is top left
int fregs[] = {37, 38, 39, 32, 33, 34};

const String db_location[6] = {"pressdata/reg0", "pressdata/reg1", "pressdata/reg2", "pressdata/reg3", "pressdata/reg4", "pressdata/reg5"};

//the sensor values on each round
int vals[6];

//the total number of regions on the fabric
int num_regs = 6;




/* reads and prints all inputs */
void print_raw_values(){
 //iterate through each input
  for(int i = 0; i < num_regs; i++){
    Serial.print(vals[i]);
    if(i < (num_regs-1)) Serial.print(","); //a comma between vals allows multiple draws to plotter 
    else Serial.println();
  }  
}


void write_region_to_firebase(int region_id, int value){
     // Write an Int number on the database path test/int
    if (Firebase.RTDB.setInt(&fbdo, db_location[region_id], value)){
      Serial.println("PASSED");
      Serial.println("PATH: " + fbdo.dataPath());
      Serial.println("TYPE: " + fbdo.dataType());
    }
    else {
      Serial.println("FAILED");
      Serial.println("REASON: " + fbdo.errorReason());
    }
}

void read_values(){
  for(int i = 0; i < num_regs; i++){
      vals[i] = analogRead(fregs[i]); 
      write_region_to_firebase(i, vals[i]);
      delay(10);
    }  

  delay(1000);
}


void setup(){

  for(int i = 0; i < num_regs; i++){
    pinMode(fregs[i], INPUT);
  }


  
  Serial.begin(115200);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to Wi-Fi");
  Serial.println(WIFI_SSID);
  Serial.println(WIFI_PASSWORD);
 
  while (WiFi.status() != WL_CONNECTED){
    Serial.print(".");
    delay(300);
  }

  Serial.println();
  Serial.print("Connected with IP: ");
  Serial.println(WiFi.localIP());
  Serial.println();

  /* Assign the api key (required) */
  config.api_key = API_KEY;

  /* Assign the RTDB URL (required) */
  config.database_url = DATABASE_URL;


  //set a connection delay here (or put sign up function in loop)
  delay(5000);
  Serial.println("attempting first signup");
  while(!signupOK){
    Serial.println("trying signup again");

    /* Sign up */
    if (Firebase.signUp(&config, &auth, "", "")){
      Serial.println("ok");
      signupOK = true;
    }
    else{
      Serial.printf("%s\n", config.signer.signupError.message.c_str());
    }
    delay(1000);
  }

  /* Assign the callback function for the long running token generation task */
  config.token_status_callback = tokenStatusCallback; //see addons/TokenHelper.h
  
  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);

}

void loop(){

  read_values();
  print_raw_values();
  delay(100);
  
  
  
  
  

   
}










