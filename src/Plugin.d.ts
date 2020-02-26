/* eslint-disable */
declare module "@wildpeaks/integrity-webpack-plugin" {
	class Plugin {
		private filename: string;
		constructor(filename?: string);
		public apply(compiler: any): void;
	}
	export = Plugin;
}
