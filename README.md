# Get Top News
**gettopnews** is a command line tool that can be used to get top trending news about latest technologies and technological happenings. The module is quite so handy that you don't have to visit differnet websites to rake through updates and howabouts in the digital world.

## How to install
You can install **gettopnews** with following command
```sh
$ npm install gettopnews -g
```

## How to use
You can use **gettopnews** tool by typing following command in the terminal or commnand prompt
```sh
$ gettopnews --posts 7
```
The above commnad will display top news ranked in descending order by their score.

## Options
1. *--help*: display information about the tool
2. *--posts*: number of posts you wan to see.

## Run in local
You may run the tool on your local machine by cloning the repository.
Clone the repo
```sh
$ cd getTopNews
$ npm install
$ node index.js --posts 7
```
Run tests
```sh
$ npm test
```
## License
MIT
Author: @nileskh2504 <nileshfbk123@gmail.com>