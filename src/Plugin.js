"use strict";

class Plugin {
	constructor(filename = "integrity.json") {
		if (typeof filename !== "string") {
			throw new Error("The filename should be a String");
		}
		this.filename = filename;
	}
	apply(compiler) {
		compiler.hooks.emit.tap("wildpeaks-integrity-plugin", (compilation) => {
			const aggregated = {};
			const {assets} = compilation;
			const ids = Object.keys(assets).sort();
			for (const id of ids) {
				const {integrity} = assets[id];
				if (typeof integrity === "string") {
					aggregated[id] = integrity;
				}
			}
			const buffer = JSON.stringify(aggregated);
			assets[this.filename] = {
				source() {
					return buffer;
				},
				size() {
					return buffer.length;
				}
			};
		});
	}
}

module.exports = Plugin;
