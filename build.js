const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

const targets = ['chrome', 'firefox'];
const rootDir = __dirname;
const srcDir = path.join(rootDir, 'src');
const buildDir = path.join(rootDir, 'build');

const extraFiles = ['LICENSE', 'README.md'];

const pkg = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf-8'));
const version = pkg.version;

// Firefox-specific config
const geckoBlock = {
	browser_specific_settings: {
		gecko: {
			id: "bye-for-you@alterebro.com",
			strict_min_version: "109.0"
		}
	}
};

function cleanDir(dir) {
	if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
	fs.mkdirSync(dir, { recursive: true });
}

function cleanZips(dir) {
	const files = fs.readdirSync(dir);
	files.forEach(file => {
		if (file.endsWith('.zip')) fs.unlinkSync(path.join(dir, file));
	});
}

function copyRecursiveSync(src, dest) {
	const entries = fs.readdirSync(src, { withFileTypes: true });
	for (let entry of entries) {
		const srcPath = path.join(src, entry.name);
		const destPath = path.join(dest, entry.name);

		if (entry.isDirectory()) {
			fs.mkdirSync(destPath);
			copyRecursiveSync(srcPath, destPath);
		} else {
			fs.copyFileSync(srcPath, destPath);
		}
	}
}

function copyExtras(destDir) {
	for (let file of extraFiles) {
		const filePath = path.join(rootDir, file);
		if (fs.existsSync(filePath)) {
			fs.copyFileSync(filePath, path.join(destDir, file));
		}
	}
}

function writeManifest(target, outDir) {
	const manifestPath = path.join(outDir, 'manifest.json');
	const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
	manifest.version = version;
	if (target === 'firefox') {
		manifest.browser_specific_settings = geckoBlock.browser_specific_settings;
	} else {
		delete manifest.browser_specific_settings;
	}
	fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
}

function zipDirectory(srcDir, outPath) {
	const output = fs.createWriteStream(outPath);
	const archive = archiver('zip', { zlib: { level: 9 } });
	return new Promise((resolve, reject) => {
		archive.pipe(output);
		archive.directory(srcDir, false);
		archive.on('error', reject);
		archive.on('end', resolve);
		archive.finalize();
	});
}

(async () => {
	cleanDir(buildDir);
	cleanZips(buildDir);

	for (let target of targets) {
		const outDir = path.join(buildDir, target);
		cleanDir(outDir);

		copyRecursiveSync(srcDir, outDir);
		copyExtras(outDir);
		writeManifest(target, outDir);

		const zipName = `bye-for-you-${target}-v${version}.zip`;
		const zipPath = path.join(buildDir, zipName);
		await zipDirectory(outDir, zipPath);

		console.log(`✅ Built ${target} → ${zipPath}`);
	}

	console.log(`📦 Version ${version} build complete.`);
})();



// 📄 Convert README.md → docs/index.html
const marked = require('marked');

function generateDocsHTML() {
	const readmePath = path.join(rootDir, 'README.md');
	const docsDir = path.join(rootDir, 'docs');
	const outputPath = path.join(docsDir, 'index.html');

	if (!fs.existsSync(readmePath)) return;

	const markdown = fs.readFileSync(readmePath, 'utf-8');
	const htmlBody = marked.parse(markdown);

	const html = `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	<title>Bye For You – Docs</title>
<style>
body { 
    max-width: 42rem; 
    margin: 0 auto; 
    padding: 2rem; 
    font-family: system-ui, sans-serif; 
	color: #333; 
    font-weight: 400; 
    line-height: 1.65; 
    font-size: 1em; 
}
strong { font-weight: 600; }
a { 
    color: #09f; 
    text-decoration: none; 
}
a:hover { 
    color: #000; 
    text-decoration: underline; 
}
ul { padding: 1em 2em; }
ul li { padding: .1em 0; }
ul li:first-child { padding-top: 0; }
ul li:last-child { padding-bottom: 0; }
h1, h2, h3 {
    line-height: 1.3; 
    font-weight: 700; 
}
h1 { 
    font-size: 200%; 
    margin: 0 0 .5em; 
    letter-spacing: -.5px; 
}
h2 { 
    font-size: 165%; 
    margin: 0 0 .25em; 
}
h3 { 
    font-size: 135%; 
    margin: 0 0 .25em; 
}
p { margin: 1em 0; }
p+h2, ul+h2, ol+h2 {  padding-top: 1.5em; }
p+h3, ul+h3, ol+h3 {  padding-top: 1em; }
p+ul {  padding-top: 0; }
img { 
    display: block; 
    max-width: 100%; 
    margin: 2em 0; 
    border-radius: 5px; 
    box-shadow: 0 5px 15px -5px rgba(0, 0, 0, .15); 
}
pre { 
    font-family: Consolas, Menlo, Monaco, "Andale Mono WT", "Andale Mono", "Lucida Console", "Lucida Sans Typewriter", "DejaVu Sans Mono", "Bitstream Vera Sans Mono", "Liberation Mono", "Nimbus Mono L", "Courier New", Courier, monospace; 
    font-size: .85rem; 
    tab-size: 2; 
    border-radius: 5px; 
    padding: 1em; 
    max-width: 100%; 
    background: #eee; 
    color: #555; 
    overflow-x: scroll; 
}
hr { 
    background: none; 
    border: none; 
    border-bottom: dashed #999 1px; 
    height: 1px; 
    line-height: 1px; 
    margin: 2em 0; 
    padding: 0; 
}
</style>
</head>
<body>
	${htmlBody}
</body>
</html>`;

	fs.mkdirSync(docsDir, { recursive: true });
	fs.writeFileSync(outputPath, html);
	console.log(`📘 README.md to /docs generated → ${outputPath}`);
}


function copyImagesToDocs() {
	const imagesSrc = path.join(rootDir, 'images');
	const imagesDest = path.join(rootDir, 'docs', 'images');

	if (!fs.existsSync(imagesSrc)) {
		console.warn('⚠️  No /images folder to copy on /docs.');
		return;
	}

	fs.mkdirSync(imagesDest, { recursive: true });

	const entries = fs.readdirSync(imagesSrc, { withFileTypes: true });

	for (const entry of entries) {
		const srcPath = path.join(imagesSrc, entry.name);
		const destPath = path.join(imagesDest, entry.name);

		if (entry.isDirectory()) {
			continue;
		}

		fs.copyFileSync(srcPath, destPath);
	}

	console.log(`🖼️  /images folder copied to /docs/images/`);
}

generateDocsHTML();
copyImagesToDocs();
