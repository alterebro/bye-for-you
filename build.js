const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

const targets = ['chrome', 'firefox'];

const rootDir = __dirname;
const srcDir = path.join(rootDir, 'src');
const buildDir = path.join(rootDir, 'build');

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
	for (let target of targets) {
		const outDir = path.join(buildDir, target);
		cleanDir(outDir);

		copyRecursiveSync(srcDir, outDir);

		writeManifest(target, outDir);

		const zipName = `bye-for-you-${target}-v${version}.zip`;
		const zipPath = path.join(buildDir, zipName);
		await zipDirectory(outDir, zipPath);

		console.log(`✅ Built ${target} → ${zipPath}`);
	}
})();
