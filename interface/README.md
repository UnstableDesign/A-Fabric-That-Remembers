


# A Fabric that Remembers (AFtR) - Version 2
This project connects a fabric controller to a real-time visualization. The controller is built with Platform IO and the EspressIF ESP 32 libraries. The real-time visualization is build in angular. The two components communicate through a Firebase real-time database. As such, presses on the fabric update the web-based visualization (deployeed at a-fabric-that-remembers-rtd.web.app). 

SRC - contains the angular application
HW - contains the platformIO workspace with code for the hardware.


This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 12.2.6.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.
