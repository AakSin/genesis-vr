#include <SparkFun_MMA8452Q.h>
//#include <string.h>

#include <Wire.h> // Must include Wire library for I2C
//#include <SFE_MMA8452Q.h> // Includes the SFE_MMA8452Q library

// Begin using the library by creating an instance of the MMA8452Q
// class. We’ll call it “accel”. That’s what we’ll reference from
// here on out.
MMA8452Q accel;


/*****************************************************************
  XBee_Serial_Passthrough.ino

  Set up a software serial port to pass data between an XBee Shield
  and the serial monitor.

  Hardware Hookup:
  The XBee Shield makes all of the connections you'll need
  between Arduino and XBee. If you have the shield make
  sure the SWITCH IS IN THE "DLINE" POSITION. That will connect
  the XBee's DOUT and DIN pins to Arduino pins 2 and 3.

*****************************************************************/
// We'll use SoftwareSerial to communicate with the XBee:
#include <SoftwareSerial.h>

//For Atmega328P's
// XBee's DOUT (TX) is connected to pin 2 (Arduino's Software RX)
// XBee's DIN (RX) is connected to pin 3 (Arduino's Software TX)
SoftwareSerial XBee(2, 3); // RX, TX

//For Atmega2560, ATmega32U4, etc.
// XBee's DOUT (TX) is connected to pin 10 (Arduino's Software RX)
// XBee's DIN (RX) is connected to pin 11 (Arduino's Software TX)
//SoftwareSerial XBee(10, 11); // RX, TX
const int button1Pin = 11;
const int button2Pin = 12;

void setup()
{
  // Set up both ports at 9600 baud. This value is most important
  // for the XBee. Make sure the baud rate matches the config
  // setting of your XBee.
  XBee.begin(9600);
  Serial.begin(9600);
  pinMode(button1Pin, INPUT_PULLUP);
  pinMode(button2Pin, INPUT_PULLUP);
  accel.init();

  Serial.println("MMA8452Q Test Code!");

}

void loop() 

  {
//  if(digitalRead(button1Pin) == HIGH){
//    Serial.println("high");
//    }
    if (accel.available())
    {
      //  String datapacket =
      // First, use accel.read() to read the new variables:
      accel.read();

      String packet = String(accel.cx);
      packet += "\t";
      packet += String(accel.cy);
      packet += "\t";
      packet += String(accel.cz);
      packet += "\t";
      // accel.readPL() will return a byte containing information
      // about the orientation of the sensor. It will be either
      // PORTRAIT_U, PORTRAIT_D, LANDSCAPE_R, LANDSCAPE_L, or
      // LOCKOUT.
      byte pl = accel.readPL();
      switch (pl)
      {
        case PORTRAIT_U:
          packet += "Portrait Up";
          break;
        case PORTRAIT_D:
          packet += "Portrait Down";
          break;
        case LANDSCAPE_R:
          packet += "Landscape Right";
          break;
        case LANDSCAPE_L:
          packet += "Landscape Left";
          break;
        case LOCKOUT:
          packet += "Flat";
          break;
      }
      packet += "\t";
      packet += String(!(digitalRead(button1Pin)));
      packet += "\t";
      packet += String(!(digitalRead(button2Pin)));


      char* buf = (char*) malloc(sizeof(char) * packet.length() + 1);

//      Serial.println("Using toCharArray");
      packet.toCharArray(buf, packet.length() + 1);

      Serial.println(buf);
      XBee.write(buf);

//      Serial.println("Freeing the memory");
      free(buf);
//      Serial.println("No leaking!");

      delay(10);
      XBee.write(13);
      delay(10);
      XBee.write(10);
      delay(10);


      //    printCalculatedAccels();

      //Serial.println();

      //XBee.write(accel.cx);
    }
    //  if (Serial.available())
    //  { // If data comes in from serial monitor, send it out to XBee
    //    XBee.write(Serial.read());
    //  }


    if (XBee.available())
    { // If data comes in from XBee, send it out to serial monitor
      Serial.write(XBee.read());
    }
  }

  void printCalculatedAccels()
  {
    Serial.print(accel.cx, 3);
    Serial.print("\t");
    Serial.print(accel.cy, 3);
    Serial.print("\t");
    Serial.print(accel.cz, 3);
    Serial.print("\t");
  }
