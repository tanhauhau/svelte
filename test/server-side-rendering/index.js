import * as assert from "assert";
import * as fs from "fs";
import * as path from "path";
import * as register from '../register';

import {
	loadConfig,
	loadSvelte,
	setupHtmlEqual,
	tryToLoadJson,
	shouldUpdateExpected,
} from "../helpers.js";

function tryToReadFile(file) {
	try {
		return fs.readFileSync(file, "utf-8");
	} catch (err) {
		if (err.code !== "ENOENT") throw err;
		return null;
	}
}

const sveltePath = process.cwd().split('\\').join('/');
const compile = null;

describe("ssr", () => {
	before(() => {

		register.setCompileOptions({
			generate: 'ssr',
		});
		register.setCompile(loadSvelte(true).compile);
		register.setOutputFolderName('ssr');

		return setupHtmlEqual();
	});

	fs.readdirSync(`${__dirname}/samples`).forEach(dir => {
		if (dir[0] === ".") return;

		// add .solo to a sample directory name to only run that test, or
		// .show to always show the output. or both
		const solo = /\.solo/.test(dir);
		const show = /\.show/.test(dir);

		if (solo && process.env.CI) {
			throw new Error("Forgot to remove `solo: true` from test");
		}

		(solo ? it.only : it)(dir, () => {
			dir = path.resolve(`${__dirname}/samples`, dir);

			try {
				const Component = require(`${dir}/main.svelte`).default;

				const expectedHtml = tryToReadFile(`${dir}/_expected.html`);
				const expectedCss = tryToReadFile(`${dir}/_expected.css`) || "";

				const props = tryToLoadJson(`${dir}/data.json`) || undefined;

				const rendered = Component.render(props);
				const { html, css, head } = rendered;

				fs.writeFileSync(`${dir}/_actual.html`, html);
				if (css.code) fs.writeFileSync(`${dir}/_actual.css`, css.code);

				try {
					assert.htmlEqual(html, expectedHtml);
				} catch (error) {
					if (shouldUpdateExpected()) {
						fs.writeFileSync(`${dir}/_expected.html`, html);
						console.log(`Updated ${dir}/_expected.html.`);
					} else {
						throw error;
					}
				}

				try {
					assert.equal(
						css.code.replace(/^\s+/gm, ""),
						expectedCss.replace(/^\s+/gm, "")
					);
				} catch (error) {
					if (shouldUpdateExpected()) {
						fs.writeFileSync(`${dir}/_expected.css`, css.code);
						console.log(`Updated ${dir}/_expected.css.`);
					} else {
						throw error;
					}
				}

				if (fs.existsSync(`${dir}/_expected-head.html`)) {
					fs.writeFileSync(`${dir}/_actual-head.html`, head);

					try {
						assert.htmlEqual(
							head,
							fs.readFileSync(`${dir}/_expected-head.html`, 'utf-8')
						);
					} catch (error) {
						if (shouldUpdateExpected()) {
							fs.writeFileSync(`${dir}/_expected-head.html`, head);
							console.log(`Updated ${dir}/_expected-head.html.`);
						} else {
							throw error;
						}
					}
				}
			} catch (err) {
				err.stack += `\n\ncmd-click: ${path.relative(process.cwd(), dir)}/main.svelte`;
				throw err;
			}
		});
	});

	// duplicate client-side tests, as far as possible
	fs.readdirSync("test/runtime/samples").forEach(dir => {
		if (dir[0] === ".") return;

		const config = loadConfig(`./runtime/samples/${dir}/_config.js`);
		const solo = config.solo || /\.solo/.test(dir);

		if (solo && process.env.CI) {
			throw new Error("Forgot to remove `solo: true` from test");
		}

		if (config.skip_if_ssr) return;

		(config.skip ? it.skip : solo ? it.only : it)(dir, () => {
			const cwd = path.resolve("test/runtime/samples", dir);

			delete global.window;
			
			register.clearRequireCache();
			register.setCompileOptions({
				...config.compileOptions,
				generate: 'ssr',
			});
			register.setOutputFolderName('ssr');

			try {
				if (config.before_test) config.before_test();

				const Component = require(`../runtime/samples/${dir}/main.svelte`).default;
				const { html } = Component.render(config.props, {
					store: (config.store !== true) && config.store
				});

				if (config.ssrHtml) {
					assert.htmlEqual(html, config.ssrHtml);
				} else if (config.html) {
					assert.htmlEqual(html, config.html);
				}

				if (config.after_test) config.after_test();
			} catch (err) {
				err.stack += `\n\ncmd-click: ${path.relative(process.cwd(), cwd)}/main.svelte`;

				if (config.error) {
					if (typeof config.error === 'function') {
						config.error(assert, err);
					} else {
						assert.equal(err.message, config.error);
					}
				} else {
					throw err;
				}
			}
		});
	});
});
