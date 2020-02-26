/* eslint-env browser */
/* eslint-disable no-var */
"use strict";
const {green} = require("./application.css");

var tmp = document.createElement("div");
tmp.className = green;
tmp.innerHTML = "Hello World";
document.body.appendChild(tmp);
