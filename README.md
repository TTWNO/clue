# ttrpg.co
A WIP Table-Top Role-Playing-Game (TTRPG) Service

### Installation

To run the server, use the following:

`cd server`
`npm install`
`npm run`

Join on localhost:8080

### Development

To run the server with nodemon (for dev purposes), use the following:

`cd server`
`npm install --dev`
`npm run dev`

Join on localhost:8080


## TODO:

1. Move board info to server side.
2. Seperate server logic into seperate files
3. Make sync() function which will force reload all data from the server
4. Send existing user's positions to new users
(currently, users who have already joined are not visible to new users until they move after the new users has joined).
5. Make a grid/map JSON object specification.
6. Tie permenant userids via signup page.
7. Use `<img>` and `alt=` to make tiles accessible.
8. User inventories
9. GM mode. View entire map, change visibility to global users or to individuals.
10. Multiple layers; z index; allows multiple stories of a building.
11. Universal colours for users. (currently calculated by client).
12. Dice roll API (possibly seperate simple project).

## NOT TODO:

1. Due to worries about being sued by WotC, this will not be a commercial product; it will not be to make money.
(The exception to this is a find a good lawyer that can tell me what I can and cannot implement to make sure they don't come after me).
2. Integrate different game's mechanics.
Spells/items/etc should be handled by the GM,
although the items may be stored on the player using this program,
it will not automatically calculate anything for you.
