/* eslint-env node, mocha */
/* eslint-disable no-empty */
/* eslint-disable no-empty-function */
/* eslint-disable prefer-arrow-callback */
"use strict";
const {readFileSync} = require("fs");
const {join, relative} = require("path");
const {strictEqual, deepStrictEqual} = require("assert");
const rimraf = require("rimraf");
const rreaddir = require("recursive-readdir");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const SriPlugin = require("webpack-subresource-integrity");
const {JSDOM} = require("jsdom");
const IntegrityPlugin = require("..");
const rootFolder = process.cwd();
const outputFolder = join(rootFolder, "tmp");

beforeEach(function () {
	try {
		rimraf.sync(outputFolder, {glob: false, emfileWait: true});
	} catch (e) {}
});

async function getFiles() {
	const files = await rreaddir(outputFolder);
	return files.map((filepath) => relative(outputFolder, filepath).replace(/\\/g, "/"));
}

function build({entry, output, plugins}) {
	return new Promise((resolve, reject) => {
		webpack(
			{
				mode: "development",
				// mode: "production",
				target: "web",
				resolve: {
					extensions: [".ts", ".js"]
				},
				context: rootFolder,
				entry,
				output,
				plugins,
				module: {
					rules: [
						{
							test: /\.(ts|js)$/,
							use: [
								{
									loader: "ts-loader",
									options: {
										transpileOnly: true
									}
								}
							]
						},
						{
							test: /\.css$/,
							use: [
								MiniCssExtractPlugin.loader,
								{
									loader: "css-loader",
									options: {
										modules: true
									}
								}
							]
						}
					]
				}
			},
			(err, _stats) => {
				if (err) {
					console.log("ERR", err);
					reject();
				} else {
					resolve();
				}
			}
		);
	});
}

function runFixture({title, entry, plugin, expectedIntegrity, expectedFiles}) {
	it(
		title,
		/* @this */ async function () {
			this.slow(10000);
			this.timeout(10000);

			await build({
				entry,
				output: {
					filename: "[name].js",
					chunkFilename: "chunk.[id].js",
					path: outputFolder,
					crossOriginLoading: "anonymous"
				},
				plugins: [
					new MiniCssExtractPlugin({
						filename: "[name].css",
						chunkFilename: "chunk.[id].css"
					}),
					new HtmlWebpackPlugin({
						title,
						filename: "index.html"
					}),
					new SriPlugin({
						hashFuncNames: ["sha256", "sha384"]
					}),
					plugin
				]
			});

			const actualFiles = await getFiles();
			deepStrictEqual(actualFiles.sort(), expectedFiles.sort(), "Files");

			const actualData = JSON.parse(readFileSync(join(outputFolder, expectedIntegrity), "utf8"));
			strictEqual(typeof actualData, "object", "JSON is an Object");

			const html = readFileSync(join(outputFolder, "index.html"), "utf8");
			const dom = new JSDOM(html);
			const {document} = dom.window;
			const scripts = document.querySelectorAll("script[integrity]");
			const styles = document.querySelectorAll("link[integrity]");
			for (const script of scripts) {
				const src = script.getAttribute("src");
				const integrity = script.getAttribute("integrity");
				strictEqual(actualData[src], integrity, `Script ${src}`);
			}
			for (const style of styles) {
				const href = style.getAttribute("href");
				const integrity = style.getAttribute("integrity");
				strictEqual(actualData[href], integrity, `Style ${href}`);
			}
		}
	);
}

describe("Fixtures", () => {
	runFixture({
		title: "Basic JS",
		entry: {
			app: "./test/fixtures/basic-js/application.js"
		},
		plugin: new IntegrityPlugin(),
		expectedIntegrity: "integrity.json",
		expectedFiles: ["app.js", "integrity.json", "index.html"]
	});
	runFixture({
		title: "Basic TS",
		entry: {
			app: "./test/fixtures/basic-ts/application.ts"
		},
		plugin: new IntegrityPlugin(),
		expectedIntegrity: "integrity.json",
		expectedFiles: ["app.js", "integrity.json", "index.html"]
	});
	runFixture({
		title: "Basic CSS",
		entry: {
			app: "./test/fixtures/basic-css/application.js"
		},
		plugin: new IntegrityPlugin(),
		expectedIntegrity: "integrity.json",
		expectedFiles: ["app.js", "app.css", "integrity.json", "index.html"]
	});
	runFixture({
		title: "Custom filename",
		entry: {
			app: "./test/fixtures/basic-js/application.js"
		},
		plugin: new IntegrityPlugin("subfolder/custom.json"),
		expectedIntegrity: "subfolder/custom.json",
		expectedFiles: ["app.js", "subfolder/custom.json", "index.html"]
	});
	runFixture({
		title: "Chunks",
		entry: {
			app: "./test/fixtures/chunks/application.ts"
		},
		plugin: new IntegrityPlugin(),
		expectedIntegrity: "integrity.json",
		expectedFiles: ["app.js", "chunk.0.js", "integrity.json", "index.html"]
	});
	runFixture({
		title: "Multiple entries",
		entry: {
			app1: "./test/fixtures/multiple/application1.js",
			app2: "./test/fixtures/multiple/application2.js"
		},
		plugin: new IntegrityPlugin(),
		expectedIntegrity: "integrity.json",
		expectedFiles: ["app1.js", "app2.js", "integrity.json", "index.html"]
	});
});
