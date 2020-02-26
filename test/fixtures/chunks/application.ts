/* eslint-env browser */
const tmp = document.createElement("div");
tmp.innerHTML = "BEFORE";
document.body.appendChild(tmp);

async function main(): Promise<void> {
	const {myfunction} = await import("./myfunction"); // this didn't trigger the chunk, wtf
	tmp.innerHTML = "AFTER " + myfunction(123);
}
main().catch(e => console.error(e));

export {};
