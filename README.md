# node-worker
HackMoscow 2019 project. A Node Worker for manageable P2P network. Controller repository: https://github.com/SmallShaqs/node-controller

## Description

This is the source code of a node worker which is responsible for handling communication
between other such nodes in a peer connected Virtual Networks on Microsoft Azure.

Nodes act as a bridge between company's computational resources and the network. They communicate with the controller node
to get information about relevant nodes and then send out messages to each node when computation is done. Other nodes are then
reponsible for interpreting the data.

## Development

`npm i` && `npm run dev`

## Startup

`npm i` && `npm run start`
