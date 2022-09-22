import gulp from "gulp";
import plumber from "gulp-plumber";
import postcss from "gulp-postcss";
import autoprefixer from "autoprefixer";
import csso from "postcss-csso";
import rename from "gulp-rename";
import { stacksvg } from "gulp-stacksvg";
import { htmlValidator } from "gulp-w3c-html-validator";
import browser from "browser-sync";

const { src, dest, watch, series, parallel } = gulp;

export function processStyles () {
	return src(["./styles/**/*.css", "!./styles/**/*.min.css"])
		.pipe(plumber())
		.pipe(postcss([
			autoprefixer(),
			csso()
		]))
		.pipe(
			rename({
				extname: ".min.css"
			})
		)
		.pipe(dest("./styles/"))
		.pipe(browser.stream());
}

export function createStack () {
	return src(["./icons/**/*.svg", "!./icons/stack.svg"])
		.pipe(stacksvg())
		.pipe(dest("./icons"));
}

export function validateMarkup() {
	return src("./*.html")
		.pipe(htmlValidator.analyzer())
		.pipe(htmlValidator.reporter({ throwErrors: true }))
}

export function startServer (done) {
	browser.init({
		server: {
			baseDir: "./"
		},
		cors: true,
		notify: false,
		ui: false,
	});
	done();
}

function reloadServer (done) {
	browser.reload();
	done();
}

function watchFiles () {
	watch("./styles/style.css", series(processStyles));
	watch("./icons/**/*.svg", series(createStack, reloadServer));
	watch("./**/*.{html,js,jpg,png,svg,ico,webmanifest}", series(reloadServer));
}

export function compileProject(done) {
	parallel(
		processStyles,
		createStack
	)(done);
}

export default series(
	compileProject,
	startServer,
	watchFiles
);
