import * as vscode from 'vscode';

export interface TodoItem {
    label: string;
    description: string;
    location: vscode.Location;
}

export class TodoProvider implements vscode.TreeDataProvider<TodoItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<TodoItem | undefined | void> = new vscode.EventEmitter<TodoItem | undefined | void>();
    readonly onDidChangeTreeData: vscode.Event<TodoItem | undefined | void> = this._onDidChangeTreeData.event;

    private todos: TodoItem[] = [];

    constructor() {
        console.log('Создан экземпляр TodoProvider');
        this.scanTodos();
        vscode.workspace.onDidChangeTextDocument(() => this.scanTodos());
        vscode.workspace.onDidSaveTextDocument(() => this.scanTodos());
        vscode.workspace.onDidOpenTextDocument(() => this.scanTodos());
    }

    getTreeItem(element: TodoItem): vscode.TreeItem {
        const treeItem = new vscode.TreeItem(element.label, vscode.TreeItemCollapsibleState.None);
        treeItem.description = element.description;
        treeItem.command = {
            command: 'todo-list.goToTodo',
            title: 'Go to TODO',
            arguments: [element.location]
        };
        return treeItem;
    }

    getChildren(element?: TodoItem): Thenable<TodoItem[]> {
        return Promise.resolve(this.todos);
    }

    public async scanTodos() {
        console.log('Сканирование TODO...');
        this.todos = [];
        const files = await vscode.workspace.findFiles('**/*.{js,ts,jsx,tsx,py,java,cpp,cs}', '**/node_modules/**');

        await Promise.all(files.map(async (file) => {
            const document = await vscode.workspace.openTextDocument(file);
            const text = document.getText();
            const regex = /(?:\/\/|#|\/\*)\s*TODO:\s*(.*)/g;
            let match: RegExpExecArray | null;

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
        console.log('Сканирование TODO завершено. Найдено:', this.todos.length);
    }
}
