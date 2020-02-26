/* eslint-env node, mocha */
/* eslint-disable object-shorthand */
/* eslint-disable prefer-arrow-callback */
"use strict";
const {strictEqual} = require("assert");
const IntegrityPlugin = require("..");

function runTest({title, filename, expectError}) {
	it(title, function() {
		let throws = false;
		try {
			const _plugin = new IntegrityPlugin(filename);
		} catch (e) {
			throws = true;
		}
		strictEqual(throws, expectError);
	});
}

describe("Filename", () => {
	runTest({
		title: "Valid: undefined",
		filename: undefined,
		expectError: false
	});
	runTest({
		title: 'Valid: "custom.json"',
		filename: "custom.json",
		expectError: false
	});
	runTest({
		title: "Invalid: null",
		filename: null,
		expectError: true
	});
	runTest({
		title: "Invalid: false",
		filename: false,
		expectError: true
	});
	runTest({
		title: "Invalid: 1",
		filename: 1,
		expectError: true
	});
	runTest({
		title: "Invalid: function",
		filename: function() {
			//
		},
		expectError: true
	});
});
