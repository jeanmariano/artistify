User Interface Design
ZZZify
Bao Nguyen
Andrew Phan
Jean Mariano
Andreas Hadjigeorgiou

Below is a description of the functions of each files, as well as an overview
of general high-level methods used to create the application.

We used jQuery, html, css, and bootstrap to build our application. Our code is
organized to differentiate client-facing front-end and a custom api backend
built on top of the echonest and spotify api, to modularize responsibilities
and make a clear distinction between the front-end and back-end development needed
for our application. In doing so, we were able to streamline workflow for anyone
who was developing, minimizing merge conflicts and blocking issues.


index.html

This file contains all the html used to display our application. It calls
appropriate js files in order to be used in the html. We used bootstrap in order
to maintain a clean, consistent styling, as well as use bootstrap js functions,
such at modals.

script-backend.js

This file contains all the api calls (using ajax) to any apis that interact with
our application. The spotify api is used to get preview urls from albums, artists,
and songs. The echo nest api is used to find lists of songs, with parameters
including loudness and energy, in an algorithm built to create a playlist with
these qualities, increasing linearly. Using the echonest and spotify api, we
created wrappers to simplify all the api calls needed in the front-end, in order
to maintain separate workflows for each part of our application.

script.js

This file contains all the logic corresponding to time, playing music, changing
screens, button presses, etc. Any dynamic front-end capabilities are expressed
in this file, including dynamic form fields (such as genre), and modals with the
ability to save certain values (edit form, save alarm). This file also calculates
all necessary time properties that need to be displayed to the user, and which
allow for the correct calculation of songs to play, when. 
