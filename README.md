# vexneuralnet

**GaelScout** is an open-source tool for [VEX Robotics Competition](https://www.vexrobotics.com/vexedr/competition)
that predicts match outcomes based on state of the art deep learning libraries.
It is currently supported on macOS. It serves five main purposes:

1. **Predict match outcomes.**
   GaelScout uses a neural network to predict the outcome of a match based on
   the vratings of each team in a match. It uses the [VexDB API](https://vexdb.io/the_data) to collect this information and process matches. The neural network was trained
   with 2000 matches using the VexDB API.

2. **Predict match outcomes for all matches in a tournament.**
   GaelScout uses the VexDB API to fetch all the matches in a tournament, given
   the tournament's SKU, and process the matches automatically.

3. **Predict match outcomes for a specific team in a tournament.**
   GaelScout allows searching for the matches that a specific team will be
   participating in and the prediction of those match outcomes in order to make
   its use by teams during tournaments seamless.

4. **Predict match outcomes for a specific match in a tournament.**
   GaelScout allows searching for a specific match and predicting the outcome of
   that match in a tournament.

5. **Predict tournament rankings.**
   GaelScout uses data based on match outcomes to create rankings for teams in a
   tournament, which are predictions for the actual rankings in the tournament.

## Downloads

GaelScout can be downloaded [here](https://bit.ly/GaelScoutDownloads).

## Todos

-   [x] Predict match between two alliances
-   [x] Predict all tournament matches
-   [x] Predict specific tournament match
-   [x] Predict tournament matches for a specific team
-   [x] Predict tournament rankings
-   [x] Display statistics of a specific team and visualize data
-   [x] Implement accuracy test
