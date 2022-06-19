"use strict";
exports.__esModule = true;
var fs_1 = require("fs");
var path_1 = require("path");
var CONTENT_DIR = path_1["default"].join(__dirname, '../content');
// Directory containing the roadmaps
var ROADMAP_CONTENT_DIR = path_1["default"].join(__dirname, '../content/roadmaps');
var roadmapKey = process.argv[2];
var roadmaps = {
    investments: require('../public/project/investments.json'),
    backend: require('../public/project/backend.json'),
    devops: require('../public/project/devops.json'),
    android: require('../public/project/android.json'),
    golang: require('../public/project/golang.json'),
    java: require('../public/project/java.json'),
    python: require('../public/project/python.json'),
    react: require('../public/project/react.json'),
    angular: require('../public/project/angular.json')
};
if (!roadmapKey || !roadmaps[roadmapKey]) {
    console.error("Invalid roadmap key " + roadmapKey);
    console.error("Allowed keys are " + Object.keys(roadmaps).join(', '));
    process.exit(1);
}
// Directory holding the roadmap content files
var roadmapDirName = fs_1["default"]
    .readdirSync(ROADMAP_CONTENT_DIR)
    .find(function (dirName) { return dirName.replace(/\d+-/, '') === roadmapKey; });
if (!roadmapDirName) {
    console.error('Roadmap directory not found');
    process.exit(1);
}
var roadmapDirPath = path_1["default"].join(ROADMAP_CONTENT_DIR, roadmapDirName);
var roadmapContentDirPath = path_1["default"].join(ROADMAP_CONTENT_DIR, roadmapDirName, 'content');
// If roadmap content already exists do not proceed as it would override the files
if (fs_1["default"].existsSync(roadmapContentDirPath)) {
    console.error("Roadmap content already exists @ " + roadmapContentDirPath);
    process.exit(1);
}
function prepareDirTree(control, dirTree, dirSortOrders) {
    var _a, _b;
    // Directories are only created for groups
    if (control.typeID !== '__group__') {
        return;
    }
    // e.g. 104-testing-your-apps:other-options
    var controlName = ((_a = control === null || control === void 0 ? void 0 : control.properties) === null || _a === void 0 ? void 0 : _a.controlName) || '';
    // e.g. 104
    var sortOrder = (_b = controlName.match(/^\d+/)) === null || _b === void 0 ? void 0 : _b[0];
    // No directory for a group without control name
    if (!controlName || !sortOrder) {
        return;
    }
    // e.g. testing-your-apps:other-options
    var controlNameWithoutSortOrder = controlName.replace(/^\d+-/, '');
    // e.g. ['testing-your-apps', 'other-options']
    var dirParts = controlNameWithoutSortOrder.split(':');
    // Nest the dir path in the dirTree
    var currDirTree = dirTree;
    dirParts.forEach(function (dirPart) {
        currDirTree[dirPart] = currDirTree[dirPart] || {};
        currDirTree = currDirTree[dirPart];
    });
    dirSortOrders[controlNameWithoutSortOrder] = Number(sortOrder);
    var childrenControls = control.children.controls.control;
    // No more children
    if (childrenControls.length) {
        childrenControls.forEach(function (childControl) {
            prepareDirTree(childControl, dirTree, dirSortOrders);
        });
    }
    return { dirTree: dirTree, dirSortOrders: dirSortOrders };
}
var roadmap = roadmaps[roadmapKey];
var controls = roadmap.mockup.controls.control;
// Prepare the dir tree that we will be creating and also calculate the sort orders
var dirTree = {};
var dirSortOrders = {};
controls.forEach(function (control) {
    prepareDirTree(control, dirTree, dirSortOrders);
});
/**
 * @param parentDir Parent directory in which directory is to be created
 * @param dirTree Nested dir tree to be created
 * @param sortOrders Mapping from groupName to sort order
 * @param filePaths The mapping from groupName to file path
 */
function createDirTree(parentDir, dirTree, sortOrders, filePaths) {
    if (filePaths === void 0) { filePaths = {}; }
    var _a;
    var childrenDirNames = Object.keys(dirTree);
    var hasChildren = childrenDirNames.length !== 0;
    // @todo write test for this, yolo for now
    var groupName = parentDir
        .replace(roadmapContentDirPath, '') // Remove base dir path
        .replace(/(^\/)|(\/$)/g, '') // Remove trailing slashes
        .replace(/(^\d+?-)/g, '') // Remove sorting information
        .replaceAll('/', ':') // Replace slashes with `:`
        .replace(/:\d+-/, ':');
    var humanizedGroupName = (_a = groupName
        .split(':')
        .pop()) === null || _a === void 0 ? void 0 : _a.replaceAll('-', ' ').replace(/^\w/, function ($0) { return $0.toUpperCase(); });
    var sortOrder = sortOrders[groupName] || '';
    // Attach sorting information to dirname
    // e.g. /roadmaps/100-frontend/content/internet
    // ———> /roadmaps/100-frontend/content/103-internet
    if (sortOrder) {
        parentDir = parentDir.replace(/(.+?)([^\/]+)?$/, "$1" + sortOrder + "-$2");
    }
    // If no children, create a file for this under the parent directory
    if (!hasChildren) {
        var fileName = parentDir + ".md";
        fs_1["default"].writeFileSync(fileName, "# " + humanizedGroupName);
        filePaths[groupName || 'home'] = fileName.replace(CONTENT_DIR, '');
        return filePaths;
    }
    // There *are* children, so create the parent as a directory
    // and create `readme.md` as the content file for this
    fs_1["default"].mkdirSync(parentDir);
    var readmeFilePath = path_1["default"].join(parentDir, 'readme.md');
    fs_1["default"].writeFileSync(readmeFilePath, "# " + humanizedGroupName);
    filePaths[groupName || 'home'] = readmeFilePath.replace(CONTENT_DIR, '');
    // For each of the directory names, create a
    // directory inside the given directory
    childrenDirNames.forEach(function (dirName) {
        createDirTree(path_1["default"].join(parentDir, dirName), dirTree[dirName], dirSortOrders, filePaths);
    });
    return filePaths;
}
// Create directories and get back the paths for created directories
var filePaths = createDirTree(roadmapContentDirPath, dirTree, dirSortOrders);
var contentPathsFilePath = path_1["default"].join(roadmapDirPath, 'content-paths.json');
fs_1["default"].writeFileSync(contentPathsFilePath, JSON.stringify(filePaths, null, 2));
var roadmapMetaFilePath = path_1["default"].join(roadmapDirPath, 'meta.json');
var roadmapMeta = require(roadmapMetaFilePath);
// Put the content paths file path in the roadmap meta
roadmapMeta.contentPathsFilePath = contentPathsFilePath.replace(roadmapDirPath, '.');
fs_1["default"].writeFileSync(roadmapMetaFilePath, JSON.stringify(roadmapMeta, null, 2));
