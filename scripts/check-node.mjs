// Fails when the running Node is outside the line this repo is pinned to.
// pnpm checks the Node version on a fresh install but not when it runs a
// script, so `pnpm check` runs this first.
import { readFileSync } from "node:fs";

const pinned = readFileSync(
	new URL("../.node-version", import.meta.url),
	"utf8",
).trim();
const [pinMajor, pinMinor, pinPatch] = pinned.split(".").map(Number);
const [major, minor, patch] = process.versions.node.split(".").map(Number);

const sameLine = major === pinMajor;
const atLeastPinned =
	minor > pinMinor || (minor === pinMinor && patch >= pinPatch);

if (!sameLine || !atLeastPinned) {
	console.error(
		`Unspoon needs Node ${pinMajor}.x at ${pinned} or newer, and this is Node ${process.versions.node}.\n` +
			"Switch to the version in .node-version, then run the command again.",
	);
	process.exit(1);
}
