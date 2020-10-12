### Proxy Scanner
Platform for testing the edge network and IOT devices

Monitors for signals which are proxied by Redis

Signals can be streamed using stream project


#### Getting Started

1. Clone this repository.
2. npm install
3. need a redis installation or redis lab account
4. node server


#### LICENSE
MIT

#### research

* sample raw data packet
02010610FF107803E8000000000000640023290009094536372045414145

BLE data is decoded as follows:

1st byte = length (n bytes)
2nd byte = Types
n-1 bytes = actual data
And this repeats over the whole raw data. On above raw packet:

1st Set:
02: Length: 2 Bytes
01: Type: Flags
06: Flag - 02 && 04: LE General Discoverable && BR/EDR Not Supported

2nd Set:
10: Length: 16 bytes
FF: Type: Manufacture Data
107803E80000000000006400232900: Data specific to the manufacturer

3rd Set:
09: Length: 9 bytes
09: Type: Complete Local Name
4536372045414145: E67 EAAE (Name of device in ASCII)

* more info here
https://www.bluetooth.com/specifications/assigned-numbers/generic-access-profile/

