"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

// src/extension.ts
var extension_exports = {};
__export(extension_exports, {
  activate: () => activate,
  deactivate: () => deactivate
});
module.exports = __toCommonJS(extension_exports);
var vscode2 = __toESM(require("vscode"));

// src/TodoProvider.ts
var vscode = __toESM(require("vscode"));
var TodoProvider = class {
  constructor() {
    __publicField(this, "_onDidChangeTreeData", new vscode.EventEmitter());
    __publicField(this, "onDidChangeTreeData", this._onDidChangeTreeData.event);
    __publicField(this, "todos", []);
    console.log("\u0421\u043E\u0437\u0434\u0430\u043D \u044D\u043A\u0437\u0435\u043C\u043F\u043B\u044F\u0440 TodoProvider");
    this.scanTodos();
    vscode.workspace.onDidChangeTextDocument(() => this.scanTodos());
    vscode.workspace.onDidSaveTextDocument(() => this.scanTodos());
    vscode.workspace.onDidOpenTextDocument(() => this.scanTodos());
  }
  getTreeItem(element) {
    const treeItem = new vscode.TreeItem(element.label, vscode.TreeItemCollapsibleState.None);
    treeItem.description = element.description;
    treeItem.command = {
      command: "todo-list.goToTodo",
      title: "Go to TODO",
      arguments: [element.location]
    };
    return treeItem;
  }
  getChildren(element) {
    return Promise.resolve(this.todos);
  }
  async scanTodos() {
    console.log("\u0421\u043A\u0430\u043D\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u0435 TODO...");
    this.todos = [];
    const files = await vscode.workspace.findFiles("**/*.{js,ts,jsx,tsx,py,java,cpp,cs}", "**/node_modules/**");
    await Promise.all(files.map(async (file) => {
      const document = await vscode.workspace.openTextDocument(file);
      const text = document.getText();
      const regex = /(?:\/\/|#|\/\*)\s*TODO:\s*(.*)/g;
      let match;
      while ((match = regex.exec(text)) !== null) {
        const todoText = match[1].trim();
        const line = document.positionAt(match.index).line;
        const location = new vscode.Location(file, new vscode.Range(line, 0, line, 0));
        this.todos.push({
          label: todoText,
          description: `${file.fsPath}:${line + 1}`,
          location
        });
      }
    }));
    this._onDidChangeTreeData.fire();
    console.log("\u0421\u043A\u0430\u043D\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u0435 TODO \u0437\u0430\u0432\u0435\u0440\u0448\u0435\u043D\u043E. \u041D\u0430\u0439\u0434\u0435\u043D\u043E:", this.todos.length);
  }
};

// src/extension.ts
var todoProvider;
function activate(context) {
  console.log("Todo List Extension \u0430\u043A\u0442\u0438\u0432\u0438\u0440\u043E\u0432\u0430\u043D");
  if (!todoProvider) {
    todoProvider = new TodoProvider();
  }
  const treeView = vscode2.window.createTreeView("todoList", { treeDataProvider: todoProvider });
  context.subscriptions.push(treeView);
  const goToTodo = vscode2.commands.registerCommand("todo-list.goToTodo", (location) => {
    vscode2.window.showTextDocument(location.uri).then((editor) => {
      const position = location.range.start;
      editor.selection = new vscode2.Selection(position, position);
      editor.revealRange(new vscode2.Range(position, position));
    });
  });
  const refreshTodoList = vscode2.commands.registerCommand("todo-list.refresh", () => {
    todoProvider.scanTodos();
  });
  context.subscriptions.push(goToTodo);
  context.subscriptions.push(refreshTodoList);
}
function deactivate() {
  console.log("Todo List Extension \u0434\u0435\u0430\u043A\u0442\u0438\u0432\u0438\u0440\u043E\u0432\u0430\u043D");
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  activate,
  deactivate
});
